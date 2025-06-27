import { GraphQLError } from "graphql";

import { verifyJWT } from "./utils";

export function bearerHeaders(request, authToken) {
  const authorizationHeader = request.headers.get("Authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith(`Bearer ${authToken}`)) {
    return new Response(JSON.stringify({ operation: false, error: "No authorization." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  };

  return null;
};

export async function bearerHeader(auth, clientIps, env){
  // Extract token from Bearer format
  let token = null;
  if (auth && auth.startsWith("Bearer ")) {
    token = auth.substring(7); // Remove "Bearer " prefix
  };
  
  const ip = clientIps[0];

  // If the token is missing, return a 400 Bad Request response
  if (!token) throw new Error("Unauthorized");

  // Create a FormData object with required data for Cloudflare Turnstile verification
  let formData = new FormData();
  formData.append("secret", env.SECRET_KEY || ""); // Private key
  formData.append("response", token); // User-provided token
  formData.append("remoteip", ip); // User"s IP address

  // Cloudflare Turnstile verification API endpoint
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  // Send a request to Cloudflare Turnstile API
  const result = await fetch(url, {
    body: formData,
    method: "POST"
  });

  // Check if the response status is not 200
  if (result.status !== 200) {
    throw new Error(`Turnstile request failed with status: ${result.status}`);
  };

  // Parse the API response as JSON
  const response = await result.json();
  console.log(response); // Debugging the response
};

/**
 * Helper function to authenticate user from JWT token
 */
export async function authenticateHeader(authHeader) {
  if (!authHeader) {
    throw new GraphQLError("Authentication token required", { extensions: { code: "UNAUTHENTICATED" } });
  };

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  
  if (!token) {
    throw new GraphQLError("Invalid authorization header format", { extensions: { code: "UNAUTHENTICATED" } });
  };

  try {
    const userData = await verifyJWT(token);

    return userData;
  } catch (error) {
    throw new GraphQLError("Invalid or expired token", { extensions: { code: "UNAUTHENTICATED" } });
  };
};