export type ChatMessageType = "message" | "system";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  type: ChatMessageType;
  createdAt?: number;
}

export interface ChatUser {
  id: string;
  username: string;
}

export interface ChatMessagePayload {
  username: string;
  message: string;
  createdAt?: number;
}

export interface ChatErrorPayload {
  message: string;
}

export const SOCKET_EVENTS = {
  JOIN: "chat:join",
  JOINED: "chat:joined",
  MESSAGE_SEND: "chat:message:send",
  MESSAGE_RECEIVE: "chat:message:receive",
  USERS_UPDATE: "chat:users:update",
  LEFT: "chat:left",
  ERROR: "chat:error",
} as const;

export interface SocketEventMap {
  [SOCKET_EVENTS.JOIN]: { username: string };
  [SOCKET_EVENTS.MESSAGE_SEND]: { message: string };
  [SOCKET_EVENTS.JOINED]: ChatUser;
  [SOCKET_EVENTS.LEFT]: ChatUser;
  [SOCKET_EVENTS.USERS_UPDATE]: ChatUser[];
  [SOCKET_EVENTS.MESSAGE_RECEIVE]: ChatMessagePayload;
  [SOCKET_EVENTS.ERROR]: ChatErrorPayload;
}
