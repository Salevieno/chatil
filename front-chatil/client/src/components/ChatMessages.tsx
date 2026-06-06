import { useState } from "react";
import { useChat } from "../chatContext";

export function ChatMessages() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (sendMessage(input)) {
      setInput("");
    }
  };

  return (
    <section className="panel chat-panel">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Mensagens</p>
          <h2>Conversas em tempo real</h2>
        </div>
      </div>

      <div className="message-list">
        {messages.length === 0 && (
          <p className="empty-state">Ainda não há mensagens. Seja o primeiro a falar.</p>
        )}

        {messages.map((message) => (
          <article
            key={message.id}
            className={message.type === "system" ? "message message-system" : "message"}
          >
            <strong>{message.username}</strong>
            <p>{message.message}</p>
          </article>
        ))}
      </div>

      <div className="composer">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Digite sua mensagem..."
        />
        <button type="button" onClick={handleSend}>Enviar</button>
      </div>
    </section>
  );
}
