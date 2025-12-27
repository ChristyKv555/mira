import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

/**
 * Google OAuth 2.0 scopes
 */
export const GOOGLE_SCOPES = {
  calendar: ["https://www.googleapis.com/auth/calendar.readonly"],
  gmail: ["https://www.googleapis.com/auth/gmail.readonly"],
  both: [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/gmail.readonly",
  ],
} as const;

/**
 * Get Google OAuth client configuration
 */
function getOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Google OAuth configuration. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables."
    );
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/**
 * Generate OAuth URL and redirect user to Google consent screen
 */
export function initiateOAuth(
  platform: "google-calendar" | "google-mail",
  state?: string
): string {
  const oauth2Client = getOAuthClient();

  // Determine scopes based on platform
  const scopes =
    platform === "google-calendar"
      ? GOOGLE_SCOPES.calendar
      : platform === "google-mail"
        ? GOOGLE_SCOPES.gmail
        : GOOGLE_SCOPES.both;

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Request refresh token
    scope: [...scopes], // Convert readonly array to mutable array
    prompt: "consent", // Force consent screen to get refresh token
    state: state || undefined, // CSRF protection
  });

  return authUrl;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function handleOAuthCallback(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  scope: string | null;
  idToken?: string;
}> {
  const oauth2Client = getOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("Failed to obtain access token");
    }

    // Calculate expiration time (default to 1 hour if not provided)
    const expiresIn = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: expiresIn,
      scope: tokens.scope || null,
      idToken: tokens.id_token || undefined,
    };
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    throw new Error("Failed to exchange authorization code for tokens");
  }
}

/**
 * Refresh an expired access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const oauth2Client = getOAuthClient();

  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    const expiresAt = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    return {
      accessToken: credentials.access_token,
      expiresAt,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

/**
 * Revoke OAuth tokens
 */
export async function revokeToken(token: string): Promise<void> {
  const oauth2Client = getOAuthClient();

  try {
    await oauth2Client.revokeToken(token);
  } catch (error) {
    console.error("Error revoking token:", error);
    throw new Error("Failed to revoke token");
  }
}

/**
 * Get authenticated Google API client
 */
export function getAuthenticatedClient(
  accessToken: string,
  refreshToken?: string | null
): OAuth2Client {
  const oauth2Client = getOAuthClient();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
  });

  return oauth2Client;
}

/**
 * Get Google Calendar API client
 */
export function getCalendarClient(
  accessToken: string,
  refreshToken?: string | null
) {
  const auth = getAuthenticatedClient(accessToken, refreshToken);
  return google.calendar({ version: "v3", auth });
}

/**
 * Get Gmail API client
 */
export function getGmailClient(
  accessToken: string,
  refreshToken?: string | null
) {
  const auth = getAuthenticatedClient(accessToken, refreshToken);
  return google.gmail({ version: "v1", auth });
}
