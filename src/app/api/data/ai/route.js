import { getRequestContext } from "@cloudflare/next-on-pages";
import { bearerHeaders } from "utils/headers";

import * as googleTTS from "google-tts-api";

export async function POST(request) {
  try {
    // Get environment variables from the request context
    const { env } = getRequestContext();
    const authToken = getRequestContext().env.BOOK_AUTH;
    
    // Validate the request using the Bearer token
    const authResponse = bearerHeaders(request, authToken);
    if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

    let formData;
    try {
      // Parse form data from the request
      formData = await request.formData();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid form data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Extract required fields from form data
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

    const db = env.D1;

    // Check if a book with the same title already exists
    const existingBook = await db.prepare("SELECT id FROM books WHERE title = ?").bind(title).first();
    if (existingBook) {
      return new Response(JSON.stringify({ error: "Title book already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Generate a unique book ID and timestamp
    const bookId = crypto.randomUUID();
    const dateCreated = new Date().toISOString();

    // Store the book image in R2 storage
    const imageName = `${bookId}.webp`;
    const imageKey = `final-project/book-picture/${imageName}`;
    await env.R2.put(imageKey, picture);
    const imageUrl = `https://cdn.niezleziolko.app/${imageKey}`;

    // Extract and validate uploaded text files
    const files = [...formData.entries()]
      .filter(([key, file]) => file instanceof File && file.name.endsWith(".txt"))
      .map(([key, file]) => file);

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: "No .txt files uploaded." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    const audioUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const chapterNumber = i + 1;
      
      // Convert text to speech using Google TTS
      const audioData = googleTTS.getAllAudioUrls(text, {
        lang: "en",
        slow: false,
        host: "https://translate.google.com",
        splitPunct: "`"
      });

      // Fetch audio buffers for the generated audio URLs
      const audioBuffers = await Promise.all(
        audioData.map(({ url }) => fetch(url).then(res => res.arrayBuffer()))
      );

      // Combine audio buffers into a single Uint8Array
      const combinedAudioBuffer = new Uint8Array(
        audioBuffers.reduce((acc, buffer) => acc.concat(Array.from(new Uint8Array(buffer))), [])
      );

      // Store the audio file in R2 storage
      const fileName = `final-project/book-file/${bookId}-${chapterNumber}.mp3`;
      await env.R2.put(fileName, combinedAudioBuffer);
      const fileUrl = `https://cdn.niezleziolko.app/${fileName}`;
      audioUrls.push(fileUrl);
    };

    const fileUrlsString = audioUrls.join(",");

    // Insert book details into the database
    await db.prepare(
      "INSERT INTO books (id, title, description, author, picture, file, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(bookId, title, description, author, imageUrl, fileUrlsString, dateCreated).run();

    // Retrieve user information from the database
    const userResult = await db.prepare(
      "SELECT * FROM users WHERE username = ?"
    ).bind(author).first();

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

// Define the runtime environment as Edge Workers
export const runtime = "edge";