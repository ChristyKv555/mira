"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task } from "../tasks/types";
import { groupTasksBySource } from "../utils/taskGrouping";

interface SourceBasedTasksProps {
  tasks: Task[];
}

interface TaskListProps {
  taskList: Task[];
}

const TaskList = ({ taskList }: TaskListProps) => (
  <div className="space-y-2">
    <AnimatePresence>
      {taskList.slice(0, 10).map((task, index) => {
        const priorityColor = task.priority?.color || "#94a3b8";
        const statusColor = task.status?.color || "#94a3b8";

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href="/dashboard/tasks">
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer border-l-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {task.title}
                      </h3>
                      {task.priority && (
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0"
                          style={{
                            backgroundColor: `${priorityColor}20`,
                            color: priorityColor,
                          }}
                        >
                          {task.priority.label}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {task.status && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusColor }}
                          />
                          <span>{task.status.label}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </AnimatePresence>
    {taskList.length > 10 && (
      <div className="pt-2">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/dashboard/tasks">
            View {taskList.length - 10} more tasks
          </Link>
        </Button>
      </div>
    )}
  </div>
);

export function SourceBasedTasks({ tasks }: SourceBasedTasksProps) {
  // Group tasks by source
  const { tasksBySource, customTasks } = groupTasksBySource(tasks);

  const allSources = Object.keys(tasksBySource);
  const hasCustomTasks = customTasks.length > 0;

  if (allSources.length === 0 && !hasCustomTasks) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tasks by Source</h2>
        <p className="text-muted-foreground text-sm">
          No tasks found. Create your first task to get started!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tasks by Source</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/tasks">View All Tasks</Link>
        </Button>
      </div>

      <Tabs
        defaultValue={hasCustomTasks ? "custom" : allSources[0] || "custom"}
      >
        <TabsList className="inline-flex h-10 w-full overflow-x-auto justify-start">
          {hasCustomTasks && (
            <TabsTrigger value="custom" className="shrink-0">
              Custom ({customTasks.length})
            </TabsTrigger>
          )}
          {allSources.map((source) => (
            <TabsTrigger key={source} value={source} className="shrink-0">
              {source
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
              ({tasksBySource[source].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {hasCustomTasks && (
          <TabsContent value="custom" className="mt-4">
            <TaskList taskList={customTasks} />
          </TabsContent>
        )}

        {allSources.map((source) => (
          <TabsContent key={source} value={source} className="mt-4">
            <TaskList taskList={tasksBySource[source]} />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
