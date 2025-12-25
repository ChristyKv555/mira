import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { priorityMappings, taskPriorities } from "@/database/schema";
import { insertPriorityMappingSchema } from "@/database/schema/priorityMappings";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { searchParams } = new URL(request.url);
    const priorityId = searchParams.get("priorityId");

    // Build where conditions
    const conditions = [eq(priorityMappings.userId, userData.userId)];

    if (priorityId) {
      conditions.push(eq(priorityMappings.priorityId, priorityId));
    }

    // Fetch mappings
    const mappings = await db
      .select()
      .from(priorityMappings)
      .where(and(...conditions));

    return NextResponse.json({
      mappings: mappings.map((mapping) => ({
        ...mapping,
        createdAt: mapping.createdAt.toISOString(),
        updatedAt: mapping.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching priority mappings:", error);
    return NextResponse.json(
      { error: "Failed to fetch priority mappings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    // Validate input
    const validatedData = insertPriorityMappingSchema.parse({
      ...body,
      userId: userData.userId,
    });

    // Verify priority belongs to user
    const existingPriority = await db
      .select()
      .from(taskPriorities)
      .where(
        and(
          eq(taskPriorities.id, validatedData.priorityId),
          eq(taskPriorities.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingPriority.length === 0) {
      return NextResponse.json(
        { error: "Priority not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if mapping already exists for this priority
    const existingMapping = await db
      .select()
      .from(priorityMappings)
      .where(
        and(
          eq(priorityMappings.userId, userData.userId),
          eq(priorityMappings.priorityId, validatedData.priorityId)
        )
      )
      .limit(1);

    if (existingMapping.length > 0) {
      // Update existing mapping
      const [updatedMapping] = await db
        .update(priorityMappings)
        .set({
          keywords: validatedData.keywords || [],
          updatedAt: new Date(),
        })
        .where(eq(priorityMappings.id, existingMapping[0].id))
        .returning();

      return NextResponse.json({
        mapping: {
          ...updatedMapping,
          createdAt: updatedMapping.createdAt.toISOString(),
          updatedAt: updatedMapping.updatedAt.toISOString(),
        },
      });
    }

    // Create new mapping
    const [newMapping] = await db
      .insert(priorityMappings)
      .values({
        userId: userData.userId,
        priorityId: validatedData.priorityId,
        keywords: validatedData.keywords || [],
        isActive: validatedData.isActive ?? true,
      })
      .returning();

    return NextResponse.json({
      mapping: {
        ...newMapping,
        createdAt: newMapping.createdAt.toISOString(),
        updatedAt: newMapping.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating/updating priority mapping:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create/update priority mapping" },
      { status: 500 }
    );
  }
}

