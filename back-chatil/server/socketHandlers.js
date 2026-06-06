const { setUser, getUser, getUsersList, deleteUser } = require("./userStore");

function normalizeMessage(value) {
  const message = String(value ?? "")
    .trim()
    .slice(0, 300);

  return message.length > 0 ? message : "";
}

function emitError(socket, message) {
  socket.emit("chat_error", { message });
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("set_username", (username) => {
      try {
        const user = setUser(socket.id, username);

        socket.emit("user_joined", { id: user.id, username: user.username });
        socket.broadcast.emit("user_joined", { id: user.id, username: user.username });
        io.emit("users_online_update", getUsersList());
      } catch (error) {
        console.error("Erro ao definir username:", error.message);
        emitError(socket, error.message);
      }
    });

    socket.on("send_message", (data) => {
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

        io.emit("receive_message", {
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
        io.emit("user_left", { id: socket.id, username: user.username });
        io.emit("users_online_update", getUsersList());
      }

      console.log("Cliente desconectado:", socket.id);
    });
  });
}

module.exports = { registerSocketHandlers };
