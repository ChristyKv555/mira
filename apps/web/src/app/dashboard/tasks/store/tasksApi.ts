import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
  CreateStatusInput,
  CreatePriorityInput,
  UpdateTaskInput,
} from "../types";
import { getApiBaseUrl } from "@/utils/api";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(""),
  prepareHeaders: (headers) => {
    return headers;
  },
});

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery,
  tagTypes: ["Tasks", "Statuses", "Priorities"],
  endpoints: (builder) => ({
    getTasks: builder.query<{ tasks: Task[] }, void>({
      query: () => "/api/tasks/list",
      providesTags: ["Tasks"],
    }),
    getStatuses: builder.query<{ statuses: TaskStatus[] }, void>({
      query: () => "/api/statuses",
      providesTags: ["Statuses"],
    }),
    getPriorities: builder.query<{ priorities: TaskPriority[] }, void>({
      query: () => "/api/priorities",
      providesTags: ["Priorities"],
    }),
    createTask: builder.mutation<{ task: Task }, CreateTaskInput>({
      query: (body) => ({
        url: "/api/tasks/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: builder.mutation<{ task: Task }, UpdateTaskInput>({
      query: ({ id, ...body }) => ({
        url: `/api/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    createStatus: builder.mutation<{ status: TaskStatus }, CreateStatusInput>({
      query: (body) => ({
        url: "/api/statuses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Statuses"],
    }),
    createPriority: builder.mutation<
      { priority: TaskPriority },
      CreatePriorityInput
    >({
      query: (body) => ({
        url: "/api/priorities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Priorities"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetStatusesQuery,
  useGetPrioritiesQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateStatusMutation,
  useCreatePriorityMutation,
} = tasksApi;
