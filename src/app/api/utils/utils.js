import { SignJWT, jwtVerify } from "jose";
import { SpeechifyClient } from "@speechify/api";
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

export async function generateSpeechFromText(text) {
  const client = new SpeechifyClient({ token: env.SPEECHIFY_API_KEY });

  try {
    const response = await client.tts.audio.speech({
      input: text,
      voiceId: "your_voice_id"
    });

    const audioBase64 = response.audioContent;

    return Buffer.from(audioBase64, "base64");
  } catch (err) {
    throw new Error(`Speechify TTS failed: ${err.message}`);
  };
};