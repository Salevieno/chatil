const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// CONEXÃO COM O SERVIDOR

const app = express();
const server = http.createServer(app);
const users = new Map(); // CRIAÇÃO DE USUÁRIOS

const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Definir username
    socket.on("set_username", (username) => {
        users.set(socket.id, username);

        // avisa ao usuário que ele logou
        socket.emit("user_joined", {
            id: socket.id,
            username
        });

        // avisa todos os outros usuários do login
        socket.broadcast.emit("user_joined", {
            id: socket.id,
            username
        });

        // atualiza lista geral
        io.emit("users_online_update", Array.from(users.values()));
    });

    socket.on("send_message", (data) => {
        const username = users.get(socket.id);

        if (!username) return; // segurança básica

    console.log("Mensagem recebida de:", socket.id, data);
        io.emit("receive_message", {
            username,
            message: data.message
        });
    });

    
    // Disconnect
    socket.on("disconnect", () => {
        const username = users.get(socket.id);

        users.delete(socket.id);

        io.emit("user_left", {
            id: socket.id,
            username
        });

        io.emit("users_online_update", Array.from(users.values()));

        console.log("Cliente desconectado:", socket.id);
    });
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Servidor iniciado");
});

