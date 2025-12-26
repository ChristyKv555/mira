/**
 * Gets the base URL for API calls from environment variables
 * Falls back to empty string for relative URLs (local development)
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

/**
 * Constructs the full API base URL for a given endpoint path
 * @param endpointPath - The API endpoint path (e.g., '/api/integrations')
 * @returns The full API URL or relative path if base URL is not set
 */
export function getApiBaseUrl(endpointPath: string): string {
  const baseUrl = getBaseUrl();
  return baseUrl ? `${baseUrl}${endpointPath}` : endpointPath;
}

