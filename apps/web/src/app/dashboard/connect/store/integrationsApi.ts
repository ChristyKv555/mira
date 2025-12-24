import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Integration } from "../types";
import { getApiBaseUrl } from "@/utils/api";

const apiBaseUrl = getApiBaseUrl("/api/integrations");

export const integrationsApi = createApi({
  reducerPath: "integrationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["Integrations"],
  endpoints: (builder) => ({
    getIntegrations: builder.query<{ integrations: Integration[] }, void>({
      query: () => "/list",
      providesTags: ["Integrations"],
    }),
    connectIntegration: builder.mutation<
      { integration: Integration },
      { platform: string }
    >({
      query: (body) => ({
        url: "/connect",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Integrations"],
    }),
    disconnectIntegration: builder.mutation<
      { success: boolean },
      { integrationId: string }
    >({
      query: (body) => ({
        url: "/disconnect",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Integrations"],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useConnectIntegrationMutation,
  useDisconnectIntegrationMutation,
} = integrationsApi;
