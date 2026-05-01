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

### Latest Improvements (2026-04-26)
- **Unique watched time tracking** - Progress only increases from actual forward playback, not scrubbing
- **Interval-based storage** - Tracks watched ranges like `[{start: 102, end: 118}]` to prevent double-counting
- **Skip protection** - Large jumps in playhead position (>1.5s) are ignored as seeks
- **Rewatch protection** - Rewinding and rewatching the same content doesn't inflate progress
- **Preloaded YouTube API** - API loads at app startup for faster first-open latency
- **Warm player caching** - Player stays mounted when switching tabs for instant switching

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

### 2. `app/layout.js`

**Purpose:** Root layout component - loads YouTube IFrame API on app mount

**Changes:**
- Added `useEffect` to preload YouTube IFrame API when app starts

**Code:**
```javascript
// Preload YouTube IFrame API on app mount to eliminate cold-start latency
useEffect(() => {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}, []);
```

**Impact on Codebase:**
- First-time Video tab opens faster (API already loaded)
- No waiting for API script to fetch on-demand

---

### 3. `layout/LevelContent/YouTubeSegmentPlayer.jsx`

**Purpose:** Reusable YouTube player component that enforces segment boundaries and tracks UNIQUE watched time

**Key Features:**
- Loads YouTube IFrame API dynamically (or uses preloaded API)
- Plays only within `[startSec, endSec]` range
- Tracks UNIQUE watch time via interval-based tracking
- Enforces hard boundaries via 3-layer protection
- Detects skip vs. normal playback via delta analysis

**Boundary Enforcement Layers:**

1. **Monitoring Interval (250ms)** - While playing:
   ```javascript
   if (currentTime < startSec) {
       playerRef.current.seekTo(startSec, true);
       lastCurrentTimeRef.current = startSec;
       return;
   }
   if (currentTime >= endSec) {
       playerRef.current.pauseVideo();
       stopMonitoring();
       return;
   }
   ```

2. **State Change Handler** - On play/pause events:
   ```javascript
   if (event.data === YT.PlayerState.PLAYING) {
       lastCurrentTimeRef.current = currentTime;
       startMonitoring();
   } else if (event.data === YT.PlayerState.PAUSED) {
       stopMonitoring();
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

**Unique Watched Time Tracking:**
```javascript
// Calculate delta from last known position
if (lastCurrentTimeRef.current !== null) {
    const delta = currentTime - lastCurrentTimeRef.current;

    // Only count when:
    // 1. Player is actually playing (isPlayingRef.current)
    // 2. Time moves forward (delta > 0)
    // 3. Delta is small (<= 1.5s = normal playback, not a skip)
    if (isPlayingRef.current && delta > 0 && delta <= 1.5) {
        // Report both current position and delta
        onWatchTimeUpdate?.({ currentTime, delta });
    }
}
lastCurrentTimeRef.current = currentTime;
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `videoId` | string | YouTube video ID |
| `startSec` | number | Segment start time in seconds |
| `endSec` | number | Segment end time in seconds |
| `onWatchTimeUpdate` | function | Callback with `{ currentTime, delta }` |
| `onReady` | function | Callback when player is ready |
| `autoplay` | boolean | Whether to autoplay (default: true) |
| `isVisible` | boolean | Whether tab is visible (pauses when hidden) |

**Impact on Codebase:**
- Replaced `YouTubeChunkPlayer.jsx` (deleted)
- Single source of truth for segment playback
- Any component using this player gets automatic boundary enforcement AND skip protection

---

### 4. `layout/LevelContent/VideoTab.jsx`

**Purpose:** Video tab UI and watch time tracking logic with interval-based storage

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

4. **Interval-based unique watched time tracking:**
   ```javascript
   // Helper: merge overlapping/adjacent intervals
   const mergeIntervals = (intervals) => {
       if (intervals.length === 0) return [];
       const sorted = [...intervals].sort((a, b) => a.start - b.start);
       const merged = [sorted[0]];
       for (let i = 1; i < sorted.length; i++) {
           const last = merged[merged.length - 1];
           const curr = sorted[i];
           // Merge if overlapping or adjacent (within 0.5s)
           if (curr.start <= last.end + 0.5) {
               last.end = Math.max(last.end, curr.end);
           } else {
               merged.push(curr);
           }
       }
       return merged;
   };

   // Track intervals like [{start: 102, end: 118}, {start: 130, end: 145}]
   const [watchedIntervals, setWatchedIntervals] = useState(() => {
       const stored = localStorage.getItem(watchIntervalsKey);
       return stored ? mergeIntervals(JSON.parse(stored)) : [];
   });

   // Derived: total seconds from merged intervals
   const watchedSeconds = watchedIntervals.reduce(
       (total, interval) => total + (interval.end - interval.start), 0
   );
   ```

5. **Handle watch time update with interval creation:**
   ```javascript
   const handleWatchTimeUpdate = useCallback((data) => {
       const { currentTime, delta } = typeof data === 'object'
           ? data
           : { currentTime: null, delta: data };

       if (currentTime === null) {
           // Fallback: append delta to end of last interval
           const currentEnd = prev.length > 0 ? prev[prev.length - 1].end : level.startSec;
           const newInterval = { start: currentEnd, end: currentEnd + delta };
           return mergeIntervals([...prev, newInterval]);
       }

       // Create interval from (currentTime - delta) to currentTime
       const intervalStart = Math.max(level.startSec, currentTime - delta);
       const intervalEnd = Math.min(level.endSec, currentTime);

       if (intervalEnd > intervalStart) {
           setWatchedIntervals(prev => mergeIntervals([...prev, { start: intervalStart, end: intervalEnd }]));
       }
   }, [isSegmentBased, level.startSec, level.endSec, mergeIntervals]);
   ```

6. **Threshold detection with localStorage persistence:**
   ```javascript
   useEffect(() => {
       if (isSegmentBased && watchedIntervals.length > 0) {
           localStorage.setItem(watchIntervalsKey, JSON.stringify(watchedIntervals));
           localStorage.setItem(watchTimeKey, watchedSeconds.toString());

           if (watchedSeconds >= watchThreshold && !thresholdCalledRef.current && !hasWatched) {
               thresholdCalledRef.current = true;
               onThresholdMet?.();
           }
       }
   }, [watchedIntervals, watchedSeconds, watchThreshold, isSegmentBased, watchIntervalsKey, watchTimeKey, hasWatched, onThresholdMet]);
   ```

**Impact on Codebase:**
- Complete button only appears after 50% watch threshold is met
- Progress bar reflects UNIQUE watched time (cannot be exploited by scrubbing)
- Watch time persists across page refreshes/sessions
- Separated `onThresholdMet` (automatic) from `onMarkComplete` (user action)

---

### 5. `layout/LevelContent/LevelContent.jsx`

**Purpose:** Main level content wrapper with tab switching

**Changes:**

1. **Warm player caching - keep VideoTab mounted when switching tabs:**
   ```javascript
   {/* VideoTab always mounted to keep player warm, PracticeTab conditionally rendered */}
   <div className={activeTab === 'video' ? 'block' : 'hidden'}>
       <VideoTab
           level={level}
           hasWatched={hasWatched}
           onThresholdMet={handleThresholdMet}
           onMarkComplete={handleMarkComplete}
           feedback={feedback}
           setFeedback={setFeedback}
           canMarkComplete={canMarkComplete}
           roadmapType={roadmapType}
           isVisible={activeTab === 'video'}
       />
   </div>
   {activeTab === 'practice' && <PracticeTab level={level} roadmapType={roadmapType} />}
   ```

2. **Derived canMarkComplete from localStorage (no setState in useEffect):**
   ```javascript
   const storedWatchTime = isSegmentBased
       ? parseFloat(localStorage.getItem(`segment_watch_${roadmapType}_${level.id}`) || '0')
       : 0;
   const segmentDuration = isSegmentBased ? (level.endSec - level.startSec) : 0;
   const thresholdSeconds = segmentDuration * 0.5;

   const canMarkComplete = isCompleted
       ? true
       : isSegmentBased
           ? storedWatchTime >= thresholdSeconds
           : level.durationInMinutes
               ? storedWatchTimeForLegacy >= fiftyPercentDurationLegacy
               : false;
   ```

3. **Separated threshold vs completion handlers:**
   ```javascript
   const handleThresholdMet = useCallback(() => {
       setCanMarkComplete(true);  // Enable button
   }, []);

   const handleMarkComplete = useCallback(() => {
       setHasWatched(true);
       onComplete(level.id);  // Actual completion
       // Clean up both watch time and intervals storage
       if (isSegmentBased) {
           localStorage.removeItem(`segment_watch_${roadmapType}_${level.id}`);
           localStorage.removeItem(`segment_intervals_${roadmapType}_${level.id}`);
       } else {
           localStorage.removeItem(`video_timer_${roadmapType}_${level.id}`);
       }
   }, [level.id, roadmapType, isSegmentBased, onComplete]);
   ```

4. **Backward compatibility for legacy levels:**
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
- Video tab switches instantly (player stays mounted and warm)
- Legacy levels (A1, A2, A3, B1, B2, etc.) still work with timer-based completion

---

### 6. `layout/LevelContent/YouTubeChunkPlayer.jsx` (DELETED)

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
│  - VideoTab stays mounted even when switching to Practice       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VideoTab.jsx                                                    │
│  - Calculates: segmentDuration = endSec - startSec              │
│  - Calculates: watchThreshold = segmentDuration * 0.5           │
│  - Initializes watchedIntervals from localStorage               │
│  - Renders YouTubeSegmentPlayer with level props                │
│  - Shows progress bar based on UNIQUE watched time              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  YouTubeSegmentPlayer.jsx                                        │
│  - Uses preloaded YouTube IFrame API (from layout.js)           │
│  - Initializes player at startSec                               │
│  - Monitors currentTime every 250ms                             │
│  - Calculates delta = currentTime - lastCurrentTime             │
│  - Only reports watch time when:                                │
│    * delta > 0 (moving forward)                                 │
│    * delta <= 1.5 (not a skip)                                  │
│    * isPlayingRef.current === true                              │
│  - Enforces boundaries: seek back if < startSec                 │
│  - Pauses at endSec                                             │
│  - Calls onWatchTimeUpdate({ currentTime, delta })              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VideoTab.jsx receives watch time update                        │
│  - Creates interval: { start: currentTime - delta, end: currentTime }
│  - Merges with existing intervals (deduplication)               │
│  - watchedSeconds = sum of merged interval durations            │
│  - Saves intervals + seconds to localStorage                    │
│  - Checks: if watchedSeconds >= watchThreshold                  │
│  - Calls onThresholdMet() ONCE                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LevelContent.jsx receives threshold met signal                 │
│  - canMarkComplete becomes true                                 │
│  - Complete button becomes visible                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User clicks Complete button                                    │
│  - handleMarkComplete() called                                  │
│  - Sets hasWatched = true                                       │
│  - Calls onComplete(level.id) - unlocks next level              │
│  - Cleans up localStorage (watch + intervals)                   │
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
- Segment watch time: `segment_watch_git-github_A5`
- Segment intervals: `segment_intervals_git-github_A5`
- Legacy levels: `video_timer_git-github_A1`

### 4. Unique Watched Time Calculation
```javascript
// Example: User watches 100-120, skips to 150, watches 150-160, rewinds to 110, watches 110-125
// Intervals: [{start: 100, end: 120}, {start: 150, end: 160}, {start: 110, end: 125}]
// After merge: [{start: 100, end: 125}, {start: 150, end: 160}]
// watchedSeconds = (125 - 100) + (160 - 150) = 25 + 10 = 35s
```

### 5. Skip Detection Logic
```javascript
const delta = currentTime - lastCurrentTimeRef.current;

if (isPlayingRef.current && delta > 0 && delta <= 1.5) {
    // Normal playback - count this time
    onWatchTimeUpdate?.({ currentTime, delta });
}
// If delta > 1.5, user skipped - don't count the gap
// If delta <= 0, user scrubbed backward - don't count
```

### 6. Completion Flow
1. User watches segment → unique watch time accumulates via intervals
2. Reaches 50% → `onThresholdMet()` called → button enabled
3. User clicks Complete → `onMarkComplete()` called → next level unlocks

### 7. Boundary Enforcement
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
4. Try scrubbing forward instantly - progress should NOT jump
5. Watch until 50% progress bar
6. Verify Complete button appears
7. Click Complete - next level should unlock

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
- [ ] Scrubbing forward does NOT increase progress
- [ ] Rewatching same content does NOT double-count progress
- [ ] Progress bar shows correct percentage based on UNIQUE time
- [ ] "X more seconds to unlock" message is accurate
- [ ] Complete button appears at 50% UNIQUE watch time
- [ ] Complete button stays hidden before 50%
- [ ] Progress persists after page refresh
- [ ] Next level unlocks after clicking Complete
- [ ] Legacy levels still work with timer
- [ ] Switching to Practice tab and back is instant (player warm)
- [ ] First-time Video tab open is fast (API preloaded)

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
localStorage.removeItem('segment_intervals_git-github_A5');
```

### Issue: Video doesn't start at segment

**Cause:** YouTube API `start` parameter may have slight delay

**Fix:** The `useEffect` forces seekTo on mount

### Issue: Progress doesn't save

**Cause:** onWatchTimeUpdate callback not wired up

**Fix:** Verify YouTubeSegmentPlayer receives `onWatchTimeUpdate` prop

### Issue: Adjacent segment content shows when scrubbing

**Cause:** Boundary enforcement interval too slow

**Fix:** Already set to 200ms - check YouTube IFrame API is responding

### Issue: Progress increases when skipping forward

**Cause:** Delta threshold too high or not checking delta

**Fix:** Verify `delta <= 1.5` check is active in monitoring interval

---

## Related Files

| File | Purpose |
|------|---------|
| `app/layout.js` | Root layout, preloads YouTube IFrame API |
| `data/gitGithubCourseData.js` | Course content with segment definitions |
| `layout/LevelContent/LevelContent.jsx` | Main wrapper, threshold detection, warm player caching |
| `layout/LevelContent/VideoTab.jsx` | Video UI, interval-based progress tracking |
| `layout/LevelContent/YouTubeSegmentPlayer.jsx` | Segment playback, boundary enforcement, unique time tracking |
| `layout/LevelContent/PracticeTab.jsx` | Practice exercises (unchanged) |

---

**Implementation Date:** 2026-04-15  
**Latest Update:** 2026-04-26 (Unique watched time tracking, warm player caching, API preloading)  
**Branch:** feature/videos-newplayer
