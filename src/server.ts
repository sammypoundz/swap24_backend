import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // 👈 import http
import { Server } from "socket.io"; // 👈 import socket.io
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import smartContractRoutes from "./routes/smartcontractRoutes";
import offerRoutes from "./routes/offerRoutes";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173", // 👉 Vite dev server
  "http://localhost:5000", // 👉 Vite dev server
   "http://127.0.0.1:5173", // some browsers use this
  "https://swap24.vercel.app", 
];

// ✅ CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// ✅ Make io available in controllers
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/smartcontract", smartContractRoutes);
app.use("/api/offers", offerRoutes);

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
