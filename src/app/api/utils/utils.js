import { GraphQLError } from "graphql";
import { SignJWT, jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = await getCloudflareContext({ async: true });

// JWT signing/encryption key - should be in environment variables in production
const getJWTSecret = () => {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment");
  };

  return new TextEncoder().encode(secret); // must be 256-bit (32 bytes)
};

// Function to create JWT using jose library
export async function signJWT(payload) {
  const secret = getJWTSecret();

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return jwt;
};

/**
 * Verify JWT token and return payload
 */
export async function verifyJWT(token) {
  try {
    const secret = getJWTSecret();
    
    const { payload } = await jwtVerify(token, secret);
    
    // Check if token is expired (additional check)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("Token expired");
    };
    
    return payload;
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      throw new Error("Token expired");
    };

    throw new Error(`Invalid token: ${error.message}`);
  };
};

/**
 * Helper function to authenticate user from JWT token
 */
export async function authenticateUser(authHeader) {
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

/**
 * Hash password using Web Crypto API
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
};

export async function decryptData(encryptedData, iv) {
  const SECRET_KEY = env.CRYPTO_KEY;
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET_KEY), { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(Buffer.from(iv, "base64")) }, keyMaterial, new Uint8Array(Buffer.from(encryptedData, "base64")));

  return JSON.parse(new TextDecoder().decode(decrypted));
};