import { useChat } from "../chatContext";

export function ChatStatus() {
  const { connected, nickname, status, users } = useChat();

  return (
    <section className="panel">
      <p className="eyebrow">Status da sala</p>
      <h2>{connected ? "Chatil, o chat do covil" : "Conectando ao chatil..."}</h2>
      <p className="muted">{status}</p>
      <div className="status-grid">
        <article>
          <strong>{connected ? "Online" : "Offline"}</strong>
          <span>Conexão</span>
        </article>
        <article>
          <strong>{nickname || "—"}</strong>
          <span>Nickname</span>
        </article>
        <article>
          <strong>{users.length}</strong>
          <span>Usuários online</span>
        </article>
      </div>
    </section>
  );
}
