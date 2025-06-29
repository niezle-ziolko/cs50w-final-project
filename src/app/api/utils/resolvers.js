import { v4 as uuidv4 } from "uuid";
import { GraphQLError } from "graphql";

import { bearerHeader, authenticateHeader } from "./headers";
import { signJWT, hashPassword, generateSpeechFromText } from "./utils";

export const resolvers = {
  Query: {
    books: async (_, { id }, context) => {
      const { db, auth } = context;
        
      // Authenticate user using JWT token
      await authenticateHeader(auth);

      if (!id) {
        const result = await db.prepare("SELECT * FROM books").all();

        if (!result?.results?.length) {
          throw new Error("No books found");
        };

        return result.results;
      };

      const result = await db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first();

      if (!result) {
        throw new Error("Book not found");
      };

      return [result];
    },

    me: async (_, args, context) => {
      try {
        const { db, auth } = context;
        
        // Authenticate user using JWT token
        const userData = await authenticateHeader(auth);
        
        // Retrieve fresh user information from the database
        const result = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userData.id).first();

        if (!result) {
          throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
        };

        // Return user data
        return {
          id: result.id,
          username: result.username,
          email: result.email,
          photo: result.photo,
          created: result.created,
          currently: result.currently,
          liked: result.liked,
          expiresDate: userData.expiresDate
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        };

        throw new GraphQLError(error.message, { extensions: { code: "INTERNAL_ERROR" } });
      };
    }
  },

  Mutation: {
    createBook: async (_, { input }, context) => {
      try {
        const { db, env } = context;
        const { title, description, username, imageBase64, audioFilesBase64, ai } = input;

        // Walidacje podstawowe
        if (!title?.trim()) throw new GraphQLError("Title is required.", { extensions: { code: "BAD_USER_INPUT" } });
        if (!description?.trim()) throw new GraphQLError("Description is required.", { extensions: { code: "BAD_USER_INPUT" } });
        if (!username?.trim()) throw new GraphQLError("Username is required.", { extensions: { code: "BAD_USER_INPUT" } });
        if (!imageBase64?.trim()) throw new GraphQLError("Image is required.", { extensions: { code: "BAD_USER_INPUT" } });
        if (!audioFilesBase64 || !Array.isArray(audioFilesBase64) || audioFilesBase64.length === 0) {
          throw new GraphQLError(ai ? "At least one text file is required." : "At least one audio file is required.", {
            extensions: { code: "BAD_USER_INPUT" }
          });
        }

        const userResult = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
        if (!userResult) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });

        const existingBook = await db.prepare("SELECT id FROM books WHERE title = ?").bind(title.trim()).first();
        if (existingBook) throw new GraphQLError("Title already exists", { extensions: { code: "BAD_REQUEST" } });

        const bookId = uuidv4();
        const dateCreated = new Date().toISOString();

        // Upload image
        const imageBuffer = Buffer.from(imageBase64, "base64");
        const imageKey = `images/books/${bookId}.webp`;
        await env.R2.put(imageKey, imageBuffer);
        const imageUrl = `https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/${imageKey}`;

        // Przetwarzanie plików audio lub tekstowych
        const fileUrls = [];

        for (let i = 0; i < audioFilesBase64.length && i < 100; i++) {
          const base64 = audioFilesBase64[i];
          if (!base64?.trim()) continue;

          let audioBuffer;

          if (ai) {
            // AI: konwersja tekstu do mowy
            try {
              const textContent = Buffer.from(base64, "base64").toString("utf-8");
              audioBuffer = await generateSpeechFromText(textContent);
            } catch (err) {
              console.error(`AI audio generation failed for file ${i + 1}:`, err);
              continue;
            }
          } else {
            // Zwykły plik audio
            try {
              audioBuffer = Buffer.from(base64, "base64");
            } catch (err) {
              console.error(`Base64 decoding failed for audio ${i + 1}:`, err);
              continue;
            }
          }

          try {
            const fileName = `${bookId}-${i + 1}.mp3`;
            const fileKey = `file/books/${fileName}`;
            await env.R2.put(fileKey, audioBuffer);
            const fileUrl = `https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/${fileKey}`;
            fileUrls.push(fileUrl);
          } catch (uploadErr) {
            console.error(`Upload failed for file ${i + 1}:`, uploadErr);
          }
        }

        if (fileUrls.length === 0) {
          throw new GraphQLError("No valid files were processed.", { extensions: { code: "BAD_USER_INPUT" } });
        }

        const fileUrlsString = fileUrls.join(",");

        // Zapis do bazy danych
        await db.prepare(`
      INSERT INTO books (id, title, description, author, picture, file, date, ai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(bookId, title.trim(), description.trim(), username, imageUrl, fileUrlsString, dateCreated, !!ai).run();

        const updatedCreated = userResult.created ? `${userResult.created}, ${bookId}` : bookId;
        await db.prepare("UPDATE users SET created = ? WHERE id = ?").bind(updatedCreated, userResult.id).run();

        const token = await signJWT({
          id: userResult.id,
          username: userResult.username,
          email: userResult.email,
          photo: userResult.photo,
          created: userResult.created,
          currently: userResult.currently,
          liked: userResult.liked,
          expiresDate: new Date().toISOString()
        });

        return { data: token };
      } catch (error) {
        console.error("CreateBook error:", error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(error.message || "Unknown error occurred", { extensions: { code: "INTERNAL_ERROR" } });
      }
    }
    ,

    loginUser: async (_, { credentials }, context) => {
      try {
        const { db, auth, ip, env } = context;

        // Authenticate user using Cloudflare Turnstile token
        await bearerHeader(auth, ip, env);

        const { username, password } = credentials;

        // Ensure both username and password are provided
        if (!username || !password) {
          throw new GraphQLError("Invalid credentials format", { extensions: { code: "BAD_USER_INPUT" } });
        };

        // Retrieve user information from the database
        const result = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();

        if (!result) {
          throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
        };

        // Verify password hash
        const storedHashedPassword = result.password;
        const enteredHashedPassword = await hashPassword(password);

        if (storedHashedPassword !== enteredHashedPassword) {
          throw new GraphQLError("Invalid credentials", { extensions: { code: "UNAUTHENTICATED" } });
        };

        const userData = {
          id: result.id,
          username: result.username,
          email: result.email,
          photo: result.photo,
          created: result.created,
          currently: result.currently,
          liked: result.liked,
          expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };

        // Sign the message data payload into a JWT token
        const token = await signJWT(userData);

        // Return the JWT token containing the information
        return { data: token };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        };

        throw new GraphQLError(error.message, { extensions: { code: "INTERNAL_ERROR" } });
      };
    },

    registerUser: async (_, { credentials }, context) => {
      try {
        const { db, auth, ip, env } = context;

        // Authenticate user using Cloudflare Turnstile token
        await bearerHeader(auth, ip, env);

        const { username, email, password } = credentials;

        // Validate input fields
        if (!username || !email || !password) {
          throw new GraphQLError("All fields are required", { extensions: { code: "BAD_USER_INPUT" } });
        };
        
        // Check if user already exists
        const existingUser = await db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").bind(email, username).first();

        if (existingUser) {
          throw new GraphQLError("Email or username already exists", { extensions: { code: "BAD_USER_INPUT" } });
        };

        // Generate a unique UUID
        const userId = uuidv4();
        const hashedPassword = await hashPassword(password);
        const defaultPhotoUrl = "https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/images/users/default-profile-picture.webp";
        
        // Insert new user into database
        await db.prepare("INSERT INTO users (id, username, email, password, photo) VALUES (?, ?, ?, ?, ?)").bind(userId, username, email, hashedPassword, defaultPhotoUrl).run();

        // Retrieve newly created user
        const result = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

        if (!result) {
          throw new GraphQLError("Created user not found", { extensions: { code: "INTERNAL_ERROR" } });
        };

        const userData = {
          id: result.id,
          username: result.username,
          email: result.email,
          photo: result.photo,
          created: result.created,
          currently: result.currently,
          liked: result.liked,
          expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };

        // Sign the message data payload into a JWT token
        const token = await signJWT(userData);

        // Return the JWT token containing the information
        return { data: token };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        };

        throw new GraphQLError(error.message, { extensions: { code: "INTERNAL_ERROR" } });
      };
    },

    updateUser: async (_, { credentials }, context) => {
      try {
        const { db, auth, env } = context;

        // Authenticate user using JWT token
        const authenticatedUser = await authenticateHeader(auth);
    
        const { username, email, password, photo } = credentials;

        // Use authenticated user"s username if not provided in input
        const targetUsername = username || authenticatedUser.username;

        // Validate username format
        if (!targetUsername || typeof targetUsername !== "string" || !targetUsername.match(/^[a-zA-Z0-9_-]{3,20}$/)) {
          throw new GraphQLError("Invalid username", { extensions: { code: "BAD_USER_INPUT" } });
        };

        // Check if authenticated user is trying to update their own profile
        if (targetUsername !== authenticatedUser.username) {
          throw new GraphQLError("You can only update your own profile", { extensions: { code: "FORBIDDEN" } });
        };

        const user = await db.prepare("SELECT * FROM users WHERE username = ?").bind(targetUsername).first();

        if (!user) {
          throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
        };

        const updates = [];
        const params = [];

        // Check for email updates
        if (email && email !== user.email) {
          if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new GraphQLError("Invalid email format", { extensions: { code: "BAD_USER_INPUT" } });
          };

          const emailExists = await db.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
          if (emailExists) {
            throw new GraphQLError("Email already in use", { extensions: { code: "BAD_USER_INPUT" } });
          };

          updates.push("email = ?");
          params.push(email);
        };

        if (password) {
          const hashedPassword = await hashPassword(password);
          updates.push("password = ?");
          params.push(hashedPassword);
        };

        // Handle photo upload to R2
        let photoUrl = user.photo; // Keep existing photo by default
    
        if (photo) {      
          try {
            // Validate if photo is a valid base64 image
            let imageData;
            let mimeType;
            let fileExtension;
        
            if (typeof photo === "string" && photo.startsWith("data:image/")) {
          
              // Handle base64 encoded image
              const matches = photo.match(/^data:image\/([a-zA-Z0-9]+);base64,(.*)$/);
          
              if (!matches || matches.length !== 3) {
                throw new GraphQLError("Invalid base64 image format", { extensions: { code: "BAD_USER_INPUT" } });
              };
          
              mimeType = `image/${matches[1]}`;
              fileExtension = matches[1] === "jpeg" ? "jpg" : matches[1];
          
              try {
                imageData = new Uint8Array(Buffer.from(matches[2], "base64"));
              } catch (bufferError) {
                throw new GraphQLError("Invalid base64 data", { extensions: { code: "BAD_USER_INPUT" } });
              };
            } else {
              throw new GraphQLError("Photo must be a base64 encoded image", { extensions: { code: "BAD_USER_INPUT" } });
            };

            // Validate image type
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!allowedTypes.includes(mimeType)) {
              throw new GraphQLError("Unsupported image format. Allowed: JPEG, PNG, WebP", { extensions: { code: "BAD_USER_INPUT" } });
            };

            // Validate image size (max 10MB for base64)
            if (imageData.length > 10 * 1024 * 1024) {
              throw new GraphQLError("Image too large. Maximum size: 10MB", { extensions: { code: "BAD_USER_INPUT" } });
            };

            // Generate unique filename
            const randomString = uuidv4();
            const fileName = `${randomString}.${fileExtension}`;
            const imageKey = `images/users/${fileName}`;


            // Upload to Cloudflare R2
            if (!env?.R2) {
              throw new GraphQLError("R2 storage not configured", { extensions: { code: "INTERNAL_ERROR" } });
            };

            await env.R2.put(imageKey, imageData, {
              httpMetadata: {
                contentType: mimeType,
              },
            });

            // Generate public URL
            photoUrl = `https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/${imageKey}`;

            // If user had an old photo, optionally delete it from R2
            if (user.photo && user.photo.startsWith("https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/")) {
              const oldKey = user.photo.replace("https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/", "");

              try {
                await env.R2.delete(oldKey);
              } catch (deleteError) {
                console.warn("Failed to delete old photo:", deleteError);
              };
            };

          } catch (uploadError) {
            console.error("Photo upload error details:", {
              message: uploadError.message,
              stack: uploadError.stack,
              name: uploadError.name,
              code: uploadError.code
            });
        
            if (uploadError instanceof GraphQLError) {
              throw uploadError;
            };

            throw new GraphQLError(`Photo upload failed: ${uploadError.message}`, { extensions: { code: "INTERNAL_ERROR" } });
          };
        };

        // Update photo in database if it changed
        if (photoUrl !== user.photo) {
          updates.push("photo = ?");
          params.push(photoUrl);
        };

        // Apply updates to database if there are any
        if (updates.length > 0) {
          params.push(targetUsername);
          await db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE username = ?`).bind(...params).run();
        };

        // Return updated user data
        const updatedUser = await db.prepare("SELECT * FROM users WHERE username = ?").bind(targetUsername).first();

        const userData = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          photo: updatedUser.photo,
          created: updatedUser.created,
          currently: updatedUser.currently,
          liked: updatedUser.liked,
          expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };

        // Sign the message data payload into a JWT token
        const token = await signJWT(userData);

        // Return the JWT token containing the message information
        return { data: token };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        };

        throw new GraphQLError(error.message, { extensions: { code: "INTERNAL_ERROR" } });
      };
    },

    addLike: async (_, args, context) => {
      const { bookId, userId } = args;
      const { db, auth, ip, env } = context;

      // Authenticate user using JWT token
      await authenticateHeader(auth, ip, env);

      const userQuery = await db.prepare("SELECT liked FROM users WHERE id = ?").bind(userId).first();
      if (!userQuery) throw new Error("User not found.");

      const likedArray = userQuery.liked ? userQuery.liked.split(",").map(item => item.trim()) : [];

      if (likedArray.includes(bookId.toString())) {
        throw new Error("Like has already been added.");
      };

      likedArray.push(bookId.toString());
      const updatedLiked = likedArray.join(", ");

      await db.prepare("UPDATE users SET liked = ? WHERE id = ?").bind(updatedLiked, userId).run();

      const result = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      if (!result) throw new Error("Updated user not found.");

      const userData = {
        id: result.id,
        username: result.username,
        email: result.email,
        photo: result.photo,
        created: result.created,
        currently: result.currently,
        liked: result.liked,
        expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };

      // Sign the message data payload into a JWT token
      const token = await signJWT(userData);

      // Return the JWT token containing the message information
      return { data: token };
    },

    removeLike: async (_, args, context) => {
      const { bookId, userId } = args;
      const { db, auth, ip, env } = context;

      // Authenticate user using JWT token
      await authenticateHeader(auth, ip, env);

      const userQuery = await db.prepare("SELECT liked FROM users WHERE id = ?").bind(userId).first();
      if (!userQuery) throw new Error("User not found.");

      const likedArray = userQuery.liked ? userQuery.liked.split(",").map(item => item.trim()).filter(likedId => likedId !== bookId.toString()) : [];

      if (likedArray.length === userQuery.liked.split(",").length) {
        throw new Error("Book not found in liked.");
      }

      const updatedLiked = likedArray.join(", ");

      await db.prepare("UPDATE users SET liked = ? WHERE id = ?").bind(updatedLiked, userId).run();

      const result = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      if (!result) throw new Error("Updated user not found.");

      const userData = {
        id: result.id,
        username: result.username,
        email: result.email,
        photo: result.photo,
        created: result.created,
        currently: result.currently,
        liked: result.liked,
        expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };

      // Sign the message data payload into a JWT token
      const token = await signJWT(userData);

      // Return the JWT token containing the message information
      return { data: token };
    }
  }
};