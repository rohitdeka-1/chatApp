import express, { Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import User from "./Models/userModel.js";
import Message from "./Models/Message.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import http from "http";
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongoose Connected"))
  .catch((err) => console.error(err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chat-app-seven-dun.vercel.app", "https://chat-rhd.netlify.app", "https://chatapp-front-062p.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.user.userId} connected`);

  socket.on("join_room", (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.user.userId} joined room ${roomID}`);
  });

  socket.on("message", async (data) => {
    const { room, message } = data;
    const sender = socket.user.username;

    const newMessage = new Message({ room, sender, message });
    try {
      await newMessage.save();
      io.to(room).emit("receive_message", { room, sender, message });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.user.userId} disconnected`);
  });
});


const router = Router();
app.use("/api", router);

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).send("User already exists.");

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashPassword });
    await newUser.save();

    res.status(201).send("User Registered successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "All fields are required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "None" });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


router.get("/messages/:roomID", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomID }).sort("timestamp");
    res.json(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});