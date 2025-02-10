import express, { Router } from "express";
import { chats } from "./data/data.js";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import User from "./Models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const PORT = process.env.PORT || 5000;

main()
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

const app = express();
const router = Router();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API IS RUNNING");
});

app.use(
  cors({
    origin: ["http://localhost:5173", "https://chat-app-seven-dun.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/api", router);

router.get("/chat", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(chats);
});

router.get("/chat/:id", (req, res) => {
  const singleChat = chats.find((c) => c._id === req.params.id);
  res.send(singleChat);
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).send("User already exists.");
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashPassword,
    });

    await newUser.save();

    return res.status(201).send("User Registered successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error.");
  }
});

router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials.");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error.");
  }
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
