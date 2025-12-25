import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TaskStatus, TaskPriority } from "../../tasks/types";
import { getApiBaseUrl } from "@/utils/api";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(""),
  prepareHeaders: (headers) => {
    return headers;
  },
});

export const keywordsApi = createApi({
  reducerPath: "keywordsApi",
  baseQuery,
  tagTypes: ["Priorities", "Statuses", "PriorityMappings", "StatusMappings"],
  endpoints: (builder) => ({
    getPriorities: builder.query<{ priorities: TaskPriority[] }, void>({
      query: () => "/api/priorities",
      providesTags: ["Priorities"],
    }),
    getStatuses: builder.query<{ statuses: TaskStatus[] }, void>({
      query: () => "/api/statuses",
      providesTags: ["Statuses"],
    }),
    // TODO: Add API endpoints for mappings when backend is ready
    // getPriorityMappings: builder.query<...>({...}),
    // createPriorityMapping: builder.mutation<...>({...}),
    // deletePriorityMapping: builder.mutation<...>({...}),
  }),
});

export const { useGetPrioritiesQuery, useGetStatusesQuery } = keywordsApi;
