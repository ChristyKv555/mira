import { NextResponse } from "next/server";

// Base webhook payload structure
export interface NangoWebhookPayload {
  type: string;
  operation?: string;
  success: boolean;
  connectionId?: string;
  providerConfigKey?: string;
  endUser?: {
    endUserId: string;
    endUserEmail?: string;
    tags?: Record<string, unknown>;
  };
  [key: string]: unknown; // Allow additional metadata fields
}

// Auth webhook payload
export interface AuthWebhookPayload extends NangoWebhookPayload {
  type: "auth";
  operation: "creation" | "override" | "refresh";
  connectionId: string;
  providerConfigKey: string;
  success: boolean;
  endUser: {
    endUserId: string;
    endUserEmail?: string;
    tags?: Record<string, unknown>;
  };
}

// Sync webhook payload
export interface SyncWebhookPayload extends NangoWebhookPayload {
  type: "sync";
  connectionId: string;
  providerConfigKey: string;
  model: string;
  syncType: "INITIAL" | "INCREMENTAL" | "WEBHOOK";
  responseResults: {
    added: number;
    updated: number;
    deleted: number;
  };
  modifiedAfter?: string; // ISO timestamp
  success: boolean;
}

// Forwarded webhook payload (from external APIs)
export interface ForwardedWebhookPayload extends NangoWebhookPayload {
  type: "forwarded";
  connectionId: string;
  providerConfigKey: string;
  payload: Record<string, unknown>;
}

// Handler response type
export type HandlerResponse = NextResponse<{
  message: string;
  integrationId?: string;
  sourceEventId?: string;
  error?: string;
}>;
