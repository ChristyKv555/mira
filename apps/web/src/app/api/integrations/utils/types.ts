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
  filter?: "added" | "updated" | "deleted";
  limit?: number;
  modifiedAfter?: string; // ISO timestamp - only fetch records modified after this time
  cursor?: string; // Cursor for pagination and incremental syncing
}

export interface ListRecordsResult {
  records: unknown[];
  error: Error | null;
}
