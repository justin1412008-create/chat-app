const express = require("express");
const app = express();
const path = require("path");

const http = require("http").createServer(app);
const io = require("socket.io")(http);

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Explicit home route (THIS FIXES "Not Found")
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Store online users
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("new user", (username) => {
        onlineUsers[socket.id] = username;
        io.emit("online users", Object.values(onlineUsers));
    });

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("typing", (user) => {
        socket.broadcast.emit("typing", user);
    });

    socket.on("image", (data) => {
        io.emit("image", data);
    });

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        io.emit("online users", Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log("Server running on port", PORT);
});