/**
 * Google Gemini Integration Module
 *
 * This module provides:
 * - Embedding generation using gemini-embedding-001 (1536 dimensions)
 * - AI model calls with flexible parameters and streaming support
 */

// Embedding functions
export {
  generateEmbedding,
  generateEmbeddings,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
} from "./embedding";

// AI model functions
export { makeAICall, ModelConfigs } from "./model";

// Types
export type {
  AIRequestConfig,
  AIResponse,
  ModelParams,
  ChatMessage,
} from "./types";
