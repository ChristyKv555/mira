import type { Integration } from "../types";
import { baseApi } from "@/utils/api/baseQuery";

export const integrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrations: builder.query<{ integrations: Integration[] }, void>({
      query: () => "/api/integrations/list",
      providesTags: ["Integrations"],
    }),
    connectIntegration: builder.mutation<
      { integration: Integration },
      { platform: string }
    >({
      query: (body) => ({
        url: "/api/integrations/connect",
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
        url: "/api/integrations/disconnect",
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

