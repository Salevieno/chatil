import { useState } from "react";
import type { FormEvent } from "react";
import { useChat } from "../chatContext";

export function NicknameForm() {
  const { connectUser, connected, nickname, error, clearError } = useChat();
  const [value, setValue] = useState(nickname);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    connectUser(value);
  };

  return (
    <section className="panel panel-accent">
      <h2>Entrar no chat</h2>
      <p className="muted">Defina um nickname para aparecer na sala.</p>

      <form className="nickname-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) clearError();
          }}
          placeholder="Seu nickname"
          disabled={!connected}
        />
        <button type="submit" disabled={!connected}>
          {nickname ? "Atualizar nickname" : "Entrar no chat"}
        </button>
      </form>

      {!connected && <p className="status-pill status-off">Aguardando conexão...</p>}
      {connected && <p className="status-pill status-on">Conectado e pronto para conversar.</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
