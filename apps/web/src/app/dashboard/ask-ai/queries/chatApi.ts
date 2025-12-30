import { streamBaseApi } from "@/utils/api/baseQuery";
import { baseApi } from "@/utils/api/baseQuery";
import { ChatSession } from "../types/chat.types";

export interface AssistantChatStreamParams {
  message: string;
  sessionId?: string;
  type?: "ask" | "generate";
  handleStream: (message: string) => void;
  handleClose: () => void;
  signal?: AbortSignal;
}

export const assistantChatStreamApi = streamBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    streamAssistantChat: builder.mutation<void, AssistantChatStreamParams>({
      query: ({
        message,
        sessionId,
        type,
        handleStream,
        handleClose,
        signal,
      }) => ({
        url: "/api/assistant/chat/stream",
        method: "POST",
        body: { message, sessionId, type },
        signal,
        onMessage: (message) => {
          handleStream(message);
        },
        onClose: () => {
          handleClose();
        },
      }),
    }),
  }),
});

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatSessions: builder.query<{ sessions: ChatSession[] }, void>({
      query: () => "/api/assistant/chat/sessions",
      providesTags: ["ChatSessions"],
    }),
    getChatSession: builder.query<
      {
        session: ChatSession;
        messages: Array<{
          id: string;
          role: "user" | "assistant";
          content: string;
          createdAt: string;
        }>;
      },
      string
    >({
      query: (sessionId) => `/api/assistant/chat/sessions/${sessionId}`,
    }),
    deleteChatSession: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/api/assistant/chat/sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatSessions"],
    }),
  }),
});

export const { useStreamAssistantChatMutation } = assistantChatStreamApi;
export const {
  useGetChatSessionsQuery,
  useGetChatSessionQuery,
  useDeleteChatSessionMutation,
} = chatApi;
