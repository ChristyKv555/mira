/**
 * Nango webhook payload types
 */

export interface NangoWebhookPayload {
  type: "auth" | "sync" | "forwarded";
  operation?: "creation" | "deletion" | "update";
  success?: boolean;
  connectionId?: string;
  endUser?: {
    endUserId?: string;
    email?: string;
  };
  providerConfigKey?: string;
  integrationId?: string;
  // Sync webhook fields
  syncType?: "INITIAL" | "INCREMENTAL" | "WEBHOOK";
  model?: string;
  responseResults?: {
    added: number;
    updated: number;
    deleted: number;
  };
  modifiedAfter?: string;
  // Forwarded webhook fields
  payload?: unknown;
}

export interface CreateIntegrationParams {
  connectionId: string;
  integrationId: string;
  endUserId?: string;
}

export interface DeleteIntegrationParams {
  connectionId: string;
  userId: string;
}

export interface UpdateIntegrationParams {
  connectionId: string;
  userId: string;
  updates: {
    isActive?: number;
    platform?: string;
  };
}
