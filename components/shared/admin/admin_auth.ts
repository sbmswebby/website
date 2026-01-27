"use server";

export async function verifyAdminPassword(password: string) {
  // Accesses the server-side environment variable
  const ADMIN_PASS = process.env.ADMIN_PASSWORD;

  if (password === ADMIN_PASS) {
    return { success: true };
  }
  return { success: false };
}