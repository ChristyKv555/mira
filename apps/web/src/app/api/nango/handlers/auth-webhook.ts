import { NextRequest, NextResponse } from "next/server";
import { handleCreateIntegration } from "../helpers/create-integration";
import { handleDeleteIntegration } from "../helpers/delete-integration";
import { handleUpdateIntegration } from "../helpers/update-integration";
import type {
  NangoWebhookPayload,
  CreateIntegrationParams,
  DeleteIntegrationParams,
  UpdateIntegrationParams,
} from "../helpers/types";

/**
 * Handles authentication-related webhooks (creation, deletion, updates)
 */
export async function handleAuthWebhook(
  request: NextRequest,
  payload: NangoWebhookPayload
): Promise<NextResponse> {
  const {
    operation,
    connectionId,
    endUser,
    providerConfigKey,
    integrationId,
    success,
  } = payload;

  switch (operation) {
    case "creation":
      if (!success) {
        console.error("Integration creation failed:", payload);
        return NextResponse.json(
          { error: "Integration creation was not successful" },
          { status: 400 }
        );
      }

      // Validate required fields
      if (!connectionId || (!providerConfigKey && !integrationId)) {
        console.error("Missing required fields for creation:", payload);
        return NextResponse.json(
          {
            error:
              "Missing required fields: connectionId and integrationId are required",
          },
          { status: 400 }
        );
      }

      const createParams: CreateIntegrationParams = {
        connectionId,
        integrationId: providerConfigKey || integrationId || "",
        endUserId: endUser?.endUserId,
      };

      return handleCreateIntegration(request, createParams);

    case "deletion":
      if (!connectionId) {
        console.error("Missing connectionId for deletion:", payload);
        return NextResponse.json(
          { error: "Missing required field: connectionId" },
          { status: 400 }
        );
      }

      const deleteParams: DeleteIntegrationParams = {
        connectionId,
        userId: endUser?.endUserId || "",
      };

      return handleDeleteIntegration(request, deleteParams);

    case "update":
      if (!connectionId) {
        return NextResponse.json(
          { error: "Missing required field: connectionId" },
          { status: 400 }
        );
      }

      const updateParams: UpdateIntegrationParams = {
        connectionId,
        userId: endUser?.endUserId || "",
        updates: {
          // Add any update fields from payload if needed
          isActive: payload.success ? 1 : 0,
        },
      };

      return handleUpdateIntegration(request, updateParams);

    default:
      console.warn("Unknown auth operation:", operation);
      return NextResponse.json(
        { success: true, message: "Auth operation not handled, ignoring" },
        { status: 200 }
      );
  }
}
