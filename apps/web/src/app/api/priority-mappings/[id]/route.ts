import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { priorityMappings } from "@/database/schema";
import { updatePriorityMappingSchema } from "@/database/schema/priorityMappings";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: mappingId } = await params;
    const body = await request.json();

    // Verify mapping belongs to user
    const existingMapping = await db
      .select()
      .from(priorityMappings)
      .where(
        and(
          eq(priorityMappings.id, mappingId),
          eq(priorityMappings.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingMapping.length === 0) {
      return NextResponse.json(
        { error: "Mapping not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate input using Zod schema
    const validatedData = updatePriorityMappingSchema
      .omit({ id: true, userId: true })
      .parse(body);

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.keywords !== undefined) {
      updateData.keywords = validatedData.keywords;
    }
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }

    // Update mapping
    const [updatedMapping] = await db
      .update(priorityMappings)
      .set(updateData)
      .where(
        and(
          eq(priorityMappings.id, mappingId),
          eq(priorityMappings.userId, userData.userId)
        )
      )
      .returning();

    return NextResponse.json({
      mapping: {
        ...updatedMapping,
        createdAt: updatedMapping.createdAt.toISOString(),
        updatedAt: updatedMapping.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating priority mapping:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update priority mapping" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: mappingId } = await params;

    // Verify mapping belongs to user and delete
    const deletedMapping = await db
      .delete(priorityMappings)
      .where(
        and(
          eq(priorityMappings.id, mappingId),
          eq(priorityMappings.userId, userData.userId)
        )
      )
      .returning();

    if (deletedMapping.length === 0) {
      return NextResponse.json(
        { error: "Mapping not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting priority mapping:", error);
    return NextResponse.json(
      { error: "Failed to delete priority mapping" },
      { status: 500 }
    );
  }
}

