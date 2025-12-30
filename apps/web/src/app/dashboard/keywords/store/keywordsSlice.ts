import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TaskStatus, TaskPriority } from "../../tasks/types";

interface KeywordsState {
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  selectedType: "priority" | "status";
  selectedItemId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: KeywordsState = {
  priorities: [],
  statuses: [],
  selectedType: "priority",
  selectedItemId: null,
  isLoading: false,
  error: null,
};

const keywordsSlice = createSlice({
  name: "keywords",
  initialState,
  reducers: {
    setPriorities: (state, action: PayloadAction<TaskPriority[]>) => {
      state.priorities = [...action.payload].sort((a, b) => a.level - b.level);
    },
    setStatuses: (state, action: PayloadAction<TaskStatus[]>) => {
      state.statuses = [...action.payload].sort((a, b) => a.order - b.order);
    },
    setSelectedType: (state, action: PayloadAction<"priority" | "status">) => {
      state.selectedType = action.payload;
      state.selectedItemId = null; // Reset selection when switching type
    },
    setSelectedItemId: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
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
  setPriorities,
  setStatuses,
  setSelectedType,
  setSelectedItemId,
  setLoading,
  setError,
} = keywordsSlice.actions;

export default keywordsSlice.reducer;
