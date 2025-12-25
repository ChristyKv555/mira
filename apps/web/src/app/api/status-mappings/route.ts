import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { statusMappings, taskStatuses } from "@/database/schema";
import { insertStatusMappingSchema } from "@/database/schema/statusMappings";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { searchParams } = new URL(request.url);
    const statusId = searchParams.get("statusId");

    // Build where conditions
    const conditions = [eq(statusMappings.userId, userData.userId)];

    if (statusId) {
      conditions.push(eq(statusMappings.statusId, statusId));
    }

    // Fetch mappings
    const mappings = await db
      .select()
      .from(statusMappings)
      .where(and(...conditions));

    return NextResponse.json({
      mappings: mappings.map((mapping) => ({
        ...mapping,
        createdAt: mapping.createdAt.toISOString(),
        updatedAt: mapping.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching status mappings:", error);
    return NextResponse.json(
      { error: "Failed to fetch status mappings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    // Validate input
    const validatedData = insertStatusMappingSchema.parse({
      ...body,
      userId: userData.userId,
    });

    // Verify status belongs to user
    const existingStatus = await db
      .select()
      .from(taskStatuses)
      .where(
        and(
          eq(taskStatuses.id, validatedData.statusId),
          eq(taskStatuses.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingStatus.length === 0) {
      return NextResponse.json(
        { error: "Status not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if mapping already exists for this status
    const existingMapping = await db
      .select()
      .from(statusMappings)
      .where(
        and(
          eq(statusMappings.userId, userData.userId),
          eq(statusMappings.statusId, validatedData.statusId)
        )
      )
      .limit(1);

    if (existingMapping.length > 0) {
      // Update existing mapping
      const [updatedMapping] = await db
        .update(statusMappings)
        .set({
          keywords: validatedData.keywords || [],
          updatedAt: new Date(),
        })
        .where(eq(statusMappings.id, existingMapping[0].id))
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
      .insert(statusMappings)
      .values({
        userId: userData.userId,
        statusId: validatedData.statusId,
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
    console.error("Error creating/updating status mapping:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create/update status mapping" },
      { status: 500 }
    );
  }
}

