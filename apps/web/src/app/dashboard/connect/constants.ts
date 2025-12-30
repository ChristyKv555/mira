import { MessageSquare, Calendar, Mail } from "lucide-react";
import type { IntegrationConfig } from "./types";

export const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Connect your workspace for notifications and messages",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync your events and upcoming meetings",
    icon: Calendar,
    color: "bg-blue-500",
  },
  {
    id: "google-mail",
    name: "Gmail",
    description: "Connect your account for email notifications",
    icon: Mail,
    color: "bg-red-500",
  },
];

/**
 * Maps Nango integration IDs to platform values used in the database
 */
export function mapNangoIntegrationIdToPlatform(
  nangoIntegrationId: string
): "slack" | "google-calendar" | "google-mail" {
  const mapping: Record<string, "slack" | "google-calendar" | "google-mail"> = {
    slack: "slack",
    "google-calendar": "google-calendar",
    "google-mail": "google-mail",
    gmail: "google-mail", // Handle alternative ID
  };

  const platform = mapping[nangoIntegrationId.toLowerCase()];
  if (!platform) {
    throw new Error(
      `Unknown Nango integration ID: ${nangoIntegrationId}. Supported: slack, google-calendar, google-mail, gmail`
    );
  }
  return platform;
}

/**
 * Maps platform values to Nango integration IDs
 */
export function mapPlatformToNangoIntegrationId(
  platform: "slack" | "google-calendar" | "google-mail"
): string {
  const mapping: Record<
    "slack" | "google-calendar" | "google-mail",
    string
  > = {
    slack: "slack",
    "google-calendar": "google-calendar",
    "google-mail": "google-mail",
  };

  return mapping[platform];
}
