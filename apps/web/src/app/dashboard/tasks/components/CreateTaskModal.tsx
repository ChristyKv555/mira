"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskStatus, TaskPriority, CreateTaskInput, Task } from "../types";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  defaultStatusId?: string;
  task?: Task | null;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  statuses,
  priorities,
  defaultStatusId,
  task,
  onSubmit,
}: CreateTaskModalProps) {
  // Compute initial values based on task prop
  const initialValues = useMemo(() => {
    if (task) {
      return {
        title: task.title,
        description: task.description || "",
        selectedStatusId: task.statusId || defaultStatusId,
        selectedPriorityId: task.priorityId || undefined,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      };
    }
    return {
      title: "",
      description: "",
      selectedStatusId: defaultStatusId,
      selectedPriorityId: undefined,
      dueDate: "",
    };
  }, [task, defaultStatusId]);

  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [selectedStatusId, setSelectedStatusId] = useState<string | undefined>(
    initialValues.selectedStatusId
  );
  const [selectedPriorityId, setSelectedPriorityId] = useState<
    string | undefined
  >(initialValues.selectedPriorityId);
  const [dueDate, setDueDate] = useState(initialValues.dueDate);

  // Reset form when modal opens or task changes
  useEffect(() => {
    if (open) {
      setTitle(initialValues.title);
      setDescription(initialValues.description);
      setSelectedStatusId(initialValues.selectedStatusId);
      setSelectedPriorityId(initialValues.selectedPriorityId);
      setDueDate(initialValues.dueDate);
    }
  }, [open, initialValues]);

  const selectedStatus = statuses.find((s) => s.id === selectedStatusId);
  const selectedPriority = priorities.find((p) => p.id === selectedPriorityId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        statusId: selectedStatusId,
        priorityId: selectedPriorityId,
        dueDate: dueDate || undefined,
      });

      // Reset form only on success (if not editing)
      if (!task) {
        setTitle("");
        setDescription("");
        setSelectedStatusId(defaultStatusId);
        setSelectedPriorityId(undefined);
        setDueDate("");
      }
      onOpenChange(false);
    } catch {
      // Error handling is done in parent component
      // Don't close modal on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={task?.id || "new"}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the task details below."
              : "Add a new task to your board. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedStatus ? selectedStatus.label : "Select status"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {statuses.map((status) => (
                    <DropdownMenuItem
                      key={status.id}
                      onClick={() => setSelectedStatusId(status.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color || "#94a3b8" }}
                        />
                        {status.label}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedPriority
                      ? selectedPriority.label
                      : "Select priority"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {priorities.map((priority) => (
                    <DropdownMenuItem
                      key={priority.id}
                      onClick={() => setSelectedPriorityId(priority.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: priority.color || "#94a3b8",
                          }}
                        />
                        {priority.label}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
