// app/api/admin/auth/route.ts

import { NextResponse } from "next/server";

/**
 * Server-only admin authentication endpoint.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body: { password?: string } = await request.json();

  const adminPassword: string | undefined = process.env.AdminPassword;

  if (!adminPassword) {
    return NextResponse.json(
      { success: false, error: "Admin password not configured" },
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
