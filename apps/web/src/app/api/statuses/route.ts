import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { taskStatuses } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { insertStatusSchema } from "@/database/schema/taskStatuses";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);

    // Fetch user's statuses
    const userStatuses = await db
      .select()
      .from(taskStatuses)
      .where(eq(taskStatuses.userId, userData.userId))
      .orderBy(taskStatuses.order);

    return NextResponse.json({
      statuses: userStatuses.map((status) => ({
        ...status,
        createdAt: status.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    // Validate input
    const validatedData = insertStatusSchema.parse({
      ...body,
      userId: userData.userId,
    });

    // Check if key already exists for this user
    const existingStatus = await db
      .select()
      .from(taskStatuses)
      .where(
        and(
          eq(taskStatuses.userId, userData.userId),
          eq(taskStatuses.key, validatedData.key)
        )
      )
      .limit(1);

    if (existingStatus.length > 0) {
      return NextResponse.json(
        { error: "Status with this key already exists" },
        { status: 400 }
      );
    }

    // If order not provided, set to max order + 1
    let order = validatedData.order;
    if (order === undefined) {
      const maxOrderStatus = await db
        .select()
        .from(taskStatuses)
        .where(eq(taskStatuses.userId, userData.userId))
        .orderBy(desc(taskStatuses.order))
        .limit(1);

      order =
        maxOrderStatus.length > 0 && maxOrderStatus[0]?.order != null
          ? maxOrderStatus[0].order + 1
          : 0;
    }

    // Insert status
    const [newStatus] = await db
      .insert(taskStatuses)
      .values({
        userId: userData.userId,
        label: validatedData.label,
        key: validatedData.key,
        color: validatedData.color || null,
        order: order,
      })
      .returning();

    return NextResponse.json({
      status: {
        ...newStatus,
        createdAt: newStatus.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating status:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create status" },
      { status: 500 }
    );
  }
}
