import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("music_app.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  );
  CREATE TABLE IF NOT EXISTS saved_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'song', 'artist', 'album', 'chart'
    item_id TEXT,
    title TEXT,
    subtitle TEXT,
    image_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
      res.json({ success: true, user: { id: info.lastInsertRowid, email, name } });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Deezer API Proxy
  app.get("/api/deezer/search", async (req, res) => {
    const { q, type } = req.query;
    try {
      const response = await fetch(`https://api.deezer.com/search?q=${q}`);
      const data = await response.json();
      
      // Map Deezer data to our MusicItem interface
      const results = (data.data || []).map((item: any) => ({
        id: item.id.toString(),
        title: item.title || item.name,
        subtitle: item.artist?.name || (item.type === 'artist' ? 'Artist' : ''),
        image_url: item.album?.cover_medium || item.picture_medium || "https://picsum.photos/seed/music/200/200",
        type: item.type === 'track' ? 'song' : item.type
      }));
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from Deezer" });
    }
  });

  app.get("/api/deezer/chart", async (req, res) => {
    try {
      const response = await fetch("https://api.deezer.com/chart");
      const data = await response.json();
      
      // Map Deezer tracks chart to our MusicItem interface
      const results = (data.tracks?.data || []).map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        subtitle: item.artist?.name,
        image_url: item.album?.cover_medium,
        type: 'song'
      }));
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch charts from Deezer" });
    }
  });

  // Saved Items Routes
  app.get("/api/saved/:userId", (req, res) => {
    const items = db.prepare("SELECT * FROM saved_items WHERE user_id = ?").all(req.params.userId);
    res.json(items);
  });

  app.post("/api/saved", (req, res) => {
    const { user_id, type, item_id, title, subtitle, image_url } = req.body;
    db.prepare("INSERT INTO saved_items (user_id, type, item_id, title, subtitle, image_url) VALUES (?, ?, ?, ?, ?, ?)").run(user_id, type, item_id, title, subtitle, image_url);
    res.json({ success: true });
  });

  app.delete("/api/saved/:userId/:itemId", (req, res) => {
    db.prepare("DELETE FROM saved_items WHERE user_id = ? AND item_id = ?").run(req.params.userId, req.params.itemId);
    res.json({ success: true });
  });

  // Mock Billboard Data
  app.get("/api/charts/billboard", (req, res) => {
    res.json([
      { id: "b1", title: "Flowers", subtitle: "Miley Cyrus", image_url: "https://picsum.photos/seed/flowers/200/200", type: "song" },
      { id: "b2", title: "Kill Bill", subtitle: "SZA", image_url: "https://picsum.photos/seed/killbill/200/200", type: "song" },
      { id: "b3", title: "Creepin'", subtitle: "Metro Boomin, The Weeknd & 21 Savage", image_url: "https://picsum.photos/seed/creepin/200/200", type: "song" },
      { id: "b4", title: "Anti-Hero", subtitle: "Taylor Swift", image_url: "https://picsum.photos/seed/antihero/200/200", type: "song" },
      { id: "b5", title: "Die For You", subtitle: "The Weeknd & Ariana Grande", image_url: "https://picsum.photos/seed/dieforyou/200/200", type: "song" },
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
