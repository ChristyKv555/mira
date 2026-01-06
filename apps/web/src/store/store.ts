import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import integrationsReducer from "../app/dashboard/connect/store/integrationsSlice";
import tasksReducer from "../app/dashboard/tasks/store/tasksSlice";
import keywordsReducer from "../app/dashboard/keywords/store/keywordsSlice";
import { baseApi, streamBaseApi } from "../utils/api/baseQuery";

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
  keywords: keywordsReducer,
  [baseApi.reducerPath]: baseApi.reducer,
  [streamBaseApi.reducerPath]: streamBaseApi.reducer,
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
        ignoredPaths: ["streamApi"],
      },
    }).concat(baseApi.middleware, streamBaseApi.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
