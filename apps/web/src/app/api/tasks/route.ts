import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/database/auth';
import {
  getTasksByUserId,
  getTasksByStatus,
  createTask,
} from '@/database/queries';
import type { TaskStatus } from '@/database/schema';

// GET /api/tasks - Get all tasks for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | null;

    let tasks;
    if (status) {
      tasks = await getTasksByStatus(user.id, status);
    } else {
      tasks = await getTasksByUserId(user.id);
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await createTask({
      title,
      description: description || null,
      status: status || 'todo',
      userId: user.id,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

