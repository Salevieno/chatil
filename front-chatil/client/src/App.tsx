import "./App.css";
import { ChatProvider } from "./chatContext";
import { ChatMessages } from "./components/ChatMessages";
import { ChatStatus } from "./components/ChatStatus";
import { NicknameForm } from "./components/NicknameForm";
import { UserList } from "./components/UserList";

function App() {
  return (
    <ChatProvider>
      <main className="app-shell">
        <header className="app-header">
          <div>
            <h1>Chatil, o chat do covil</h1>
          </div>
        </header>

        <section className="layout-grid">
          <div className="column column-main">
            <NicknameForm />
            <ChatStatus />
            <ChatMessages />
          </div>

          <div className="column column-side">
            <UserList />
          </div>
        </section>

        <footer className="app-footer">Versão 1.0.0</footer>
      </main>
    </ChatProvider>
  );
}

export default App;