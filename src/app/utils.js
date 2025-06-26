import { jwtVerify } from "jose";

export async function encryptCredentials(data) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.NEXT_PUBLIC_HASH_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));

  const encryptedData = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyMaterial, encodedData);

  return {
    encrypted: Buffer.from(new Uint8Array(encryptedData)).toString("base64"),
    iv: Buffer.from(iv).toString("base64")
  };
};

export async function decryptUser(encryptedUser) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload } = await jwtVerify(encryptedUser, secret);

    if (!payload.id || !payload.email || !payload.photo) {
      throw new Error("Invalid token payload structure");
    };

    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      photo: payload.photo,
      created: payload.created ?? null,
      currently: payload.currently ?? null,
      liked: payload.liked,
      expiresDate: payload.expiresDate
    };
  } catch (error) {
    console.error("Decryption User error:", error);
    throw new Error("Incorrect user token");
  };
};