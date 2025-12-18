import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/database/auth";
import { getUserById } from "@/database/queries";

// GET /api/user/[id] - Get user by ID (for authenticated requests)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await getCurrentUser();

    if (!authenticatedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can only view their own profile
    if (authenticatedUser.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
