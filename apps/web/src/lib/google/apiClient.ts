import { getCalendarClient, getGmailClient } from "./oauth";
import { getValidAccessToken, type TokenMetadata } from "./tokenManager";

/**
 * Google API client wrapper with automatic token refresh
 */
export class GoogleApiClient {
  private tokenMetadata: TokenMetadata;

  constructor(tokenMetadata: TokenMetadata) {
    this.tokenMetadata = tokenMetadata;
  }

  /**
   * Update token metadata (useful after refresh)
   */
  updateTokens(tokenMetadata: TokenMetadata) {
    this.tokenMetadata = tokenMetadata;
  }

  /**
   * Get Calendar API client with valid token
   */
  async getCalendarClient() {
    const { accessToken, expiresAt, wasRefreshed } =
      await getValidAccessToken(this.tokenMetadata);

    // Update metadata if token was refreshed
    if (wasRefreshed) {
      this.tokenMetadata = {
        ...this.tokenMetadata,
        accessToken,
        expiresAt: expiresAt.toISOString(),
      };
    }

    return getCalendarClient(
      accessToken,
      this.tokenMetadata.refreshToken
    );
  }

  /**
   * Get Gmail API client with valid token
   */
  async getGmailClient() {
    const { accessToken, expiresAt, wasRefreshed } =
      await getValidAccessToken(this.tokenMetadata);

    // Update metadata if token was refreshed
    if (wasRefreshed) {
      this.tokenMetadata = {
        ...this.tokenMetadata,
        accessToken,
        expiresAt: expiresAt.toISOString(),
      };
    }

    return getGmailClient(accessToken, this.tokenMetadata.refreshToken);
  }
}

