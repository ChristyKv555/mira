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
