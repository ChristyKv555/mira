"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Task } from "../tasks/types";
import {
  getCompletedTasksCount,
  getPendingTasksCount,
  getOverdueTasksCount,
  getCompletionRate,
} from "../utils/taskFilters";
import { getViewData, type ViewType } from "../utils/taskStatistics";

interface TaskStatisticsProps {
  tasks: Task[];
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function TaskStatistics({
  tasks,
  viewType,
  onViewChange,
}: TaskStatisticsProps) {
  const totalTasks = tasks.length;
  const completedTasks = getCompletedTasksCount(tasks);
  const pendingTasks = getPendingTasksCount(tasks);
  const overdueTasks = getOverdueTasksCount(tasks);
  const completionRate = getCompletionRate(tasks);

  const viewData = getViewData(tasks, viewType);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Task Statistics</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              View:{" "}
              {viewType === "status"
                ? "Status"
                : viewType === "priority"
                  ? "Priority"
                  : "Due Date"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewChange("status")}>
              By Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewChange("priority")}>
              By Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewChange("dueDate")}>
              By Due Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {completedTasks}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{pendingTasks}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {overdueTasks}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Chart View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Distribution by{" "}
            {viewType === "status"
              ? "Status"
              : viewType === "priority"
                ? "Priority"
                : "Due Date"}
          </h3>
          <span className="text-xs text-muted-foreground">
            {completionRate.toFixed(0)}% Complete
          </span>
        </div>

        <div className="space-y-3">
          {viewData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
