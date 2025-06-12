export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
};

export async function decryptData(encryptedData, iv) {
  const SECRET_KEY = getRequestContext().env.CRYPTO_KEY;
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET_KEY), { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(Buffer.from(iv, "base64")) }, keyMaterial, new Uint8Array(Buffer.from(encryptedData, "base64")));

  return JSON.parse(new TextDecoder().decode(decrypted));
};