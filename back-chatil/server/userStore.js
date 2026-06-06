const users = new Map();

function sanitizeUsername(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 20);
}

function setUser(socketId, username) {
  const sanitizedUsername = sanitizeUsername(username);

  if (!sanitizedUsername) {
    throw new Error("Nome de usuário inválido.");
  }

  const user = { id: socketId, username: sanitizedUsername };
  users.set(socketId, user);

  return user;
}

function getUser(socketId) {
  return users.get(socketId);
}

function getUsersList() {
  return Array.from(users.values());
}

function deleteUser(socketId) {
  const user = users.get(socketId);
  users.delete(socketId);
  return user;
}

module.exports = {
  setUser,
  getUser,
  getUsersList,
  deleteUser,
};
