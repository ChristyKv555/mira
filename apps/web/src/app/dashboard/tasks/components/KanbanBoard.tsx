"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "../types";

interface KanbanBoardProps {
  tasks: Task[];
  statuses: TaskStatus[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newStatusId: string) => void;
  onCreateTask: (statusId: string) => void;
}

export function KanbanBoard({
  tasks,
  statuses,
  onTaskClick,
  onTaskMove,
  onCreateTask,
}: KanbanBoardProps) {
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    statuses.forEach((status) => {
      grouped[status.id] = [];
    });
    tasks.forEach((task) => {
      const statusId = task.statusId || "unassigned";
      if (!grouped[statusId]) {
        grouped[statusId] = [];
      }
      grouped[statusId].push(task);
    });
    return grouped;
  }, [tasks, statuses]);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatusId, setDragOverStatusId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("currentStatusId", task.statusId || "");
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatusId(null);
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatusId(statusId);
  };

  const handleDragLeave = () => {
    setDragOverStatusId(null);
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDragOverStatusId(null);
    const taskId = e.dataTransfer.getData("taskId");
    const currentStatusId = e.dataTransfer.getData("currentStatusId");

    if (taskId && currentStatusId !== statusId) {
      onTaskMove(taskId, statusId);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      <AnimatePresence>
        {statuses.map((status) => {
          const statusTasks = tasksByStatus[status.id] || [];
          const statusColor = status.color || "#94a3b8";

          return (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="shrink-0 w-80"
            >
              <div className="bg-card rounded-lg border p-4 h-full flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    <h3 className="font-semibold text-sm text-foreground">
                      {status.label}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {statusTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks Container */}
                <div
                  className={`flex-1 min-h-[400px] space-y-3 overflow-y-auto transition-all ${
                    dragOverStatusId === status.id
                      ? "bg-accent/20 rounded-lg"
                      : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, status.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status.id)}
                >
                  <AnimatePresence>
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-move transition-opacity ${
                          draggedTaskId === task.id ? "opacity-50" : ""
                        }`}
                      >
                        <TaskCard
                          task={task}
                          onClick={() => onTaskClick(task)}
                        />
                      </div>
                    ))}
                  </AnimatePresence>

                  {/* Create Task Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-2"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={() => onCreateTask(status.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
