export enum MessageType {
  TEXT = "text",
  TASK = "task",
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: MessageType;
}

export interface ChatSession {
  id: string;
  title: string;
  type: "ask" | "generate";
  createdAt: Date;
  updatedAt: Date;
}
