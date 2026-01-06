"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TaskPriority } from "../types";

export interface TaskFilters {
  priorityIds: string[];
  sources: string[];
  dueDateFilter?: "overdue" | "today" | "thisWeek" | "none";
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  priorities: TaskPriority[];
  availableSources: string[];
}

// Source options with proper labels
const SOURCE_OPTIONS = [
  { value: "google-mail", label: "Google Mail" },
  { value: "google-calendar", label: "Google Calendar" },
  { value: "slack", label: "Slack" },
  { value: "custom", label: "Custom" },
] as const;

// Helper function to get source label
export function getSourceLabel(platform: string | null | undefined): string {
  if (!platform) return "Custom";
  const option = SOURCE_OPTIONS.find((opt) => opt.value === platform);
  return option?.label || platform;
}

const DUE_DATE_OPTIONS = [
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due Today" },
  { value: "thisWeek", label: "Due This Week" },
  { value: "none", label: "No Due Date" },
] as const;

export function TaskFilters({
  filters,
  onFiltersChange,
  priorities,
}: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.priorityIds.length > 0 ||
    filters.sources.length > 0 ||
    filters.dueDateFilter !== undefined;

  const handlePriorityToggle = (priorityId: string) => {
    const newPriorityIds = filters.priorityIds.includes(priorityId)
      ? filters.priorityIds.filter((id) => id !== priorityId)
      : [...filters.priorityIds, priorityId];
    onFiltersChange({ ...filters, priorityIds: newPriorityIds });
  };

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source];
    onFiltersChange({ ...filters, sources: newSources });
  };

  const handleDueDateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dueDateFilter:
        filters.dueDateFilter === value
          ? undefined
          : (value as TaskFilters["dueDateFilter"]),
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      priorityIds: [],
      sources: [],
      dueDateFilter: undefined,
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${hasActiveFilters ? "border-primary" : ""}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {filters.priorityIds.length +
                filters.sources.length +
                (filters.dueDateFilter ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filter Tasks</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {priorities.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No priorities available
                </p>
              ) : (
                priorities.map((priority) => (
                  <div
                    key={priority.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`priority-${priority.id}`}
                      checked={filters.priorityIds.includes(priority.id)}
                      onChange={() => handlePriorityToggle(priority.id)}
                    />
                    <Label
                      htmlFor={`priority-${priority.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: priority.color || "#94a3b8",
                        }}
                      />
                      {priority.label}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Source Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Source</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {SOURCE_OPTIONS.map((source) => {
                // Always show all source options
                return (
                  <div
                    key={source.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`source-${source.value}`}
                      checked={filters.sources.includes(source.value)}
                      onChange={() => handleSourceToggle(source.value)}
                    />
                    <Label
                      htmlFor={`source-${source.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {source.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Due Date Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Due Date</Label>
            <div className="space-y-2">
              {DUE_DATE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dueDate-${option.value}`}
                    checked={filters.dueDateFilter === option.value}
                    onChange={() => handleDueDateChange(option.value)}
                  />
                  <Label
                    htmlFor={`dueDate-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
