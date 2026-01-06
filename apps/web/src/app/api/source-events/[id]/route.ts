import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { sourceEvents, updateSourceEventSchema } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: eventId } = await params;

    // Fetch source event and verify it belongs to user
    const event = await db
      .select()
      .from(sourceEvents)
      .where(
        and(
          eq(sourceEvents.id, eventId),
          eq(sourceEvents.userId, userData.userId)
        )
      )
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json(
        { error: "Source event not found or unauthorized" },
        { status: 404 }
      );
    }

    const eventData = event[0];

    let parsedMetadata = null;
    let parsedRawContent = null;

    try {
      parsedMetadata = eventData.metadata
        ? JSON.parse(eventData.metadata)
        : null;
    } catch (e) {
      console.warn(`Failed to parse metadata for event ${eventId}:`, e);
    }

    try {
      parsedRawContent = eventData.rawContent
        ? JSON.parse(eventData.rawContent)
        : null;
    } catch (e) {
      console.warn(`Failed to parse rawContent for event ${eventId}:`, e);
    }

    return NextResponse.json({
      event: {
        ...eventData,
        createdAt: eventData.createdAt.toISOString(),
        processedAt: eventData.processedAt?.toISOString() || null,
        metadata: parsedMetadata,
        rawContent: parsedRawContent,
      },
    });
  } catch (error) {
    console.error("Error fetching source event:", error);
    return NextResponse.json(
      { error: "Failed to fetch source event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: eventId } = await params;
    const body = await request.json();

    // Verify event belongs to user
    const existingEvent = await db
      .select()
      .from(sourceEvents)
      .where(
        and(
          eq(sourceEvents.id, eventId),
          eq(sourceEvents.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { error: "Source event not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate input using Zod schema
    const validatedData = updateSourceEventSchema
      .omit({ id: true, userId: true })
      .parse(body);

    // Prepare update data
    const updateData: {
      metadata?: string;
      processedAt?: Date | null;
      rawContent?: string;
    } = {};

    if (validatedData.metadata !== undefined) {
      updateData.metadata =
        typeof validatedData.metadata === "string"
          ? validatedData.metadata
          : JSON.stringify(validatedData.metadata);
    }

    if (validatedData.processedAt !== undefined) {
      updateData.processedAt = validatedData.processedAt || null;
    }

    if (validatedData.rawContent !== undefined) {
      updateData.rawContent =
        typeof validatedData.rawContent === "string"
          ? validatedData.rawContent
          : JSON.stringify(validatedData.rawContent);
    }

    // Update source event
    const [updatedEvent] = await db
      .update(sourceEvents)
      .set(updateData)
      .where(
        and(
          eq(sourceEvents.id, eventId),
          eq(sourceEvents.userId, userData.userId)
        )
      )
      .returning();

    let parsedMetadata = null;
    let parsedRawContent = null;

    try {
      parsedMetadata = updatedEvent.metadata
        ? JSON.parse(updatedEvent.metadata)
        : null;
    } catch (e) {
      console.warn(`Failed to parse metadata for event ${eventId}:`, e);
    }

    try {
      parsedRawContent = updatedEvent.rawContent
        ? JSON.parse(updatedEvent.rawContent)
        : null;
    } catch (e) {
      console.warn(`Failed to parse rawContent for event ${eventId}:`, e);
    }

    return NextResponse.json({
      event: {
        ...updatedEvent,
        createdAt: updatedEvent.createdAt.toISOString(),
        processedAt: updatedEvent.processedAt?.toISOString() || null,
        metadata: parsedMetadata,
        rawContent: parsedRawContent,
      },
    });
  } catch (error) {
    console.error("Error updating source event:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update source event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PATCH is same as PUT for this endpoint
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: eventId } = await params;

    // Verify event belongs to user and delete
    const deletedEvent = await db
      .delete(sourceEvents)
      .where(
        and(
          eq(sourceEvents.id, eventId),
          eq(sourceEvents.userId, userData.userId)
        )
      )
      .returning();

    if (deletedEvent.length === 0) {
      return NextResponse.json(
        { error: "Source event not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting source event:", error);
    return NextResponse.json(
      { error: "Failed to delete source event" },
      { status: 500 }
    );
  }
}
