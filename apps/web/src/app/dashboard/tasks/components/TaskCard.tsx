"use client";

import { motion } from "framer-motion";
import { Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const priorityColor = task.priority?.color || "#94a3b8";

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
        style={{ borderLeftColor: priorityColor }}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
            {task.title}
          </h3>
          {task.priority && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded shrink-0"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onEdit();
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
