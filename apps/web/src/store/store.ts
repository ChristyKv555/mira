import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import integrationsReducer from "../app/dashboard/connect/store/integrationsSlice";
import { integrationsApi } from "../app/dashboard/connect/store/integrationsApi";
import tasksReducer from "../app/dashboard/tasks/store/tasksSlice";
import { tasksApi } from "../app/dashboard/tasks/store/tasksApi";

// Redux persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  integrations: integrationsReducer,
  tasks: tasksReducer,
  [integrationsApi.reducerPath]: integrationsApi.reducer,
  [tasksApi.reducerPath]: tasksApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(integrationsApi.middleware, tasksApi.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
