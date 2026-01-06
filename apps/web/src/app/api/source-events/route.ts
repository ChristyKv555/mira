import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { sourceEvents } from "@/database/schema";
import { eq, and, inArray, isNull, isNotNull, desc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const platform = searchParams.get("platform");
    const integrationId = searchParams.get("integrationId");
    const processed = searchParams.get("processed"); // "true" or "false"
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build where conditions
    const conditions = [eq(sourceEvents.userId, userData.userId)];

    // Filter by platform
    if (platform) {
      const platforms = platform.split(",");
      if (platforms.length === 1) {
        conditions.push(eq(sourceEvents.platform, platforms[0]));
      } else {
        conditions.push(inArray(sourceEvents.platform, platforms));
      }
    }

    // Filter by integrationId
    if (integrationId) {
      conditions.push(eq(sourceEvents.integrationId, integrationId));
    }

    // Filter by processed status
    if (processed === "true") {
      conditions.push(isNotNull(sourceEvents.processedAt));
    } else if (processed === "false") {
      conditions.push(isNull(sourceEvents.processedAt));
    }

    // Fetch source events
    const events = await db
      .select()
      .from(sourceEvents)
      .where(and(...conditions))
      .orderBy(desc(sourceEvents.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalEvents = await db
      .select()
      .from(sourceEvents)
      .where(and(...conditions));

    return NextResponse.json({
      events: events.map((event) => {
        let parsedMetadata = null;
        let parsedRawContent = null;

        try {
          parsedMetadata = event.metadata ? JSON.parse(event.metadata) : null;
        } catch (e) {
          console.warn(`Failed to parse metadata for event ${event.id}:`, e);
        }

        try {
          parsedRawContent = event.rawContent
            ? JSON.parse(event.rawContent)
            : null;
        } catch (e) {
          console.warn(`Failed to parse rawContent for event ${event.id}:`, e);
        }

        return {
          ...event,
          createdAt: event.createdAt.toISOString(),
          processedAt: event.processedAt?.toISOString() || null,
          metadata: parsedMetadata,
          rawContent: parsedRawContent,
        };
      }),
      pagination: {
        total: totalEvents.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching source events:", error);
    return NextResponse.json(
      { error: "Failed to fetch source events" },
      { status: 500 }
    );
  }
}
