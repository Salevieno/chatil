const { setUser, getUser, getUsersList, deleteUser } = require("./userStore");
const { SOCKET_EVENTS } = require("./socketEvents");

function normalizeMessage(value) {
  const message = String(value ?? "")
    .trim()
    .slice(0, 300);

  return message.length > 0 ? message : "";
}

function emitError(socket, message) {
  socket.emit(SOCKET_EVENTS.ERROR, { message });
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on(SOCKET_EVENTS.JOIN, (data) => {
      try {
        const username = String(data?.username ?? "").trim();
        const user = setUser(socket.id, username);

        socket.emit(SOCKET_EVENTS.JOINED, { id: user.id, username: user.username });
        socket.broadcast.emit(SOCKET_EVENTS.JOINED, { id: user.id, username: user.username });
        io.emit(SOCKET_EVENTS.USERS_UPDATE, getUsersList());
      } catch (error) {
        console.error("Erro ao definir username:", error.message);
        emitError(socket, error.message);
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SEND, (data) => {
      try {
        const user = getUser(socket.id);

        if (!user) {
          emitError(socket, "Defina um nickname antes de enviar mensagens.");
          return;
        }

        const message = normalizeMessage(data?.message);

        if (!message) {
          emitError(socket, "Mensagem inválida.");
          return;
        }

        console.log("Mensagem recebida de:", socket.id, message);

        io.emit(SOCKET_EVENTS.MESSAGE_RECEIVE, {
          username: user.username,
          message,
        });
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error.message);
        emitError(socket, "Não foi possível enviar a mensagem.");
      }
    });

    socket.on("disconnect", () => {
      const user = deleteUser(socket.id);

      if (user) {
        io.emit(SOCKET_EVENTS.LEFT, { id: socket.id, username: user.username });
        io.emit(SOCKET_EVENTS.USERS_UPDATE, getUsersList());
      }

      console.log("Cliente desconectado:", socket.id);
    });
  });
}

module.exports = { registerSocketHandlers };
