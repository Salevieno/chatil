import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS, type ChatMessage, type ChatUser, type SocketEventMap } from "./types/chat";

type ChatContextValue = {
  connected: boolean;
  nickname: string;
  status: string;
  error: string | null;
  messages: ChatMessage[];
  users: ChatUser[];
  connectUser: (nickname: string) => void;
  sendMessage: (message: string) => boolean;
  clearError: () => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState("Conectando ao chat...");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    const client = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: true,
    });

    setSocket(client);

    client.on("connect", () => {
      setConnected(true);
      setStatus("Conectado. Escolha um nickname para entrar no chat.");
    });

    client.on("disconnect", () => {
      setConnected(false);
      setStatus("Conexão encerrada.");
    });

    client.on(SOCKET_EVENTS.JOINED, (data: SocketEventMap[typeof SOCKET_EVENTS.JOINED]) => {
      setStatus(`${data.username} entrou no chat.`);
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.id}-${Date.now()}`,
          username: "Sistema",
          message: `${data.username} entrou no chat.`,
          type: "system",
        },
      ]);
    });

    client.on(SOCKET_EVENTS.LEFT, (data: SocketEventMap[typeof SOCKET_EVENTS.LEFT]) => {
      setStatus(`${data.username} saiu do chat.`);
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.id}-${Date.now()}`,
          username: "Sistema",
          message: `${data.username} saiu do chat.`,
          type: "system",
        },
      ]);
    });

    client.on(SOCKET_EVENTS.USERS_UPDATE, (onlineUsers: SocketEventMap[typeof SOCKET_EVENTS.USERS_UPDATE]) => {
      setUsers(onlineUsers);
    });

    client.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (data: SocketEventMap[typeof SOCKET_EVENTS.MESSAGE_RECEIVE]) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.username}-${Date.now()}`,
          username: data.username,
          message: data.message,
          type: "message",
        },
      ]);
    });

    client.on(SOCKET_EVENTS.ERROR, (data: SocketEventMap[typeof SOCKET_EVENTS.ERROR]) => {
      setError(data.message);
      setStatus("Não foi possível concluir a ação.");
    });

    return () => {
      client.off("connect");
      client.off("disconnect");
      client.off(SOCKET_EVENTS.JOINED);
      client.off(SOCKET_EVENTS.LEFT);
      client.off(SOCKET_EVENTS.USERS_UPDATE);
      client.off(SOCKET_EVENTS.MESSAGE_RECEIVE);
      client.off(SOCKET_EVENTS.ERROR);
      client.disconnect();
    };
  }, []);

  const connectUser = (value: string) => {
    const trimmed = value.trim().slice(0, 20);

    if (!trimmed) {
      setError("Informe um nickname válido.");
      return;
    }

    setNickname(trimmed);
    setError(null);
    socket?.emit(SOCKET_EVENTS.JOIN, { username: trimmed });
  };

  const sendMessage = (message: string) => {
    const trimmed = message.trim();

    if (!trimmed) {
      setError("Digite uma mensagem antes de enviar.");
      return false;
    }

    if (!nickname) {
      setError("Defina um nickname antes de enviar mensagens.");
      return false;
    }

    socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, { message: trimmed });
    return true;
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({
      connected,
      nickname,
      status,
      error,
      messages,
      users,
      connectUser,
      sendMessage,
      clearError,
    }),
    [connected, nickname, status, error, messages, users]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside a ChatProvider");
  }

  return context;
}
