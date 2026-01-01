import { NextResponse } from "next/server";

/**
 * Validates admin password securely on the server.
 * Never exposed to the client.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body: { password?: string } = await request.json();

  const adminPassword: string | undefined = process.env.AdminPassword;

  if (!adminPassword) {
    return NextResponse.json(
      { success: false, error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  if (body.password !== adminPassword) {
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
