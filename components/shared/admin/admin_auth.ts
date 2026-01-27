"use server";

export async function verifyAdminPassword(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD;

  // DEBUG LOGS (Check these in Netlify Function Logs)
  console.log("Is ADMIN_PASSWORD defined?", !!correctPassword);
  console.log("Length of password in env:", correctPassword?.length);

  if (password === correctPassword) {
    return { success: true };
  }
  return { success: false };
}