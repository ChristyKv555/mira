import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (optional but recommended)
    // You can add signature verification here using Nango's webhook secret

    // Handle different webhook types
    if (body.type === "auth" && body.operation === "creation" && body.success) {
      const connectionId = body.connectionId;
      const endUserId = body.endUser?.endUserId;
      // Nango sends providerConfigKey which is the integration ID
      const integrationId = body.providerConfigKey || body.integrationId;

      if (!connectionId || !endUserId || !integrationId) {
        console.error("Missing required fields in webhook:", body);
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Map Nango integration IDs to our platform names
      const platformMap: Record<string, string> = {
        slack: "slack",
        "google-calendar": "google-calendar",
        "google-mail": "google-mail",
      };

      const platform =
        platformMap[integrationId.toLowerCase()] || integrationId.toLowerCase();

      // Check if integration already exists
      const existingIntegration = await db
        .select()
        .from(integrations)
        .where(eq(integrations.nangoConnectionId, connectionId))
        .limit(1);

      if (existingIntegration.length > 0) {
        console.log("Integration already exists:", connectionId);
        return NextResponse.json({
          success: true,
          message: "Integration already exists",
        });
      }

      // Create new integration record
      await db.insert(integrations).values({
        userId: endUserId,
        platform: platform as "slack" | "google-calendar" | "google-mail",
        nangoConnectionId: connectionId,
        isActive: 1,
      });

      console.log("Integration created successfully:", {
        connectionId,
        userId: endUserId,
        platform,
      });

      return NextResponse.json({
        success: true,
        message: "Integration saved successfully",
      });
    }

    // Handle other webhook types (deletion, updates, etc.)
    if (body.type === "auth" && body.operation === "deletion") {
      const connectionId = body.connectionId;

      if (connectionId) {
        // Deactivate the integration instead of deleting
        await db
          .update(integrations)
          .set({ isActive: 0 })
          .where(eq(integrations.nangoConnectionId, connectionId));

        console.log("Integration deactivated:", connectionId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
