import { streamBaseApi } from "@/utils/api/baseQuery";

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

export const { useStreamAssistantChatMutation } = assistantChatStreamApi;
