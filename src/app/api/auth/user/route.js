import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bearerHeaders } from "utils/headers";
import { hashPassword } from "utils/utils";

export async function GET(request) {
  try {
    // Get environment variables from the request context
    const { env } = await getCloudflareContext({ async: true });
    const authToken = env.CLIENT_AUTH;
   
    // Validate the request using the Bearer token
    const authResponse = bearerHeaders(request, authToken);
    if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

    const credentialsHeader = request.headers.get("Credentials");

    // Validate if credentials are provided
    if (!credentialsHeader) {
      return new Response(JSON.stringify({ error: "Missing credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    let decodedCredentials;
    try {
      // Decode Base64 credentials
      decodedCredentials = Buffer.from(credentialsHeader, "base64").toString("utf-8");
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid Base64 encoding" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    const [username, password] = decodedCredentials.split(":");

    // Ensure both username and password are provided
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Invalid credentials format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    const db = env.D1;

    // Retrieve user information from the database
    const result = await db.prepare(
      `SELECT * FROM users WHERE username = "${username}"`
    ).first();

    if (!result) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Verify password hash
    const storedHashedPassword = result.password;
    const enteredHashedPassword = await hashPassword(password);

    if (storedHashedPassword !== enteredHashedPassword) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Construct user data response
    const userData = {
      id: result.id,
      username: result.username,
      email: result.email,
      photo: result.photo,
      created: result.created,
      currently: result.currently,
      liked: result.liked,
      expiresDate: new Date().toISOString()
    };

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  };
};

export async function POST(request) {
  // Get environment variables from the request context
  const { env } = await getCloudflareContext({ async: true });
  const authToken = env.CLIENT_AUTH;

  // Validate the request using the Bearer token
  const authResponse = bearerHeaders(request, authToken);
  if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

  let requestBody;
  try {
    requestBody = JSON.parse(await request.text());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  const { username, email, password } = requestBody;

  // Validate input fields
  if (!username || !email || !password) {
    return new Response(JSON.stringify({ error: "All fields are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  const db = env.D1;
  
  try {
    // Check if user already exists
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE email = ? OR username = ?"
    ).bind(email, username).first();

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email or username already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Generate user ID and hash password
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const defaultPhotoUrl = "https://cdn.niezleziolko.app/final-project/profile-photo/default-profile-picture.webp";
    
    // Insert new user into database
    await db.prepare(
      "INSERT INTO users (id, username, email, password, photo) VALUES (?, ?, ?, ?, ?)"
    ).bind(userId, username, email, hashedPassword, defaultPhotoUrl).run();

    // Retrieve newly created user
    const result = await db.prepare(
      `SELECT * FROM users WHERE id = "${userId}"`
    ).first();

    if (!result) {
      return new Response(JSON.stringify({ error: "Created user not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Construct user data response
    const userData = {
      id: result.id,
      username: result.username,
      email: result.email,
      photo: result.photo,
      created: result.created,
      currently: result.currently,
      liked: result.liked,
      expiresDate: new Date().toISOString()
    };

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  };
};

export async function PUT(request) {
  try {
    // Get environment variables from the request context
    const { env } = await getCloudflareContext({ async: true });
    const authToken = env.CLIENT_AUTH;

    // Validate the request using the Bearer token
    const authResponse = bearerHeaders(request, authToken);
    if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

    const formData = await request.formData();
    const { username, email, password, confirmPassword, photo } = Object.fromEntries(formData);

    // Validate username format
    if (!username || typeof username !== "string" || !username.match(/^[a-zA-Z0-9_-]{3,20}$/)) {
      return new Response(JSON.stringify({ error: "Invalid username" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    };

    const db = env.D1;
    const user = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    };

    const updates = [];
    const params = [];

    // Check for email updates
    if (email && email !== user.email) {
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return new Response(JSON.stringify({ error: "Invalid email format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      };

      const emailExists = await db.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
      if (emailExists) {
        return new Response(JSON.stringify({ error: "Email already in use" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      };

      updates.push("email = ?");
      params.push(email);
    };

    // Check for password updates
    if (password && password !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Passwords do not match" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    };

    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push("password = ?");
      params.push(hashedPassword);
    };

    // Apply updates to database
    params.push(username);
    await db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE username = ?`).bind(...params).run();

    return new Response(JSON.stringify({ message: "Profile updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  };
};

