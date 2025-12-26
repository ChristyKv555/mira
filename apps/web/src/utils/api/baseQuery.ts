import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "./api";

// Base Query for the API
const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(""),
  credentials: "include",
  prepareHeaders: (headers) => {
    return headers;
  },
});

// Base API with all tag types
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Tasks",
    "Statuses",
    "Priorities",
    "PriorityMappings",
    "StatusMappings",
    "Integrations",
  ],
  endpoints: () => ({}),
});
