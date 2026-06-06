import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";

export type ChatMessage = {
  id: string;
  username: string;
  message: string;
  type?: "message" | "system";
};

export type ChatUser = {
  id: string;
  username: string;
};

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

    client.on("user_joined", (data: ChatUser) => {
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

    client.on("user_left", (data: ChatUser) => {
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

    client.on("users_online_update", (onlineUsers: ChatUser[]) => {
      setUsers(onlineUsers);
    });

    client.on("receive_message", (data: { username: string; message: string }) => {
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

    client.on("chat_error", (data: { message: string }) => {
      setError(data.message);
      setStatus("Não foi possível concluir a ação.");
    });

    return () => {
      client.off("connect");
      client.off("disconnect");
      client.off("user_joined");
      client.off("user_left");
      client.off("users_online_update");
      client.off("receive_message");
      client.off("chat_error");
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
    socket?.emit("set_username", trimmed);
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

    socket?.emit("send_message", { message: trimmed });
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
