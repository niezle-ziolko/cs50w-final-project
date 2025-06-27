import { jwtVerify } from "jose";

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