import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // 👈 import http
import { Server } from "socket.io"; // 👈 import socket.io
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes"; // ✅ import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // 👉 for production, replace with frontend URL
    methods: ["GET", "POST"],
  },
});

// ✅ Make io available in controllers
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// ✅ Handle socket connections
io.on("connection", (socket) => {
  console.log("🔥 A user connected:", socket.id);

  // 👉 User joins their own room with their userId
  socket.on("joinRoom", (userId: string) => {
    socket.join(userId);
    console.log(`✅ User ${socket.id} joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ MongoDB connection + start server
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
