import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

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

  // Deezer API Proxy (MOCKED for local testing)
  app.get("/api/deezer/search", async (req, res) => {
    const { q } = req.query;
    // Mock results based on search query
    const mockResults = [
      {
        id: "mock_s1",
        title: `${q} - Greatest Hits`,
        subtitle: "Mock Artist One",
        image_url: `https://picsum.photos/seed/${q}1/200/200`,
        type: "album"
      },
      {
        id: "mock_s2",
        title: `The Best of ${q}`,
        subtitle: "Mock Artist Two",
        image_url: `https://picsum.photos/seed/${q}2/200/200`,
        type: "song"
      },
      {
        id: "mock_s3",
        title: `${q} (Live at Wembley)`,
        subtitle: "Mock Artist Three",
        image_url: `https://picsum.photos/seed/${q}3/200/200`,
        type: "song"
      },
      {
        id: "mock_s4",
        title: q,
        subtitle: "Artist Profile",
        image_url: `https://picsum.photos/seed/${q}4/200/200`,
        type: "artist"
      }
    ];
    res.json(mockResults);
  });

  app.get("/api/deezer/chart", async (req, res) => {
    // Mock chart data
    const mockChart = [
      { id: "mock_b1", title: "Flowers", subtitle: "Miley Cyrus", image_url: "https://picsum.photos/seed/flowers/200/200", type: "song" },
      { id: "mock_b2", title: "Kill Bill", subtitle: "SZA", image_url: "https://picsum.photos/seed/killbill/200/200", type: "song" },
      { id: "mock_b3", title: "Creepin'", subtitle: "Metro Boomin", image_url: "https://picsum.photos/seed/creepin/200/200", type: "song" },
      { id: "mock_b4", title: "Anti-Hero", subtitle: "Taylor Swift", image_url: "https://picsum.photos/seed/antihero/200/200", type: "song" },
      { id: "mock_b5", title: "Die For You", subtitle: "The Weeknd", image_url: "https://picsum.photos/seed/dieforyou/200/200", type: "song" },
    ];
    res.json(mockChart);
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

  // Billboard Hot 100 Chart via Deezer API
  app.get("/api/charts/billboard", async (req, res) => {
    try {
      // Chart IDs for different regions on Deezer
      // 0 = Global/World Chart, 840 = United States
      const region = req.query.region as string || "global";
      const chartId = region === "us" ? "840" : "0";
      
      // Fetch the top 100 chart from Deezer for the specified region
      // Deezer's charts also function as curated playlists
      const response = await axios.get(`https://api.deezer.com/chart/${chartId}/tracks`, {
        params: {
          limit: 100,
          index: 0
        }
      });
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error("No chart data received from Deezer");
      }

      const chartData = response.data.data
        .map((track: any, index: number) => {
          // Use the position from the API if available, otherwise use index
          const rank = track.position !== undefined ? track.position : index + 1;
          return {
            id: `${region}_${track.id}`,
            title: track.title,
            subtitle: track.artist.name,
            image_url: track.album.cover_big || track.album.cover_medium,
            type: "song",
            rank: rank,
            deezer_url: track.link,
            preview_url: track.preview,
            album: track.album.title,
            artist_id: track.artist.id
          };
        })
        .sort((a: any, b: any) => a.rank - b.rank);

      // Log successful fetch
      console.log(`✓ Fetched ${chartData.length} songs from ${region === 'us' ? 'US' : 'Global'} chart`);
      console.log(`First song: ${chartData[0].title} by ${chartData[0].subtitle} (rank: ${chartData[0].rank})`);
      
      res.json(chartData);
    } catch (error) {
      console.error(`Error fetching ${req.query.region || 'global'} chart from Deezer:`, error);
      // Fallback to mock data if API fails
      res.json([
        { id: "b1", title: "Flowers", subtitle: "Miley Cyrus", image_url: "https://picsum.photos/seed/flowers/200/200", type: "song", rank: 1 },
        { id: "b2", title: "Kill Bill", subtitle: "SZA", image_url: "https://picsum.photos/seed/killbill/200/200", type: "song", rank: 2 },
        { id: "b3", title: "Creepin'", subtitle: "Metro Boomin, The Weeknd & 21 Savage", image_url: "https://picsum.photos/seed/creepin/200/200", type: "song", rank: 3 },
        { id: "b4", title: "Anti-Hero", subtitle: "Taylor Swift", image_url: "https://picsum.photos/seed/antihero/200/200", type: "song", rank: 4 },
        { id: "b5", title: "Die For You", subtitle: "The Weeknd & Ariana Grande", image_url: "https://picsum.photos/seed/dieforyou/200/200", type: "song", rank: 5 },
      ]);
    }
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
