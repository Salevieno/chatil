import { useChat } from "../chatContext";

export function UserList() {
  const { users, nickname } = useChat();

  return (
    <aside className="panel sidebar-panel">
      <p className="eyebrow">Usuários online</p>
      <h2>Quem está na sala</h2>

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className={user.username === nickname ? "user-chip me" : "user-chip"}>
            <span className="dot" />
            {user.username}
            {user.username === nickname ? " (você)" : ""}
          </li>
        ))}
      </ul>

      {users.length === 0 && <p className="muted">Ninguém entrou ainda.</p>}
    </aside>
  );
}
