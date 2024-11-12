const { log } = require("console");
const express = require("express");

const app = express();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

const users = {};

io.sockets.on("connection", (client) => {
  // Corrected `broadcast` to `broadcast.emit`
  const transmission = (event, data) => {
    client.emit(event, data);
    client.broadcast.emit(event, data);
  };

  // Send the list of users to the new client
  transmission("user", users);

  // Handle incoming messages
  client.on("message", (message) => {
    if (users[client.id] !== message.name) {
      // Corrected `===` to `=`
      users[client.id] = message.name;

      // Broadcast updated user list
      transmission("user", users);
    }

    // Broadcast the message to all clients
    transmission("message", message);
  });

  // Log the users object to the console
  console.log(users);

  // Handle client disconnect
  client.on("disconnect", () => {
    delete users[client.id];
    transmission("user", users); // Update other clients about the disconnected user
  });
});

server.listen(5000, () => {
  console.log("Serverul ruleaza pe port: 5000");
});
