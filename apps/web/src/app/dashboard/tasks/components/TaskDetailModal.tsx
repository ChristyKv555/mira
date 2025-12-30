"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Tag, Clock, ExternalLink } from "lucide-react";
import type { Task } from "../types";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">
                Description
              </h3>
              <p className="text-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

            {task.source && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">
                  Source
                </h3>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">
                    {task.source.platform.replace("-", " ")}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({task.source.externalId})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground uppercase">
                    Status
                  </span>
                </div>
                {task.status ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: task.status.color || "#94a3b8",
                      }}
                    />
                    <span>{task.status.label}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No status</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground uppercase">
                    Priority
                  </span>
                </div>
                {task.priority ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: task.priority.color || "#94a3b8",
                      }}
                    />
                    <span>{task.priority.label}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No priority</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground uppercase">
                    Created
                  </span>
                </div>
                <span className="text-sm">{formatDate(task.createdAt)}</span>
              </div>

              {task.dueDate && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase">
                      Due Date
                    </span>
                  </div>
                  <span className="text-sm">{formatDate(task.dueDate)}</span>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase">
                      Completed
                    </span>
                  </div>
                  <span className="text-sm">
                    {formatDate(task.completedAt)}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-muted-foreground uppercase">
                    Task ID
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {task.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
