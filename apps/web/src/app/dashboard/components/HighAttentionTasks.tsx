"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Task } from "../tasks/types";
import { getHighAttentionTasks, isTaskOverdue } from "../utils/taskFilters";

interface HighAttentionTasksProps {
  tasks: Task[];
}

export function HighAttentionTasks({ tasks }: HighAttentionTasksProps) {
  // Filter tasks that need high attention (overdue + high priority)
  const highAttentionTasks = getHighAttentionTasks(tasks);

  if (highAttentionTasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold">High Attention Needed</h2>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          No tasks require immediate attention. Great job!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h2 className="text-xl font-semibold">High Attention Needed</h2>
          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            {highAttentionTasks.length}
          </span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/tasks">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {highAttentionTasks.slice(0, 5).map((task, index) => {
          const isOverdue = isTaskOverdue(task);
          const priorityColor = task.priority?.color || "#94a3b8";

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href="/dashboard/tasks">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-destructive">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {task.priority && (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${priorityColor}20`,
                              color: priorityColor,
                            }}
                          >
                            {task.priority.label}
                          </span>
                        )}
                        {isOverdue && task.dueDate && (
                          <div className="flex items-center gap-1 text-destructive">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Overdue:{" "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {task.source && (
                          <span className="capitalize">
                            {task.source.platform.replace("-", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
