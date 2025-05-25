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