import { refreshAccessToken } from "./oauth";

export interface TokenMetadata {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string; // ISO string
  scope?: string | null;
}

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 */
export function isTokenExpired(tokenMetadata: TokenMetadata): boolean {
  const expiresAt = new Date(tokenMetadata.expiresAt);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

  return expiresAt.getTime() - now.getTime() < bufferTime;
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(
  tokenMetadata: TokenMetadata
): Promise<{
  accessToken: string;
  expiresAt: Date;
  wasRefreshed: boolean;
}> {
  // If token is still valid, return it
  if (!isTokenExpired(tokenMetadata)) {
    return {
      accessToken: tokenMetadata.accessToken,
      expiresAt: new Date(tokenMetadata.expiresAt),
      wasRefreshed: false,
    };
  }

  // Token is expired, refresh it
  if (!tokenMetadata.refreshToken) {
    throw new Error(
      "Token expired and no refresh token available. User needs to re-authenticate."
    );
  }

  try {
    const refreshed = await refreshAccessToken(tokenMetadata.refreshToken);

    return {
      accessToken: refreshed.accessToken,
      expiresAt: refreshed.expiresAt,
      wasRefreshed: true,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error(
      "Failed to refresh access token. User may need to re-authenticate."
    );
  }
}

/**
 * Refresh token if needed and return updated metadata
 */
export async function refreshTokenIfNeeded(
  tokenMetadata: TokenMetadata
): Promise<TokenMetadata | null> {
  if (!isTokenExpired(tokenMetadata)) {
    return null; // No refresh needed
  }

  if (!tokenMetadata.refreshToken) {
    throw new Error("No refresh token available");
  }

  const refreshed = await refreshAccessToken(tokenMetadata.refreshToken);

  return {
    ...tokenMetadata,
    accessToken: refreshed.accessToken,
    expiresAt: refreshed.expiresAt.toISOString(),
  };
}

