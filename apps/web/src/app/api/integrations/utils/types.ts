export interface DeleteConnectionParams {
  connectionId: string;
  platform: "slack" | "google-calendar" | "google-mail";
}

export interface DeleteConnectionResult {
  success: boolean;
  error?: Error;
}

export interface CreateSessionParams {
  userId: string;
  email: string;
  platform: "slack" | "google-calendar" | "google-mail";
}

export interface CreateSessionResult {
  sessionToken: string;
  connectLink: string;
  expiresAt: string;
}

export interface ListRecordsParams {
  providerConfigKey: string;
  connectionId: string;
  model: string;
  variant?: string;
  filter: "added";
  limit: number;
}

export interface ListRecordsResult {
  records: unknown[];
  error: Error | null;
}
