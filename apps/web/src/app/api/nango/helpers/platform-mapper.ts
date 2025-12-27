/**
 * Maps Nango integration IDs to our platform names
 */

export type Platform = "slack" | "google-calendar" | "google-mail";

const PLATFORM_MAP: Record<string, Platform> = {
  slack: "slack",
  "google-calendar": "google-calendar",
  "google-mail": "google-mail",
};

/**
 * Maps Nango integration ID to our platform name
 * @param integrationId - The integration ID from Nango
 * @returns The normalized platform name
 */
export function mapIntegrationIdToPlatform(integrationId: string): Platform {
  const normalized = integrationId.toLowerCase().trim();
  return PLATFORM_MAP[normalized] || (normalized as Platform);
}

/**
 * Validates if a platform is supported
 * @param platform - The platform to validate
 * @returns True if platform is supported
 */
export function isValidPlatform(platform: string): platform is Platform {
  return ["slack", "google-calendar", "google-mail"].includes(platform);
}
