"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  useGetTasksQuery,
  useGetStatusesQuery,
  useGetPrioritiesQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCreateStatusMutation,
  useCreatePriorityMutation,
} from "./store/tasksApi";
import {
  setTasks,
  setStatuses,
  setPriorities,
  setSelectedTask,
  setSearchQuery,
  addTask,
  updateTask,
  addStatus,
  addPriority,
} from "./store/tasksSlice";
import { useAppSelector } from "@/store/hooks";
import { KanbanBoard } from "./components/KanbanBoard";
import { TasksHeader } from "./components/TasksHeader";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { CreateStatusModal } from "./components/CreateStatusModal";
import { CreatePriorityModal } from "./components/CreatePriorityModal";
import { EmptyState } from "./components/EmptyState";
import { LoadingSpinner } from "../connect/components/LoadingSpinner";
import type {
  Task,
  CreateTaskInput,
  CreateStatusInput,
  CreatePriorityInput,
} from "./types";

export default function TasksPage() {
  const dispatch = useDispatch();
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery);
  const selectedTask = useAppSelector((state) => state.tasks.selectedTask);

  // Modals state
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createStatusModalOpen, setCreateStatusModalOpen] = useState(false);
  const [createPriorityModalOpen, setCreatePriorityModalOpen] = useState(false);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [createTaskStatusId, setCreateTaskStatusId] = useState<
    string | undefined
  >();

  // API queries
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery();
  const { data: statusesData, isLoading: statusesLoading } =
    useGetStatusesQuery();
  const { data: prioritiesData, isLoading: prioritiesLoading } =
    useGetPrioritiesQuery();

  // Mutations
  const [createTask] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [createStatus] = useCreateStatusMutation();
  const [createPriority] = useCreatePriorityMutation();

  // Update Redux state when API data changes
  useEffect(() => {
    if (tasksData?.tasks) {
      dispatch(setTasks(tasksData.tasks));
    }
  }, [tasksData, dispatch]);

  useEffect(() => {
    if (statusesData?.statuses) {
      dispatch(setStatuses(statusesData.statuses));
    }
  }, [statusesData, dispatch]);

  useEffect(() => {
    if (prioritiesData?.priorities) {
      dispatch(setPriorities(prioritiesData.priorities));
    }
  }, [prioritiesData, dispatch]);

  // Get data from Redux
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const statuses = useAppSelector((state) => state.tasks.statuses);
  const priorities = useAppSelector((state) => state.tasks.priorities);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const handleTaskClick = (task: Task) => {
    dispatch(setSelectedTask(task));
    setTaskDetailModalOpen(true);
  };

  const handleTaskMove = async (taskId: string, newStatusId: string) => {
    try {
      await updateTaskMutation({
        id: taskId,
        statusId: newStatusId,
      }).unwrap();
      dispatch(updateTask({ id: taskId, updates: { statusId: newStatusId } }));
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      const result = await createTask(input).unwrap();
      dispatch(addTask(result.task));
      setCreateTaskModalOpen(false);
      setCreateTaskStatusId(undefined);
    } catch (error) {
      console.error("Error creating task:", error);
      const errorMessage =
        (error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "error" in error.data &&
        typeof error.data.error === "string"
          ? error.data.error
          : null) || "Failed to create task. Please try again.";
      alert(errorMessage);
    }
  };

  const handleCreateStatus = async (input: CreateStatusInput) => {
    try {
      const result = await createStatus(input).unwrap();
      dispatch(addStatus(result.status));
      setCreateStatusModalOpen(false);
    } catch (error) {
      console.error("Error creating status:", error);
      const errorMessage =
        (error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "error" in error.data &&
        typeof error.data.error === "string"
          ? error.data.error
          : null) || "Failed to create status. Please try again.";
      alert(errorMessage);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleCreatePriority = async (input: CreatePriorityInput) => {
    try {
      const result = await createPriority(input).unwrap();
      dispatch(addPriority(result.priority));
      setCreatePriorityModalOpen(false);
    } catch (error) {
      console.error("Error creating priority:", error);
      const errorMessage =
        (error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "error" in error.data &&
        typeof error.data.error === "string"
          ? error.data.error
          : null) || "Failed to create priority. Please try again.";
      alert(errorMessage);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleCreateTaskClick = (statusId?: string) => {
    setCreateTaskStatusId(statusId);
    setCreateTaskModalOpen(true);
  };

  if (tasksLoading || statusesLoading || prioritiesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks with a Kanban board
          </p>
        </div>

        <TasksHeader
          searchQuery={searchQuery}
          onSearchChange={(query) => dispatch(setSearchQuery(query))}
          onCreateStatus={() => setCreateStatusModalOpen(true)}
          onCreatePriority={() => setCreatePriorityModalOpen(true)}
        />

        {statuses.length === 0 ? (
          <EmptyState onCreateStatus={() => setCreateStatusModalOpen(true)} />
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            statuses={statuses}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            onCreateTask={handleCreateTaskClick}
          />
        )}

        {/* Modals */}
        <CreateTaskModal
          open={createTaskModalOpen}
          onOpenChange={setCreateTaskModalOpen}
          statuses={statuses}
          priorities={priorities}
          defaultStatusId={createTaskStatusId}
          onSubmit={handleCreateTask}
        />

        <TaskDetailModal
          task={selectedTask}
          open={taskDetailModalOpen}
          onOpenChange={setTaskDetailModalOpen}
        />

        <CreateStatusModal
          open={createStatusModalOpen}
          onOpenChange={setCreateStatusModalOpen}
          onSubmit={handleCreateStatus}
        />

        <CreatePriorityModal
          open={createPriorityModalOpen}
          onOpenChange={setCreatePriorityModalOpen}
          onSubmit={handleCreatePriority}
        />
      </div>
    </div>
  );
}
