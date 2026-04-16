# Segment-Based Video Implementation

## Overview

This document describes the segment-based video level implementation for Ignitio, which allows YouTube videos to be split into multiple learning segments where each segment is a separate roadmap level.

---

## What We Achieved

### Before (Old Model)
- One level contained multiple nested "chunks"
- Complex UI with chunk navigation (previous/next buttons)
- Chunk progress bar inside a single level

### After (New Model)
- **Each segment is its own roadmap level** (A4, A5, A6, A7, etc.)
- **Clean UI** - no nested chunk navigation
- **50% watch gating** - Complete button unlocks only after watching 50% of the segment
- **Hard segment boundaries** - Users cannot scrub outside their current segment
- **Persistent progress** - Watch time saved in localStorage across sessions
- **Backward compatible** - Legacy full-video levels still work

---

## Files Modified

### 1. `data/gitGithubCourseData.js`

**Purpose:** Course content data structure

**Changes:**
- Replaced single level with nested chunks array
- Created 4 separate segment-based levels (A4, A5, A6, A7)
- Each level now has `videoId`, `startSec`, `endSec` properties

**Before:**
```javascript
{
    id: "A4",
    videoUrl: "https://www.youtube.com/embed/c7UOp6JpR5M",
    chunks: [
        { startSec: 0, endSec: 45, title: "Introduction" },
        { startSec: 45, endSec: 120, title: "Installing Git" },
        // ...
    ]
}
```

**After:**
```javascript
{
    id: "A4",
    videoId: "c7UOp6JpR5M",
    startSec: 0,
    endSec: 45,
    durationInMinutes: 0.75,
},
{
    id: "A5",
    videoId: "c7UOp6JpR5M",
    startSec: 45,
    endSec: 120,
    durationInMinutes: 1.25,
},
// A6 and A7 follow same pattern
```

**Impact on Codebase:**
- Roadmap cards now render A4, A5, A6, A7 as separate clickable levels
- Each level unlocks sequentially as user completes previous one
- Course data structure is now flat and easier to manage

---

### 2. `layout/LevelContent/YouTubeSegmentPlayer.jsx` (NEW FILE)

**Purpose:** Reusable YouTube player component that enforces segment boundaries

**Key Features:**
- Loads YouTube IFrame API dynamically
- Plays only within `[startSec, endSec]` range
- Tracks watch time for 50% gating
- Enforces hard boundaries via 3-layer protection

**Boundary Enforcement Layers:**

1. **Monitoring Interval (250ms)** - While playing:
   ```javascript
   if (currentTime < startSec) {
       playerRef.current.seekTo(startSec, true);
       return;
   }
   if (currentTime >= endSec) {
       playerRef.current.pauseVideo();
       return;
   }
   ```

2. **State Change Handler** - On play/pause events:
   ```javascript
   if (event.data === YT.PlayerState.PAUSED) {
       // Still check boundaries when paused (user scrubbing)
       if (currentTime < startSec) {
           playerRef.current.seekTo(startSec, true);
       }
   }
   ```

3. **Continuous Boundary Check (200ms)** - Always running:
   ```javascript
   if (currentTime < startSec) {
       playerRef.current.seekTo(startSec, true);
   } else if (currentTime > endSec) {
       playerRef.current.seekTo(endSec, true);
       if (playing) playerRef.current.pauseVideo();
   }
   ```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `videoId` | string | YouTube video ID |
| `startSec` | number | Segment start time in seconds |
| `endSec` | number | Segment end time in seconds |
| `onWatchTimeUpdate` | function | Callback with accumulated watch time |
| `onReady` | function | Callback when player is ready |
| `autoplay` | boolean | Whether to autoplay (default: true) |

**Impact on Codebase:**
- Replaced `YouTubeChunkPlayer.jsx` (deleted)
- Single source of truth for segment playback
- Any component using this player gets automatic boundary enforcement

---

### 3. `layout/LevelContent/VideoTab.jsx`

**Purpose:** Video tab UI and watch time tracking logic

**Changes:**

1. **Removed nested chunk UI:**
   - No chunk list display
   - No previous/next chunk buttons
   - No chunk progress bar

2. **Added 50% watch gating:**
   ```javascript
   const segmentDuration = level.endSec - level.startSec;
   const watchThreshold = segmentDuration * 0.5;
   ```

3. **Added watch progress indicator:**
   ```jsx
   <div className="bg-white/60 rounded-lg p-3">
       <span>Watch progress: {Math.min(100, Math.round((watchedSeconds / segmentDuration) * 100))}%</span>
       <progressBar />
       {!canMarkComplete && (
           <p>Watch {Math.round((watchThreshold - watchedSeconds))} more seconds to unlock completion</p>
       )}
   </div>
   ```

4. **Monotonic watch time accumulation:**
   ```javascript
   const handleWatchTimeUpdate = (seconds) => {
       // Only accumulate - never decrease due to scrubbing
       setWatchedSeconds(prev => Math.max(prev, seconds));
   };
   ```

5. **Threshold detection with localStorage persistence:**
   ```javascript
   useEffect(() => {
       if (isSegmentBased && watchedSeconds > 0) {
           localStorage.setItem(watchTimeKey, watchedSeconds.toString());
           if (watchedSeconds >= watchThreshold && !thresholdReached && !hasWatched) {
               setThresholdReached(true);
               onThresholdMet?.();
           }
       }
   }, [watchedSeconds, watchThreshold, thresholdReached, hasWatched, onThresholdMet]);
   ```

**Impact on Codebase:**
- Complete button only appears after 50% watch threshold is met
- Progress is visible to user with percentage and remaining seconds
- Watch time persists across page refreshes/sessions
- Separated `onThresholdMet` (automatic) from `onMarkComplete` (user action)

---

### 4. `layout/LevelContent/LevelContent.jsx`

**Purpose:** Main level content wrapper with tab switching

**Changes:**

1. **Segment-based threshold check on mount:**
   ```javascript
   useEffect(() => {
       if (isSegmentBased) {
           const segmentDuration = level.endSec - level.startSec;
           const thresholdSeconds = segmentDuration * 0.5;
           const storedWatched = parseFloat(localStorage.getItem(storageKey) || '0');
           if (storedWatched >= thresholdSeconds) {
               setCanMarkComplete(true);
           }
       }
   }, [level.id, level.startSec, level.endSec, isCompleted, roadmapType, isSegmentBased]);
   ```

2. **Separated threshold vs completion handlers:**
   ```javascript
   const handleThresholdMet = () => {
       setCanMarkComplete(true);  // Enable button
   };

   const handleMarkComplete = () => {
       setHasWatched(true);
       onComplete(level.id);  // Actual completion
       localStorage.removeItem(`segment_watch_${roadmapType}_${level.id}`);
   };
   ```

3. **Backward compatibility for legacy levels:**
   ```javascript
   if (isSegmentBased) {
       // Segment logic
   } else if (level.durationInMinutes && !isCompleted) {
       // Legacy timer-based logic
       cleanupRef.current = fiftyPercentOfVideo(...);
   }
   ```

**Impact on Codebase:**
- Single source of truth for completion eligibility
- Clean separation between threshold detection and user completion
- Legacy levels (A1, A2, A3, B1, B2, etc.) still work with timer-based completion

---

### 5. `layout/LevelContent/YouTubeChunkPlayer.jsx` (DELETED)

**Reason:** Replaced by `YouTubeSegmentPlayer.jsx`

**Impact:**
- Removed unused code
- Cleaner architecture with single player component

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User opens Level A5                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LevelContent.jsx                                                │
│  - Detects segment-based level (startSec/endSec present)        │
│  - Checks localStorage for previously watched time              │
│  - Sets canMarkComplete if threshold already met                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VideoTab.jsx                                                    │
│  - Calculates: segmentDuration = endSec - startSec              │
│  - Calculates: watchThreshold = segmentDuration * 0.5           │
│  - Renders YouTubeSegmentPlayer with level props                │
│  - Shows progress bar and remaining seconds                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  YouTubeSegmentPlayer.jsx                                        │
│  - Loads YouTube IFrame API                                     │
│  - Initializes player at startSec                               │
│  - Monitors currentTime every 250ms                             │
│  - Enforces boundaries: seek back if < startSec                 │
│  - Pauses at endSec                                             │
│  - Calls onWatchTimeUpdate with valid watched seconds           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VideoTab.jsx receives watch time update                        │
│  - Accumulates: watchedSeconds = max(prev, current)             │
│  - Saves to localStorage                                        │
│  - Checks: if watchedSeconds >= watchThreshold                  │
│  - Calls onThresholdMet() ONCE                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LevelContent.jsx receives threshold met signal                 │
│  - Sets canMarkComplete = true                                  │
│  - Complete button becomes visible                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User clicks Complete button                                    │
│  - handleMarkComplete() called                                  │
│  - Sets hasWatched = true                                       │
│  - Calls onComplete(level.id) - unlocks next level              │
│  - Cleans up localStorage                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Implementation Details

### 1. Segment Detection
```javascript
const isSegmentBased = level.startSec !== undefined && 
                       level.endSec !== undefined && 
                       level.videoId;
```

### 2. 50% Threshold Formula
```javascript
const segmentDuration = level.endSec - level.startSec;
const watchThreshold = segmentDuration * 0.5;
```

### 3. LocalStorage Keys
- Segment levels: `segment_watch_git-github_A5`
- Legacy levels: `video_timer_git-github_A1`

### 4. Completion Flow
1. User watches segment → watch time accumulates
2. Reaches 50% → `onThresholdMet()` called → button enabled
3. User clicks Complete → `onMarkComplete()` called → next level unlocks

### 5. Boundary Enforcement
- **Below startSec:** Immediately seek back to startSec
- **Above endSec:** Pause video at endSec
- **Works during:** Playing, paused, scrubbing

---

## How to Add New Segment Levels

### Step 1: Define Segment in Data File

```javascript
// data/gitGithubCourseData.js
{
    id: "A8",
    name: "A8 - Your Segment Title",
    title: "A8 — Your Segment Title",
    description: "What the student will learn",
    videoId: "YOUR_YOUTUBE_VIDEO_ID",  // e.g., "dQw4w9WgXcQ"
    startSec: 0,        // Segment start in seconds
    endSec: 60,         // Segment end in seconds
    durationInMinutes: 1,  // For display (endSec - startSec) / 60
},
```

### Step 2: Ensure Previous Level is Completed

The roadmap will automatically unlock A8 after A7 is marked complete.

### Step 3: Test

1. Open level A8
2. Verify video starts at correct timestamp
3. Try scrubbing backward - should snap back to startSec
4. Watch until 50% progress bar
5. Verify Complete button appears
6. Click Complete - next level should unlock

---

## Backward Compatibility

Legacy levels (A1, A2, A3, B1, B2, etc.) continue to work:

```javascript
{
    id: "A1",
    videoUrl: "https://www.youtube.com/embed/c7UOp6JpR5M",
    durationInMinutes: 19,
}
```

- Detected by presence of `videoUrl` instead of `videoId/startSec/endSec`
- Uses `fiftyPercentOfVideo()` timer function
- 50% of full video duration = unlock threshold

---

## Testing Checklist

- [ ] Segment starts at correct timestamp
- [ ] Segment pauses at endSec
- [ ] Cannot scrub below startSec
- [ ] Cannot scrub above endSec
- [ ] Progress bar shows correct percentage
- [ ] "X more seconds to unlock" message is accurate
- [ ] Complete button appears at 50%
- [ ] Complete button stays hidden before 50%
- [ ] Progress persists after page refresh
- [ ] Next level unlocks after clicking Complete
- [ ] Legacy levels still work with timer

---

## Future Enhancements

1. **Skip intro button** - Jump to segment start
2. **Keyboard shortcuts** - Arrow keys for seek
3. **Playback speed control** - 1.25x, 1.5x, 2x
4. **Segment transcript** - Show subtitles for current segment
5. **Analytics** - Track average watch time per segment

---

## Troubleshooting

### Issue: Complete button appears immediately

**Cause:** localStorage has old data from previous session

**Fix:** Clear localStorage or open in incognito:
```javascript
localStorage.removeItem('segment_watch_git-github_A5');
```

### Issue: Video doesn't start at segment

**Cause:** YouTube API `start` parameter may have slight delay

**Fix:** The `useEffect` on line 160-170 forces seekTo on mount

### Issue: Progress doesn't save

**Cause:** onWatchTimeUpdate callback not wired up

**Fix:** Verify YouTubeSegmentPlayer receives `onWatchTimeUpdate` prop

### Issue: Adjacent segment content shows when scrubbing

**Cause:** Boundary enforcement interval too slow

**Fix:** Already set to 200ms - check YouTube IFrame API is responding

---

## Related Files

| File | Purpose |
|------|---------|
| `data/gitGithubCourseData.js` | Course content with segment definitions |
| `layout/LevelContent/LevelContent.jsx` | Main wrapper, threshold detection |
| `layout/LevelContent/VideoTab.jsx` | Video UI, progress tracking |
| `layout/LevelContent/YouTubeSegmentPlayer.jsx` | Segment playback, boundary enforcement |
| `layout/LevelContent/PracticeTab.jsx` | Practice exercises (unchanged) |

---

**Implementation Date:** 2026-04-15  
**Branch:** feature/videos-newplayer
