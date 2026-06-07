const SOCKET_EVENTS = Object.freeze({
  JOIN: "chat:join",
  JOINED: "chat:joined",
  MESSAGE_SEND: "chat:message:send",
  MESSAGE_RECEIVE: "chat:message:receive",
  USERS_UPDATE: "chat:users:update",
  LEFT: "chat:left",
  ERROR: "chat:error",
});

module.exports = { SOCKET_EVENTS };
