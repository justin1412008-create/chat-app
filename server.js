const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// Store online users
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected");

    // New user joins
    socket.on("new user", (username) => {
        onlineUsers[socket.id] = username;
        io.emit("online users", Object.values(onlineUsers));
    });

    // Chat messages
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    // Typing indicator
    socket.on("typing", (user) => {
        socket.broadcast.emit("typing", user);
    });

    // Image sending
    socket.on("image", (data) => {
        io.emit("image", data);
    });

    // User disconnects
    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        io.emit("online users", Object.values(onlineUsers));
        console.log("A user disconnected");
    });
});

// ✅ IMPORTANT FIX FOR DEPLOYMENT (Render / Railway / Cloud)
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});