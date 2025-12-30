import { baseApi } from "@/utils/api/baseQuery";
import type {
  PriorityMapping,
  StatusMapping,
  CreatePriorityMappingInput,
  CreateStatusMappingInput,
  UpdatePriorityMappingInput,
  UpdateStatusMappingInput,
} from "../types";

export const keywordsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetPriorityMappingsQuery,
  useCreatePriorityMappingMutation,
  useUpdatePriorityMappingMutation,
  useDeletePriorityMappingMutation,
  useGetStatusMappingsQuery,
  useCreateStatusMappingMutation,
  useUpdateStatusMappingMutation,
  useDeleteStatusMappingMutation,
} = keywordsApi;

