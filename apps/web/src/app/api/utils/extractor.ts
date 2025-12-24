import { type NextRequest } from "next/server";

export interface UserData {
  userId: string;
  email: string;
}

export function extractUserData(request: NextRequest): UserData | null {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email") || "";

  // userId is required for authentication
  if (!userId) {
    return null;
  }

  return {
    userId,
    email,
  };
}

export function extractUserDataOrThrow(request: NextRequest): UserData {
  const userData = extractUserData(request);

  if (!userData) {
    throw new Error("Unauthorized: User data not found in request headers");
  }

  return userData;
}
