"use client";

import { Search, Settings, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TaskFilters as TaskFiltersComponent,
  type TaskFilters,
} from "./TaskFilters";
import type { TaskPriority } from "../types";

interface TasksHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateStatus: () => void;
  onCreatePriority: () => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  priorities: TaskPriority[];
  availableSources: string[];
  tasks: Array<{ source?: { platform: string } | null }>;
}

export function TasksHeader({
  searchQuery,
  onSearchChange,
  onCreateStatus,
  onCreatePriority,
  filters,
  onFiltersChange,
  priorities,
  availableSources,
}: TasksHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <TaskFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          priorities={priorities}
          availableSources={availableSources}
        />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onCreateStatus();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Status
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onCreatePriority();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Priority
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
