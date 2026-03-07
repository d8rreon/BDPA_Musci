# 🎵 Melodix - Music Discovery & Curation App

A modern, full-stack music discovery application built with React, TypeScript, and Express. This app allows users to explore music, search for songs/artists/albums, save favorites, and view trending charts.

---

## 📚 **Understanding the Application (For Students)**

### **What is Melodix?**

Melodix is a **music streaming discovery platform** similar to Spotify. It lets users:
- **Search** for songs, artists, and albums
- **Browse** trending Billboard Hot 100 charts
- **Save** their favorite tracks to a personalized library
- **Explore** music organized by categories (Songs, Artists, Albums, Charts)

Think of it like a digital record store where you can find music and keep track of what you like!

---

## 🏗️ **Architecture Overview**

Melodix follows a **client-server architecture** with two main parts:

### **Frontend (Client-Side - React)**
- **Location:** `/src` folder
- **What it does:** Handles the user interface and user interactions
- **Technology:** React with TypeScript, Framer Motion (animations), Tailwind CSS (styling)
- **Key Files:**
  - `App.tsx` - Main component with all UI logic
  - `types.ts` - TypeScript interfaces for data structures
  - `index.css` - Global styling

### **Backend (Server-Side - Express)**
- **Location:** `server.ts`
- **What it does:** Handles API requests, user authentication, database operations
- **Technology:** Express.js, SQLite (database), better-sqlite3 (database driver)
- **Key Features:**
  - User signup/login authentication
  - Search music via Deezer API integration
  - Manage saved items
  - Serve trending charts

---

## 🔄 **How the App Works (Step by Step)**

### **1. User Registration & Login**

```
┌─────────────┐                        ┌──────────────┐
│   Browser   │────POST /api/auth/──→  │   Server     │
│ (Frontend)  │    signup or login      │   (Backend)  │
└─────────────┘←──────JSON response─────┘──────────────┘
       ↓
   localStorage stores
   user data locally
```

- When you sign up or log in, the frontend sends your credentials to the backend
- The backend stores your user info in a **SQLite database**
- Upon success, your user data is saved in browser **localStorage** so you stay logged in
- The backend returns a user ID that's used for all future requests

**Database Table:**
```
users (id, email, password, name)
```

### **2. Searching for Music**

```
┌──────────────┐                        ┌─────────────────┐
│   User       │─"Search Taylor Swift"→ │   API Route     │
│   Searches   │                        │ /api/deezer/    │
└──────────────┘                        │ search?q=query  │
       ↓                                └─────────────────┘
   Frontend sends                              ↓
   search query                         Mock data returned
       ↑                                (not real Deezer API)
       └──────Results displayed in grid────────┘
```

- You type in the search box and press Enter
- Frontend makes a GET request to `/api/deezer/search?q=yourquery`
- Backend returns mock music results (currently using placeholder data)
- Frontend displays results as a grid of music cards

**Mock Result Example:**
```javascript
[
  {
    id: "mock_s1",
    title: "Taylor Swift - Greatest Hits",
    subtitle: "Album",
    image_url: "https://picsum.photos/...",
    type: "album"
  }
  // ... more results
]
```

### **3. Viewing Trending Charts**

- When the app loads, it automatically fetches trending songs via `/api/deezer/chart`
- The **Billboard Hot 100 section** displays the top 6 trending tracks
- These appear at the bottom of the main page
- Shows rank, album art, title, and artist

### **4. Saving Favorites**

```
┌──────────────┐                        ┌──────────────┐
│   Click      │─POST /api/saved────→   │   Database   │
│   Heart Icon │←──success response──    │ saved_items  │
└──────────────┘                        │   table      │
                                        └──────────────┘
```

- Click the heart icon on any music card to save it
- Frontend sends the item details to the backend
- Backend inserts it into the `saved_items` database table
- Your saved items are linked to your user ID

**Database Table:**
```
saved_items (id, user_id, type, item_id, title, subtitle, image_url)
```

- `user_id` - Links the saved item to a specific user
- `item_id` - Unique identifier of the music item
- `type` - Category: 'song', 'artist', 'album', or 'chart'

### **5. Viewing Your Saved Items**

- Click the "Saved" button in the filters
- Frontend fetches `/api/saved/:userId` to get all your saved items
- Only items you saved appear in this view
- You can remove items by clicking the heart again

---

## 🎨 **Frontend Component Breakdown**

### **LandingPage Component**
- **Purpose:** Authentication screen (signup/login)
- **Features:**
  - Toggle between Sign Up and Sign In modes
  - Form validation
  - Error message display
  - Beautiful gradient backgrounds with blur effects

### **MusicCard Component**
- **Purpose:** Individual music item display
- **Features:**
  - Album art image
  - Title and subtitle (artist name)
  - Hover animations (image zoom, play button appears)
  - Heart button to save/unsave
  - Category badge (song, album, artist, chart)

### **MainPage Component**
- **Purpose:** Main app interface after login
- **Features:**
  - Search bar at the top
  - Filter buttons (Explore vs. Saved)
  - Category tabs (Songs, Artists, Albums, Charts)
  - Grid of music cards
  - Billboard Hot 100 section
  - Mini player at the bottom

---

## 🗄️ **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  name TEXT
);
```

### **Saved Items Table**
```sql
CREATE TABLE saved_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT,
  item_id TEXT,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

**Foreign Key Relationship:**
- `saved_items.user_id` → `users.id`
- This ensures saved items are only accessible by the user who saved them

---

## 📡 **API Endpoints (Backend Routes)**

### **Authentication**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate existing user

### **Search**
- `GET /api/deezer/search?q=query` - Search for music

### **Charts**
- `GET /api/deezer/chart` - Get trending songs
- `GET /api/charts/billboard` - Get Billboard Hot 100

### **Saved Items**
- `GET /api/saved/:userId` - Fetch user's saved items
- `POST /api/saved` - Save a new item
- `DELETE /api/saved/:userId/:itemId` - Remove saved item

---

## 🔐 **Data Flow Example: Complete User Journey**

**Scenario:** New user signs up, searches for music, and saves a song

```
1. USER SIGNS UP
   └─ Frontend: User enters email, password, name
      └─ Backend: Stores in users table
      └─ Frontend: Saves user ID to localStorage
      └─ UI: Redirects to main page

2. USER SEARCHES FOR "Taylor Swift"
   └─ Frontend: User types in search bar
      └─ Backend: /api/deezer/search?q=Taylor%20Swift
      └─ Backend: Returns 4 mock results (album, songs, artist)
      └─ UI: Displays results in grid

3. USER CLICKS HEART ON "Anti-Hero"
   └─ Frontend: Detects click, prepares item data
      └─ Backend: POST /api/saved with user_id, item_id, title, etc.
      └─ Backend: Inserts into saved_items table
      └─ Frontend: Heart icon fills in red
      └─ UI: Item now shows as saved

4. USER CLICKS "SAVED" FILTER
   └─ Frontend: Fetches /api/saved/{userId}
      └─ Backend: Queries saved_items WHERE user_id = {userId}
      └─ Frontend: Filters and displays only saved items
      └─ UI: Shows user's saved items in grid

5. USER LOGS OUT
   └─ Frontend: Clears localStorage, resets user state
   └─ UI: Returns to login page
```

---

## 🛠️ **Technologies Used**

### **Frontend**
- **React 19** - UI library for building interactive interfaces
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### **Backend**
- **Express.js** - Web server framework
- **SQLite3** - Lightweight relational database
- **better-sqlite3** - Fast SQLite driver for Node.js

### **Data Flow**
- **REST API** - Standard HTTP requests for client-server communication
- **JSON** - Data format for API responses

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager

### **Installation**
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (if using AI features)

### **Running Locally**
```bash
npm run dev
```
- Frontend will be available at `http://localhost:5173` (Vite dev server)
- Backend API will be at `http://localhost:3000`

### **Building for Production**
```bash
npm run build
npm start
```

---

## 📝 **Key Concepts for Learning**

### **1. Component State Management**
- `useState` hooks manage UI state (search query, filters, saved items)
- When state changes, React re-renders the component

### **2. API Requests**
- Frontend uses `fetch()` to communicate with backend
- All requests are asynchronous (return Promises)

### **3. Database Foreign Keys**
- `saved_items.user_id` references `users.id`
- Prevents orphaned records and maintains data integrity

### **4. Authentication**
- Credentials stored in database (note: passwords should be hashed in production!)
- User state persisted in browser localStorage

### **5. Responsive Grid Layout**
- Uses Tailwind's responsive grid that adapts to screen size
- Mobile: 2 columns → Desktop: 5 columns

---

## 🎓 **Further Learning**

To understand this app better, explore:
- How `localStorage` works in browsers for data persistence
- REST API concepts (GET, POST, DELETE)
- React hooks (`useState`, `useEffect`)
- Database relationships and foreign keys
- TypeScript interfaces for type safety
- CSS Grid and Flexbox for layouts

---

## 📄 **Project Structure**
```
BDPA_Musci/
├── server.ts              # Backend Express server
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── index.html             # HTML entry point
├── src/
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React app initialization
│   ├── types.ts           # TypeScript interfaces
│   ├── index.css          # Global styles
│   └── lib/
│       └── utils.ts       # Utility functions (CSS class merger)
└── music_app.db           # SQLite database (created at runtime)
```

---

## ⚡ **Performance Notes**

- **Vite** provides fast hot module replacement during development
- **Tailwind CSS** uses utility classes for efficient styling
- **SQLite** is lightweight and suitable for small to medium apps
- **Mock API data** keeps the app running without external API limits

---

**Built with ❤️ for learning full-stack web development!**
