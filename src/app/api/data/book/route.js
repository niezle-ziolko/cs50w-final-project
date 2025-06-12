import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bearerHeaders } from "utils/headers";

export async function GET(request) {
  try {
    // Get environment variables from request context
    const { env } = await getCloudflareContext({ async: true });
    const authToken = env.BOOK_AUTH;

    // Validate the request using the Bearer token
    const authResponse = bearerHeaders(request, authToken);
    if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

    // Parse the URL and get the book ID from query parameters
    const urlSearchParams = new URL(request.url);
    const id = urlSearchParams.searchParams.get("id");

    // Reference to the database (D1)
    const db = env.D1;

    let result;

    // If no ID is provided, return all books
    if (!id) {
      result = await db.prepare("SELECT * FROM books").all();

      // If no books are found, return a 404 error
      if (result.length === 0) {
        return new Response(JSON.stringify({ error: "No books found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      };

      // Return list of books as JSON
      return new Response(JSON.stringify(result.results), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      // If an ID is provided, return specific book data
      result = await db.prepare(
        `SELECT * FROM books WHERE id = "${id}"`
      ).first();

      // If no book is found for the given ID, return a 404 error
      if (!result) {
        return new Response(JSON.stringify({ error: "Book not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      };

      // Format and return specific book data as JSON
      const bookData = {
        id: result.id,
        title: result.title,
        description: result.description,
        file: result.file,
        picture: result.picture,
        author: result.author
      };

      return new Response(JSON.stringify(bookData), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    };
  } catch (error) {
    // Return an error message if there is an exception
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  };
};

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  const authToken = env.BOOK_AUTH;

  // Validate the request using the Bearer token
  const authResponse = bearerHeaders(request, authToken);
  if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

  let formData;
  try {
    // Parse the form data from the request
    formData = await request.formData();
  } catch {
    // If form data is invalid, return a 400 error
    return new Response(JSON.stringify({ error: "Invalid form data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  // Get book details from the form data
  const title = formData.get("title");
  const description = formData.get("description");
  const author = formData.get("username");
  const picture = formData.get("image");

  // Ensure all required fields are provided
  if (!title || !description || !author || !picture) {
    return new Response(JSON.stringify({ error: "All fields are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  // Reference to the database (D1)
  const db = env.D1;

  try {
    // Check if a book with the same title already exists
    const existingBook = await db.prepare(
      "SELECT id FROM books WHERE title = ?"
    ).bind(title).first();

    // If the book already exists, return a 400 error
    if (existingBook) {
      return new Response(JSON.stringify({ error: "Title book already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Generate a unique book ID and timestamp for creation
    const bookId = crypto.randomUUID();
    const dateCreated = new Date().toISOString();

    // Upload the book"s picture to R2 storage
    const imageName = `${bookId}.webp`;
    const imageKey = `final-project/book-picture/${imageName}`;
    await env.R2.put(imageKey, picture);
    const imageUrl = `https://cdn.niezleziolko.app/${imageKey}`;

    // Handle audio file uploads for the book
    const fileUrls = [];
    const files = formData.getAll("audio");
    let fileCounter = 1;

    // Upload each audio file and store its URL
    for (const file of files) {
      const fileName = `${bookId}-${fileCounter}.mp3`;
      const fileKey = `final-project/book-file/${fileName}`;
      await env.R2.put(fileKey, file);
      const fileUrl = `https://cdn.niezleziolko.app/${fileKey}`;
      fileUrls.push(fileUrl);

      fileCounter++;

      // Reset file counter if it exceeds 100
      if (fileCounter > 100) {
        fileCounter = 1;
      };
    };

    // Combine the file URLs into a string
    const fileUrlsString = fileUrls.join(",");

    // Insert the new book data into the database
    await db.prepare(
      "INSERT INTO books (id, title, description, author, picture, file, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(bookId, title, description, author, imageUrl, fileUrlsString, dateCreated).run();

    // Get user details for the author of the book
    const userResult = await db.prepare(
      "SELECT * FROM users WHERE username = ?"
    ).bind(author).first();

    // If the user is not found, return a 404 error
    if (!userResult) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Update the user"s created books list
    const existingCreated = userResult.created || "";
    const updatedCreated = existingCreated ? `${existingCreated}, ${bookId}` : bookId;

    await db.prepare(
      "UPDATE users SET created = ? WHERE id = ?"
    ).bind(updatedCreated, userResult.id).run();

    // Prepare user data for response
    const userData = {
      id: userResult.id,
      username: userResult.username,
      email: userResult.email,
      photo: userResult.photo,
      created: updatedCreated,
      currently: userResult.currently,
      liked: userResult.liked,
      expiresDate: new Date().toISOString()
    };

    // Return user data as JSON
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    // Return an error message if there is an exception
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  };
};