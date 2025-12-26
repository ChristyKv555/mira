"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useGetTasksQuery } from "./tasks/queries/tasksApi";
import { setTasks } from "./tasks/store/tasksSlice";
import { useAppSelector } from "@/store/hooks";
import { HighAttentionTasks } from "./components/HighAttentionTasks";
import { TaskStatistics } from "./components/TaskStatistics";
import { SourceBasedTasks } from "./components/SourceBasedTasks";
import { LoadingSpinner } from "./connect/components/LoadingSpinner";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [viewType, setViewType] = useState<"status" | "priority" | "dueDate">(
    "status"
  );

  // Fetch tasks using RTK Query
  const { data: tasksData, isLoading } = useGetTasksQuery();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  // Update Redux state when API data changes
  useEffect(() => {
    if (tasksData?.tasks) {
      dispatch(setTasks(tasksData.tasks));
    }
  }, [tasksData, dispatch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            View insights and manage your tasks
          </p>
        </motion.div>

        {/* High Attention Tasks and Task Statistics in same row */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Task Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-[600px]"
          >
            <TaskStatistics
              tasks={tasks}
              viewType={viewType}
              onViewChange={setViewType}
            />
          </motion.div>

          {/* High Attention Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-[600px]"
          >
            <HighAttentionTasks tasks={tasks} />
          </motion.div>
        </div>

        {/* Source-based Tasks - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <SourceBasedTasks tasks={tasks} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Link href="/dashboard/tasks">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
            >
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">View All Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Manage and organize all your tasks in the Kanban board
              </p>
            </motion.div>
          </Link>

          <Link href="/dashboard/connect">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
            >
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Connect Sources</h3>
              <p className="text-sm text-muted-foreground">
                Connect your platforms to aggregate tasks automatically
              </p>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
          >
            <BarChart3 className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track your productivity and task completion trends
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
