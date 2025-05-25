import { getRequestContext } from "@cloudflare/next-on-pages";
import { corsHeaders, bearerHeaders } from "utils/headers";

export async function POST(request) {
  try {
    // Get environment variables from the request context
    const authToken = getRequestContext().env.CHALLENGE_AUTH;

    // Validate the request using the Bearer token
    const authResponse = bearerHeaders(request, authToken);
    if (authResponse) return authResponse; // If authentication fails, return the response and stop execution

    const req = request;

    // Extract the token from the request body
    const { token } = await req.json();

    // Retrieve the client"s IP address from the `x-forwarded-for` header
    const clientIps = req.headers.get("x-forwarded-for")?.split(/\s*,\s*/) || [""];
    const ip = clientIps[0];

    // If the token is missing, return a 400 Bad Request response
    if (!token) {
      return new Response(JSON.stringify({ operation: false, error: "Missing required variables." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    } 
    // Handle preflight OPTIONS request for CORS
    else if (req.method === "OPTIONS") {
      return new Response(JSON.stringify({ operation: true, response: "ok" }), {
        status: 200,
        headers: corsHeaders
      });
    };

    // Create a FormData object with required data for Cloudflare Turnstile verification
    let formData = new FormData();
    formData.append("secret", getRequestContext().env.SECRET_KEY || ""); // Private key
    formData.append("response", token); // User-provided token
    formData.append("remoteip", ip); // User"s IP address

    // Cloudflare Turnstile verification API endpoint
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    // Send a request to Cloudflare Turnstile API
    const result = await fetch(url, {
      body: formData,
      method: "POST"
    });

    // Parse the API response as JSON
    const response = await result.json();
    console.log(response); // Debugging the response

    // If verification is successful, return a success response
    if (response.success) {
      return new Response(JSON.stringify({ operation: true, response: "success" }), {
        status: 200,
        headers: corsHeaders
      });
    };

    // If verification fails, return a generic response
    return new Response(JSON.stringify({ operation: true, response: "true" }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    // Handle errors – return a 500 Internal Server Error response
    return new Response(JSON.stringify({ operation: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  };
};

// Define the runtime environment as Edge Workers
export const runtime = "edge";