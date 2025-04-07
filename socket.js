import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let activeRooms = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create_room", (room) => {
        if (!activeRooms[room]) {
            activeRooms[room] = [];
        }
        activeRooms[room].push(socket.id);
        socket.join(room);
        console.log(`Room ${room} created by ${socket.id}`);
    });

    socket.on("check_room", (room, callback) => {
        const roomExists = activeRooms[room] && activeRooms[room].length > 0;
        console.log(`Checking room ${room}: Exists - ${roomExists}`);
        callback(roomExists);
    });

    socket.on("join_room", (room) => {
        if (activeRooms[room]) {
            activeRooms[room].push(socket.id);
            socket.join(room);
            console.log(`${socket.id} joined room ${room}`);
            io.to(room).emit("user_status", { online: activeRooms[room].length });
        }
    });

    // Example server-side code
io.in(room).emit("user_status", {
    users: Array.from(usersInRoom[room]), // assuming usersInRoom[room] is a Set of usernames
  });
  
    socket.on("send_message", ({ room, message, sender, replyTo }) => {
        io.to(room).emit("receive_message", { message, sender, replyTo });
    });

    socket.on("typing", ({ room, isTyping }) => {
        socket.to(room).emit("user_typing", { isTyping });
    });

    socket.on("disconnect", () => {
        for (const room in activeRooms) {
            activeRooms[room] = activeRooms[room].filter((id) => id !== socket.id);
            if (activeRooms[room].length === 0) delete activeRooms[room];
            io.to(room).emit("user_status", { online: activeRooms[room]?.length || 0 });
        }
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
