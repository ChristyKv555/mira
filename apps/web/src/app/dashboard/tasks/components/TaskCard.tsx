"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Task } from "../types";
import { Card } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColor = task.priority?.color || "#94a3b8";
  const statusColor = task.status?.color || "#94a3b8";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card border-l-4"
        style={{ borderLeftColor: statusColor }}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
            {task.title}
          </h3>
          {task.priority && (
            <div
              className="w-3 h-3 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: priorityColor }}
              title={task.priority.label}
            />
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {task.source ? (
              <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                {task.source.platform.replace("-", " ")}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Custom
              </span>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {task.id.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
