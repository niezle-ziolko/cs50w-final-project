import { SignJWT, jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = await getCloudflareContext({ async: true });

// JWT signing/encryption key - should be in environment variables in production
function getJWTSecret() {
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

export async function convertToMp3(fileBinary, filename) {
  const apiKey = env.CAMB_AI_KEY;

  const formData = new FormData();
  formData.append("file", new File([fileBinary], filename));
  formData.append("source_language", "1");

  // 1. Sending the file
  const response = await fetch("https://client.camb.ai/apis/story", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Camb.ai upload error:", errorText);
    throw new Error(`Camb.ai upload failed: ${response.status}`);
  };

  const result = await response.json();
  const taskId = result?.task_id;

  if (!taskId) {
    console.error("Invalid Camb.ai response:", result);
    throw new Error("Camb.ai task_id not found.");
  };

  // 2. Polling status
  let runId = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch(`https://client.camb.ai/apis/story/${taskId}`, {
      headers: {
        "x-api-key": apiKey
      }
    });

    if (!statusRes.ok) {
      const errorText = await statusRes.text();

      console.error("Camb.ai status error:", errorText);
      throw new Error(`Camb.ai status check failed: ${statusRes.status}`);
    };

    const statusJson = await statusRes.json();

    if (statusJson?.status === "SUCCESS") {
      runId = statusJson?.run_id;

      break;
    } else if (statusJson?.status === "FAILED") {
      console.error("Camb.ai reported failure:", statusJson);
      throw new Error("Camb.ai conversion failed.");
    };
  };

  if (!runId) {
    console.error("Camb.ai did not return run_id after polling.");
    throw new Error("Camb.ai processing timeout or no run_id.");
  };

  // 3. Downloading the final audio
  const finalRes = await fetch(`https://client.camb.ai/apis/story-result/${runId}`, {
    headers: {
      "x-api-key": apiKey
    }
  });

  if (!finalRes.ok) {
    const errorText = await finalRes.text();

    console.error("Camb.ai result fetch error:", errorText);
    throw new Error(`Camb.ai result fetch failed: ${finalRes.status}`);
  };

  const finalJson = await finalRes.json();
  const audioUrl = finalJson?.audio_url;

  if (!audioUrl) {
    console.error("Camb.ai response missing audio_url:", finalJson);
    throw new Error("Camb.ai audio_url not found.");
  };

  return audioUrl;
};