import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TaskStatus, TaskPriority } from "../../tasks/types";
import { getApiBaseUrl } from "@/utils/api";

export interface PriorityMapping {
  id: string;
  userId: string;
  priorityId: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusMapping {
  id: string;
  userId: string;
  statusId: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePriorityMappingInput {
  priorityId: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface CreateStatusMappingInput {
  statusId: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface UpdatePriorityMappingInput {
  id: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface UpdateStatusMappingInput {
  id: string;
  keywords?: string[];
  isActive?: boolean;
}

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
    getPriorityMappings: builder.query<
      { mappings: PriorityMapping[] },
      { priorityId?: string } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.priorityId) {
          searchParams.append("priorityId", params.priorityId);
        }
        const queryString = searchParams.toString();
        return `/api/priority-mappings${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["PriorityMappings"],
    }),
    createPriorityMapping: builder.mutation<
      { mapping: PriorityMapping },
      CreatePriorityMappingInput
    >({
      query: (body) => ({
        url: "/api/priority-mappings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PriorityMappings"],
    }),
    updatePriorityMapping: builder.mutation<
      { mapping: PriorityMapping },
      UpdatePriorityMappingInput
    >({
      query: ({ id, ...body }) => ({
        url: `/api/priority-mappings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PriorityMappings"],
    }),
    deletePriorityMapping: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/priority-mappings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PriorityMappings"],
    }),
    getStatusMappings: builder.query<
      { mappings: StatusMapping[] },
      { statusId?: string } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.statusId) {
          searchParams.append("statusId", params.statusId);
        }
        const queryString = searchParams.toString();
        return `/api/status-mappings${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["StatusMappings"],
    }),
    createStatusMapping: builder.mutation<
      { mapping: StatusMapping },
      CreateStatusMappingInput
    >({
      query: (body) => ({
        url: "/api/status-mappings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StatusMappings"],
    }),
    updateStatusMapping: builder.mutation<
      { mapping: StatusMapping },
      UpdateStatusMappingInput
    >({
      query: ({ id, ...body }) => ({
        url: `/api/status-mappings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["StatusMappings"],
    }),
    deleteStatusMapping: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/status-mappings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StatusMappings"],
    }),
  }),
});

export const {
  useGetPrioritiesQuery,
  useGetStatusesQuery,
  useGetPriorityMappingsQuery,
  useCreatePriorityMappingMutation,
  useUpdatePriorityMappingMutation,
  useDeletePriorityMappingMutation,
  useGetStatusMappingsQuery,
  useCreateStatusMappingMutation,
  useUpdateStatusMappingMutation,
  useDeleteStatusMappingMutation,
} = keywordsApi;
