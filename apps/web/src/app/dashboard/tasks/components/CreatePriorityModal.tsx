"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import type { CreatePriorityInput } from "../types";

interface CreatePriorityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreatePriorityInput) => Promise<void>;
}

export function CreatePriorityModal({
  open,
  onOpenChange,
  onSubmit,
}: CreatePriorityModalProps) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState("#94a3b8");
  const [level, setLevel] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;

    try {
      await onSubmit({
        label: label.trim(),
        key: key.trim().toLowerCase().replace(/\s+/g, "_"),
        color,
        level,
      });

      // Reset form only on success
      setLabel("");
      setKey("");
      setColor("#94a3b8");
      setLevel(0);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      // Don't close modal on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Priority</DialogTitle>
          <DialogDescription>
            Add a new priority level for your tasks. Higher levels indicate
            higher priority.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!key) {
                  setKey(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                      .replace(/[^a-z0-9_]/g, "")
                  );
                }
              }}
              placeholder="e.g., Critical"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Key *</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) =>
                setKey(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_]/g, "")
                )
              }
              placeholder="e.g., critical"
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this priority (lowercase, underscores only)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#94a3b8"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="number"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Higher number = higher priority
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Priority</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
