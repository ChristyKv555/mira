import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
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
    "ChatSessions",
  ],
  endpoints: () => ({}),
});

// Base query updated to handle SSE for streaming API
export const baseQueryWithEventSource: BaseQueryFn<
  {
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any;
    headers?: Record<string, string>;
    onMessage?: (message: string, ctrl: AbortController) => void;
    onClose?: () => void;
    signal?: AbortSignal;
  },
  unknown,
  unknown
> = async ({
  url,
  method = "POST",
  body,
  params,
  headers = {},
  onMessage,
  onClose,
  signal,
}) => {
  try {
    const ctrl = new AbortController();

    // If an external signal is provided, listen to it and abort our controller when it's aborted
    if (signal) {
      signal.addEventListener("abort", () => {
        ctrl.abort();
      });
    }

    // Build URL with query parameters using the same base URL helper
    let fullUrl = getApiBaseUrl(url);
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            // Handle nested objects
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    await fetchEventSource(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      async onopen(response) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return Promise.resolve();
      },
      onmessage(event) {
        if (onMessage) {
          onMessage(event.data, ctrl);
        }
      },
      onclose() {
        ctrl.abort();
        if (onClose) {
          onClose();
        }
      },
      onerror(err) {
        throw err;
      },
      signal: ctrl.signal,
      credentials: "include",
    });

    return { data: null }; // Return null if the stream completes successfully
  } catch (error) {
    return { error };
  }
};

// Stream API for SSE-based endpoints (e.g., chat streaming)
export const streamBaseApi = createApi({
  reducerPath: "streamApi",
  baseQuery: baseQueryWithEventSource,
  endpoints: () => ({}),
  tagTypes: [],
});
