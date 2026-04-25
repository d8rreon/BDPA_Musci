# 🎵 Audio Player Implementation Tutorial

Welcome! This guide will help you implement the audio player functionality in the Melodix music app. The skeleton code has been removed and replaced with detailed instructions to help you rebuild it from scratch.

## Overview

The audio player allows users to preview songs before buying/streaming. It includes:
- Play/pause controls
- Progress bar for seeking through the track
- Volume control
- Time display
- Links to listen on Deezer

---

## Part 1: Adding Player State Variables

**Location**: Top of `MainPage` component (around line 180)

### What you need to add:

After the existing state variables like `chartRegion`, add these player state variables:

```typescript
// Current track being played
const [currentTrack, setCurrentTrack] = useState<MusicItem | null>(null);

// Is audio currently playing?
const [isPlaying, setIsPlaying] = useState(false);

// Current playback time in seconds
const [currentTime, setCurrentTime] = useState(0);

// Total duration of the audio in seconds
const [duration, setDuration] = useState(0);

// Volume level (0 to 1, where 0 is muted and 1 is full volume)
const [volume, setVolume] = useState(1);
```

The `audioRef` is already defined - this is a reference to the HTML audio element.

---

## Part 2: Implementing Core Player Functions

### 1. `playTrack()` Function (around line 253)

**Purpose**: Called when user clicks the play button on any song

**Implementation steps**:
```typescript
const playTrack = (track: MusicItem) => {
  // Step 1: Check if the track has a preview URL
  if (!track.preview_url) {
    alert('No preview available for this track. Click "Listen on Deezer" to hear the full song.');
    return;
  }
  
  // Step 2: Update state with the new track
  setCurrentTrack(track);
  setCurrentTime(0);  // Reset to beginning
  setIsPlaying(true);
  
  // Step 3: Set the audio element's source and play it
  if (audioRef.current) {
    audioRef.current.src = track.preview_url;
    audioRef.current.play();
  }
};
```

### 2. `togglePlayPause()` Function (around line 261)

**Purpose**: Called when user clicks the play/pause button in the mini player

**Implementation**:
```typescript
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
```

### 3. `handleTimeUpdate()` Function (around line 271)

**Purpose**: Called constantly as the audio plays to update the progress bar

**Implementation**:
```typescript
const handleTimeUpdate = () => {
  if (audioRef.current) {
    setCurrentTime(audioRef.current.currentTime);
  }
};
```

### 4. `handleLoadedMetadata()` Function (around line 279)

**Purpose**: Called when audio metadata is loaded to get the total duration

**Implementation**:
```typescript
const handleLoadedMetadata = () => {
  if (audioRef.current) {
    setDuration(audioRef.current.duration);
  }
};
```

### 5. `handleEnded()` Function (around line 287)

**Purpose**: Called when the audio finishes playing

**Implementation**:
```typescript
const handleEnded = () => {
  setIsPlaying(false);
};
```

### 6. `handleProgressChange()` Function (around line 295)

**Purpose**: Called when user drags the progress bar to seek to a new position

**Implementation**:
```typescript
const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Get the new time value from the range input
  const newTime = parseFloat(e.target.value);
  
  // Update state
  setCurrentTime(newTime);
  
  // Update the audio element's playback position
  if (audioRef.current) {
    audioRef.current.currentTime = newTime;
  }
};
```

### 7. `handleVolumeChange()` Function (around line 305)

**Purpose**: Called when user adjusts the volume slider

**Implementation**:
```typescript
const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Get the new volume value (0 to 1)
  const newVolume = parseFloat(e.target.value);
  
  // Update state
  setVolume(newVolume);
  
  // Update the audio element's volume
  if (audioRef.current) {
    audioRef.current.volume = newVolume;
  }
};
```

### 8. `formatTime()` Function (around line 315)

**Purpose**: Convert seconds to MM:SS format for display

**Implementation**:
```typescript
const formatTime = (seconds: number) => {
  // Handle edge cases
  if (!seconds || isNaN(seconds)) return '0:00';
  
  // Calculate minutes and remaining seconds
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  // Format with leading zeros for seconds
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

---

## Part 3: Wiring Up Button Handlers

### MusicCard Component (around line 35)

Uncomment the `onPlay?.(item)` call:
```typescript
onClick={(e) => {
  e.stopPropagation();
  onPlay?.(item);  // ← Add this line
}}
```

### Billboard Chart Buttons (around line 530)

Uncomment the `playTrack(item)` call:
```typescript
onClick={(e) => {
  e.stopPropagation();
  playTrack(item);  // ← Add this line
}}
```

### Mini Player Controls (around line 625)

Uncomment the `togglePlayPause` call:
```typescript
onClick={togglePlayPause}  // ← Add this
disabled={!currentTrack}   // ← Set this condition
className={cn(
  "p-2 rounded-full transition-colors",
  currentTrack 
    ? "text-brand-accent hover:bg-white/10" 
    : "text-white/20 cursor-not-allowed"
)}
```

And update the button to show correct icon:
```typescript
{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
```

---

## Part 4: UI Components

### Progress Bar (around line 574)

Uncomment this to show the progress bar:
```typescript
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
```

### Track Info in Mini Player (around line 590)

Update to show current track or placeholder:
```typescript
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
```

### Volume Control (around line 635)

Uncomment the volume slider:
```typescript
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
```

### Listen on Deezer Button (around line 648)

Uncomment this link:
```typescript
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
```

---

## Part 5: The Audio Element

### At the end of the component (around line 657)

Add the hidden audio element:
```typescript
<audio
  ref={audioRef}
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={handleLoadedMetadata}
  onEnded={handleEnded}
  crossOrigin="anonymous"
/>
```

This element:
- `ref={audioRef}` - Connects to your ref so you can control it
- `onTimeUpdate` - Called constantly during playback to update progress
- `onLoadedMetadata` - Called when audio loads to get duration
- `onEnded` - Called when audio finishes
- `crossOrigin="anonymous"` - Allows cross-origin audio (CORS)

---

## Key Concepts to Learn

1. **React State**: How `useState` tracks UI changes
2. **Refs**: `useRef` for accessing DOM elements directly
3. **Event Handlers**: React's event system (onChange, onClick)
4. **HTML Audio API**: The native `<audio>` element and its methods
5. **Conditional Rendering**: Showing/hiding elements based on state
6. **DOM Manipulation**: Directly controlling audio playback

---

## Testing Your Implementation

Once you've implemented everything:

1. Start the app: `npm run dev`
2. Click a play button on any track
3. Verify the mini player shows the track info
4. Test play/pause button
5. Drag the progress bar
6. Adjust volume slider
7. Click "Listen" to open on Deezer

---

## Common Issues & Debugging

**Audio not playing?**
- Check that `preview_url` exists on the track object
- Make sure `audioRef.current` is not null
- Check browser console for errors

**Progress bar not updating?**
- Verify `handleTimeUpdate` is connected to the audio element
- Check that `formatTime` is working correctly

**Volume button not working?**
- Make sure `handleVolumeChange` is properly connected
- Verify `audioRef.current.volume` is being set

---

## Challenge: Extend the Player

Once basic functionality works, try adding:
- A next/previous button to skip through playlists
- A mute button
- Shuffle and repeat modes
- A queue display
- Keyboard shortcuts (spacebar to play/pause, arrow keys to seek)

Happy coding! 🚀
