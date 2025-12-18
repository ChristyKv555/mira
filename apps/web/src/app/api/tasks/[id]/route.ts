import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/database/auth";
import { getTaskById, updateTask, deleteTask } from "@/database/queries";
import type { TaskStatus } from "@/database/schema";

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await getTaskById(params.id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify task belongs to user
    if (task.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await getTaskById(params.id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify task belongs to user
    if (task.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, status } = body;

    const updatedTask = await updateTask(params.id, {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status: status as TaskStatus }),
    });

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await getTaskById(params.id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify task belongs to user
    if (task.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteTask(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
