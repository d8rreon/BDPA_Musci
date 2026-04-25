import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Music, User as UserIcon, Disc, BarChart3, LogOut, ChevronRight, Play, Plus, X, Pause, Volume2, ExternalLink, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { User, MusicItem, SavedItem } from './types';

// --- Components ---

interface MusicCardProps {
  item: MusicItem;
  isSaved: boolean;
  onToggleSave: (item: MusicItem) => void | Promise<void>;
  onPlay?: (item: MusicItem) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ item, isSaved, onToggleSave, onPlay }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group relative glass rounded-2xl p-4 transition-all hover:bg-white/10 cursor-pointer"
  >
    <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
      <img 
        src={item.image_url} 
        alt={item.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(item);
          }}
          className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform hover:scale-110"
        >
          <Play size={24} fill="currentColor" />
        </button>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(item);
        }}
        className={cn(
          "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all",
          isSaved ? "bg-brand-accent text-white" : "bg-black/20 text-white/70 hover:text-white"
        )}
      >
        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
      </button>
    </div>
    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
    <p className="text-xs text-white/50 truncate">{item.subtitle}</p>
    <div className="mt-2 flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider font-bold text-white/30 px-1.5 py-0.5 border border-white/10 rounded">
        {item.type}
      </span>
    </div>
  </motion.div>
);

const LandingPage = ({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-3xl p-8 md:p-12 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-accent/20">
            <Music size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-serif italic text-center mb-2">Melodix</h1>
        <p className="text-white/50 text-center mb-8 text-sm">Your music, your world, your rhythm.</p>

        <form onSubmit={handleSubmit} className="space-gap-4 flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
            required
          />
          
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-accent/20 mt-2"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MainPage = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved'>('all');
  const [activeCategory, setActiveCategory] = useState<'songs' | 'artists' | 'albums' | 'charts'>('songs');
  const [billboardCharts, setBillboardCharts] = useState<MusicItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [searchResults, setSearchResults] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartRegion, setChartRegion] = useState<'global' | 'us'>('global');
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchBillboard();
    fetchSaved();
  }, [user.id]);

  useEffect(() => {
    fetchBillboard();
  }, [chartRegion]);

  const fetchBillboard = async () => {
    try {
      const res = await fetch('/api/charts/billboard');
      const data = await res.json();
      // Sort by rank to ensure correct chart order
      const sortedData = data.sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999));
      setBillboardCharts(sortedData);
    } catch (err) {
      console.error("Failed to fetch charts", err);
    }
  };

  const fetchSaved = async () => {
    const res = await fetch(`/api/saved/${user.id}`);
    const data = await res.json();
    setSavedItems(data);
  };

  const toggleSave = async (item: MusicItem) => {
    const isSaved = savedItems.some(s => s.item_id === item.id);
    if (isSaved) {
      await fetch(`/api/saved/${user.id}/${item.id}`, { method: 'DELETE' });
    } else {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          type: item.type,
          item_id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          image_url: item.image_url
        }),
      });
    }
    fetchSaved();
  };

  // Player functions
  const playTrack = (track: MusicItem) => {
    if (!track.preview_url) {
      alert('No preview available for this track. Click "Listen on Deezer" to hear the full song.');
      return;
    }
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.src = track.preview_url;
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/deezer/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const displayedItems = activeFilter === 'saved' 
    ? savedItems.map(s => ({ ...s, id: s.item_id }))
    : (searchResults.length > 0 ? searchResults : billboardCharts);

  const filteredByCategory = displayedItems.filter(item => {
    if (activeCategory === 'songs') return item.type === 'song';
    if (activeCategory === 'artists') return item.type === 'artist';
    if (activeCategory === 'albums') return item.type === 'album';
    if (activeCategory === 'charts') return item.type === 'chart' || item.id.startsWith('b');
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
              <Music size={20} />
            </div>
            <span className="text-xl font-serif italic hidden sm:block">Melodix</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search artists, songs, albums..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2.5 focus:outline-none focus:bg-white/10 focus:border-brand-accent transition-all"
            />
          </form>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Premium</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 pb-32">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl self-start">
            <button 
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeFilter === 'all' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
              )}
            >
              Explore
            </button>
            <button 
              onClick={() => setActiveFilter('saved')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeFilter === 'saved' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
              )}
            >
              <Heart size={14} fill={activeFilter === 'saved' ? "currentColor" : "none"} />
              Saved
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {[
              { id: 'songs', icon: Music, label: 'Songs' },
              { id: 'artists', icon: UserIcon, label: 'Artists' },
              { id: 'albums', icon: Disc, label: 'Albums' },
              { id: 'charts', icon: BarChart3, label: 'Charts' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                  activeCategory === cat.id 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent border-white/10 text-white/60 hover:border-white/30"
                )}
              >
                <cat.icon size={16} />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredByCategory.length > 0 ? (
              filteredByCategory.map((item) => (
                <MusicCard 
                  key={item.id} 
                  item={item} 
                  isSaved={savedItems.some(s => s.item_id === item.id)}
                  onToggleSave={toggleSave}
                  onPlay={playTrack}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music size={32} className="text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white/60">No items found</h3>
                <p className="text-white/30 text-sm">Try searching for something else or check your filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Billboard Section at Bottom */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif italic mb-1">Charts</h2>
              <p className="text-white/40 text-sm">Top trending songs {chartRegion === 'us' ? 'in the US' : 'worldwide'}.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setChartRegion('global')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    chartRegion === 'global'
                      ? "bg-brand-accent text-white"
                      : "bg-white/10 text-white/60 hover:text-white"
                  )}
                >
                  Global
                </button>
                <button
                  onClick={() => setChartRegion('us')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    chartRegion === 'us'
                      ? "bg-brand-accent text-white"
                      : "bg-white/10 text-white/60 hover:text-white"
                  )}
                >
                  US
                </button>
              </div>
              <button className="flex items-center gap-2 text-brand-accent hover:underline text-sm font-medium">
                View All <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billboardCharts.slice(0, 6).map((item, idx) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-3 glass rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <span className="text-2xl font-serif italic text-white/20 w-8 text-center">{idx + 1}</span>
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-14 h-14 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-white/40 truncate">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(item);
                    }}
                    className="p-2 rounded-full bg-brand-accent/20 hover:bg-brand-accent/40 text-brand-accent transition-all"
                    title="Play preview"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  {item.deezer_url && (
                    <a
                      href={item.deezer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                      title="Listen on Deezer"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item);
                    }}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      savedItems.some(s => s.item_id === item.id) ? "text-brand-accent" : "text-white/20 hover:text-white"
                    )}
                  >
                    <Heart size={16} fill={savedItems.some(s => s.item_id === item.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mini Player / Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl z-40">
        <div className="glass rounded-3xl p-4 flex flex-col gap-4 shadow-2xl shadow-black/50">
          {/* Progress bar */}
          {currentTrack && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/40 font-mono w-10">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-accent"
              />
              <span className="text-[10px] text-white/40 font-mono w-10 text-right">{formatTime(duration)}</span>
            </div>
          )}

          {/* Player controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {currentTrack ? (
                <>
                  <img 
                    src={currentTrack.image_url} 
                    alt={currentTrack.title}
                    className="w-12 h-12 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{currentTrack.title}</h4>
                    <p className="text-[10px] text-white/40 truncate uppercase tracking-widest">{currentTrack.subtitle}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Music size={24} className="text-white/20" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Ready to play</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Select a track to start</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button 
                onClick={togglePlayPause}
                disabled={!currentTrack}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  currentTrack 
                    ? "text-brand-accent hover:bg-white/10" 
                    : "text-white/20 cursor-not-allowed"
                )}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>

              {/* Volume control */}
              <div className="hidden sm:flex items-center gap-2">
                <Volume2 size={16} className="text-white/40" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-accent"
                />
              </div>

              {/* Listen on Deezer button */}
              {currentTrack?.deezer_url && (
                <a
                  href={currentTrack.deezer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 transition-colors"
                  title="Open full track on Deezer"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Listen</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is in local storage for persistence (simple version)
    const savedUser = localStorage.getItem('melodix_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('melodix_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('melodix_user');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen">
      {!user ? (
        <LandingPage onAuthSuccess={handleAuthSuccess} />
      ) : (
        <MainPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
