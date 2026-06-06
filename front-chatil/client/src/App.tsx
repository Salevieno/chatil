import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

function App() {

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    
    const socket = io(import.meta.env.VITE_SOCKET_URL);
    socketRef.current = socket;
    console.log("env = " + import.meta.env.VITE_SOCKET_URL);

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);

      const username = prompt("Digite seu nickname:");
      socket.emit("set_username", username);
    });

    socket.on("user_joined", (data) => {
      setConnected(true);
      console.log("Entrou:", data.username);
    });

    socket.on("user_left", (data) => {
      setConnected(false);
      console.log("Saiu:", data.username);
    });

    socket.on("users_online_update", (users) => {
        console.log("Online:", users);
    });

    socket.on("receive_message", (data) => {
    console.log("RECEBIDO:", data);
      setMessages((prev) => [
        ...prev,
        `[${data.username}]: ${data.message}`
      ]);
    });

    return () => {
      socket.disconnect();
    };

  }, []);


  const sendMessage = () => {
    if (!input.trim()) return;

    socketRef.current?.emit("send_message", {
      message: input
    });

    setInput("");
  };

  return (
  <div style={{ padding: 20 }}>
    <h1>
      {connected ? "Chatil, o chat do covil" : "Desconectado do chatil :/"}
    </h1>

    <div style={{
      border: "1px solid #ccc",
      height: 300,
      overflowY: "auto",
      marginBottom: 10,
      padding: 10
    }}>
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>

    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") sendMessage();
      }}
    />

    <button onClick={sendMessage}>
      Enviar
    </button>

    <p style={{ marginTop: 180 }}>Versão 1.0.0</p>
  </div>
  );
}

export default App;