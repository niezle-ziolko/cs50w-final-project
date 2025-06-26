import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bearerHeaders } from "utils/headers";

export async function POST(request) {
  let requestBody;
  try {
    // Parse the incoming JSON request body
    requestBody = JSON.parse(await request.text());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  const { id, username } = requestBody;

  // Validate required fields
  if (!id || !username) {
    return new Response(JSON.stringify({ error: "All fields are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  const db = env.D1;
  
  try {
    // Retrieve user"s liked items from the database
    const userQuery = await db.prepare("SELECT liked FROM users WHERE username = ?").bind(username).first();
    
    if (!userQuery) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Convert liked items from a string to an array
    const likedArray = userQuery.liked ? userQuery.liked.split(",").map(item => item.trim()) : [];
    
    // Check if the ID is already in the liked list
    if (likedArray.includes(id.toString())) {
      return new Response(JSON.stringify({ error: "ID has already been added." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Add new ID to the liked list
    likedArray.push(id.toString());
    
    const updatedLiked = likedArray.join(", ");

    // Update the user"s liked items in the database
    await db.prepare("UPDATE users SET liked = ? WHERE username = ?").bind(updatedLiked, username).run();

    // Retrieve the updated user data
    const result = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();

    if (!result) {
      return new Response(JSON.stringify({ error: "Created user not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Construct the user response object
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

export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });
  const authToken = env.CLIENT_AUTH;
  
  // Validate the request using the Bearer token
  const authResponse = bearerHeaders(request, authToken);
  if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

  let requestBody;
  try {
    // Parse the incoming JSON request body
    requestBody = JSON.parse(await request.text());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  const { id, username } = requestBody;

  // Validate required fields
  if (!id || !username) {
    return new Response(JSON.stringify({ error: "All fields are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  const db = env.D1;

  try {
    // Retrieve user"s liked items from the database
    const userQuery = await db.prepare("SELECT liked FROM users WHERE username = ?").bind(username).first();
    
    if (!userQuery) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Remove the specified ID from the liked list
    const likedArray = userQuery.liked ? userQuery.liked.split(", ").filter(likedId => likedId !== id) : [];

    if (likedArray.length === userQuery.liked.split(", ").length) {
      return new Response(JSON.stringify({ error: "ID not found in liked." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    const updatedLiked = likedArray.join(", ");

    // Update the user"s liked items in the database
    await db.prepare("UPDATE users SET liked = ? WHERE username = ?").bind(updatedLiked, username).run();

    // Retrieve the updated user data
    const result = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();

    if (!result) {
      return new Response(JSON.stringify({ error: "Created user not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    };

    // Construct the user response object
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