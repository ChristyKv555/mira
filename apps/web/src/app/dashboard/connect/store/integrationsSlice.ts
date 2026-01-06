import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Integration } from "../types";

interface IntegrationsState {
  integrations: Integration[];
  connectingId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: IntegrationsState = {
  integrations: [],
  connectingId: null,
  isLoading: false,
  error: null,
};

const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    setIntegrations: (state, action: PayloadAction<Integration[]>) => {
      state.integrations = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addIntegration: (state, action: PayloadAction<Integration>) => {
      state.integrations.push(action.payload);
    },
    updateIntegration: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Integration> }>
    ) => {
      const index = state.integrations.findIndex(
        (integration) => integration.id === action.payload.id
      );
      if (index !== -1) {
        state.integrations[index] = {
          ...state.integrations[index],
          ...action.payload.updates,
        };
      }
    },
    removeIntegration: (state, action: PayloadAction<string>) => {
      state.integrations = state.integrations.filter(
        (integration) => integration.id !== action.payload
      );
    },
    setConnecting: (state, action: PayloadAction<string | null>) => {
      state.connectingId = action.payload;
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
  setIntegrations,
  addIntegration,
  updateIntegration,
  removeIntegration,
  setConnecting,
  setLoading,
  setError,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

