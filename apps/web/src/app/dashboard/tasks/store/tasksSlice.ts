import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskStatus, TaskPriority } from "../types";

interface TasksState {
  tasks: Task[];
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: TasksState = {
  tasks: [],
  statuses: [],
  priorities: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  searchQuery: "",
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Task> }>
    ) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload.updates,
        };
      }
      // Update selected task if it's the same one
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = state.tasks[index];
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },
    setStatuses: (state, action: PayloadAction<TaskStatus[]>) => {
      // Create a new array to avoid mutating frozen data from RTK Query
      state.statuses = [...action.payload].sort((a, b) => a.order - b.order);
    },
    addStatus: (state, action: PayloadAction<TaskStatus>) => {
      state.statuses.push(action.payload);
      // Create a new array to avoid mutating frozen data
      state.statuses = [...state.statuses].sort((a, b) => a.order - b.order);
    },
    updateStatus: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<TaskStatus> }>
    ) => {
      const index = state.statuses.findIndex(
        (status) => status.id === action.payload.id
      );
      if (index !== -1) {
        state.statuses[index] = {
          ...state.statuses[index],
          ...action.payload.updates,
        };
        // Create a new array to avoid mutating frozen data
        state.statuses = [...state.statuses].sort((a, b) => a.order - b.order);
      }
    },
    removeStatus: (state, action: PayloadAction<string>) => {
      state.statuses = state.statuses.filter(
        (status) => status.id !== action.payload
      );
    },
    setPriorities: (state, action: PayloadAction<TaskPriority[]>) => {
      // Create a new array to avoid mutating frozen data from RTK Query
      state.priorities = [...action.payload].sort((a, b) => a.level - b.level);
    },
    addPriority: (state, action: PayloadAction<TaskPriority>) => {
      state.priorities.push(action.payload);
      // Create a new array to avoid mutating frozen data
      state.priorities = [...state.priorities].sort(
        (a, b) => a.level - b.level
      );
    },
    updatePriority: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<TaskPriority> }>
    ) => {
      const index = state.priorities.findIndex(
        (priority) => priority.id === action.payload.id
      );
      if (index !== -1) {
        state.priorities[index] = {
          ...state.priorities[index],
          ...action.payload.updates,
        };
        // Create a new array to avoid mutating frozen data
        state.priorities = [...state.priorities].sort(
          (a, b) => a.level - b.level
        );
      }
    },
    removePriority: (state, action: PayloadAction<string>) => {
      state.priorities = state.priorities.filter(
        (priority) => priority.id !== action.payload
      );
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setStatuses,
  addStatus,
  updateStatus,
  removeStatus,
  setPriorities,
  addPriority,
  updatePriority,
  removePriority,
  setSelectedTask,
  setSearchQuery,
  setLoading,
  setError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
