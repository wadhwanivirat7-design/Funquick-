/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vibepulse.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    displayName TEXT,
    photoURL TEXT,
    email TEXT,
    bio TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    videoUrl TEXT,
    thumbnailUrl TEXT,
    creatorId TEXT,
    creatorName TEXT,
    creatorPhoto TEXT,
    likes TEXT, -- JSON array of uids
    shares INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    text TEXT,
    senderId TEXT,
    senderName TEXT,
    senderPhoto TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth", (req, res) => {
    const { uid, displayName, photoURL, email } = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO users (uid, displayName, photoURL, email) VALUES (?, ?, ?, ?)");
    stmt.run(uid, displayName, photoURL, email);
    res.json({ success: true });
  });

  app.get("/api/videos", (req, res) => {
    const videos = db.prepare("SELECT * FROM videos ORDER BY createdAt DESC LIMIT 20").all() as any[];
    res.json(videos.map(v => ({
      ...v,
      likes: JSON.parse(v.likes || "[]"),
    })));
  });

  app.post("/api/videos", (req, res) => {
    const { id, title, description, videoUrl, thumbnailUrl, creatorId, creatorName, creatorPhoto } = req.body;
    const stmt = db.prepare(`
      INSERT INTO videos (id, title, description, videoUrl, thumbnailUrl, creatorId, creatorName, creatorPhoto, likes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, description, videoUrl, thumbnailUrl, creatorId, creatorName, creatorPhoto, "[]");
    res.json({ success: true });
  });

  app.post("/api/videos/:id/like", (req, res) => {
    const { userId } = req.body;
    const video = db.prepare("SELECT likes FROM videos WHERE id = ?").get(req.params.id) as any;
    if (!video) return res.status(404).json({ error: "Video not found" });

    let likes = JSON.parse(video.likes || "[]");
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    db.prepare("UPDATE videos SET likes = ? WHERE id = ?").run(JSON.stringify(likes), req.params.id);
    res.json({ likes });
  });

  app.get("/api/messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages ORDER BY createdAt ASC LIMIT 100").all();
    res.json(messages);
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("join-chat", () => {
      socket.join("global-chat");
    });

    socket.on("send-message", (msg) => {
      const id = Math.random().toString(36).substr(2, 9);
      const stmt = db.prepare("INSERT INTO messages (id, text, senderId, senderName, senderPhoto) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, msg.text, msg.senderId, msg.senderName, msg.senderPhoto);
      
      const savedMsg = { ...msg, id, createdAt: new Date().toISOString() };
      io.to("global-chat").emit("new-message", savedMsg);
    });

    // Video Call Signaling (Enhanced for Group Rooms)
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      const clients = io.sockets.adapter.rooms.get(roomId);
      const usersInRoom = clients ? Array.from(clients).filter(id => id !== socket.id) : [];
      socket.emit("all-users", usersInRoom);
    });

    socket.on("sending-signal", (payload) => {
      io.to(payload.userToSignal).emit("user-joined", {
        signal: payload.signal,
        callerId: payload.callerId,
        audioOnly: payload.audioOnly,
      });
    });

    socket.on("returning-signal", (payload) => {
      io.to(payload.callerId).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    // Multiplayer Game Logic
    socket.on("game:join", (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`User ${socket.id} joined game ${gameId}`);
    });

    socket.on("game:action", (data) => {
      // Broadcast game actions to everyone in the room except the sender
      socket.to(`game:${data.gameId}`).emit("game:update", data);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
