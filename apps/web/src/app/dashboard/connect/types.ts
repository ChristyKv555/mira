export interface Integration {
  id: string;
  userId: string;
  platform: "slack" | "google-calendar" | "google-mail";
  connectionId: string;
  metadata?: {
    connectedAt?: string;
    lastSyncTime?: string;
    [key: string]: any;
  } | null;
  isActive: number;
  createdAt: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

