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
import type { CreateStatusInput } from "../types";

interface CreateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateStatusInput) => Promise<void>;
}

export function CreateStatusModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateStatusModalProps) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState("#94a3b8");
  const [order, setOrder] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;

    try {
      await onSubmit({
        label: label.trim(),
        key: key.trim().toLowerCase().replace(/\s+/g, "_"),
        color,
        order,
      });

      // Reset form only on success
      setLabel("");
      setKey("");
      setColor("#94a3b8");
      setOrder(0);
      onOpenChange(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={open ? "open" : "closed"}>
        <DialogHeader>
          <DialogTitle>Create New Status</DialogTitle>
          <DialogDescription>
            Add a new status column to your board. This will create a new column
            in your Kanban board.
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
              placeholder="e.g., In Review"
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
              placeholder="e.g., in_review"
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this status (lowercase, underscores only)
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
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                min="0"
              />
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
            <Button type="submit">Create Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
