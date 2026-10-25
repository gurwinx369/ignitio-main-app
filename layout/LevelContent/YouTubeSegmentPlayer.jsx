import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * YouTubeSegmentPlayer - A reusable player for YouTube video segments
 *
 * Plays a specific segment of a YouTube video from startSec to endSec
 * and tracks UNIQUE watched time for the 50% completion gating.
 * Uses interval-based tracking to prevent skip/scrub exploitation.
 *
 * @param {string} videoId - YouTube video ID
 * @param {number} startSec - Start time in seconds
 * @param {number} endSec - End time in seconds
 * @param {function} onWatchTimeUpdate - Callback with watched seconds (for 50% gating)
 * @param {function} onReady - Callback when player is ready
 * @param {boolean} autoplay - Whether to autoplay when loaded
 */
const YouTubeSegmentPlayer = ({
  videoId,
  startSec,
  endSec,
  onWatchTimeUpdate,
  onReady,
  autoplay = true,
  isVisible = true,
  shouldPauseVideo = false,
  initialSeekSec = null
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const initialSeekRef = useRef(initialSeekSec);
  const hasAppliedInitialSeekRef = useRef(false);

  // Keep latest callback references in refs so effects do not re-run on parent re-renders
  const onReadyRef = useRef(onReady);
  const onWatchTimeUpdateRef = useRef(onWatchTimeUpdate);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onWatchTimeUpdateRef.current = onWatchTimeUpdate;
  }, [onWatchTimeUpdate]);

  // Track last known position for delta calculation
  const lastCurrentTimeRef = useRef(null);
  // Track whether we're currently playing (for detecting forward playback)
  const isPlayingRef = useRef(false);

  const [boundaryNotice, setBoundaryNotice] = useState(null);
  const boundaryNoticeShownRef = useRef({
    start: false,
    end: false,
  });
  const boundaryNoticeTimerRef = useRef(null);

  const formatTime = useCallback((totalSeconds = 0) => {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const showBoundaryNotice = useCallback((type) => {
    if (boundaryNoticeShownRef.current[type]) return;

    boundaryNoticeShownRef.current[type] = true;

    const isStart = type === "start";
    const timeLabel = formatTime(isStart ? startSec : endSec);

    setBoundaryNotice({
      type,
      title: isStart ? "Level starts here" : "Lesson ends here",
      message: isStart
        ? `This level starts here at ${timeLabel}.`
        : `This lesson ends here at ${timeLabel}. Continue to the next level for the next part.`,
    });

    if (boundaryNoticeTimerRef.current) {
      clearTimeout(boundaryNoticeTimerRef.current);
    }

    boundaryNoticeTimerRef.current = setTimeout(() => {
      setBoundaryNotice(null);
    }, 3500);
  }, [formatTime, startSec, endSec]);

  const resetBoundaryNotice = useCallback(() => {
    boundaryNoticeShownRef.current = {
      start: false,
      end: false,
    };

    setBoundaryNotice(null);

    if (boundaryNoticeTimerRef.current) {
      clearTimeout(boundaryNoticeTimerRef.current);
      boundaryNoticeTimerRef.current = null;
    }
  }, []);

  // Stop monitoring - stable ref-based function
  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  // Start monitoring - tracks UNIQUE watched time via interval accumulation
  const startMonitoring = useCallback(() => {
    stopMonitoring();
    isPlayingRef.current = true;

    monitoringIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();

        // HARD BOUNDARY: If user scrubs significantly below startSec, force back to startSec
        // 1.0s tolerance prevents natural keyframe jitter from triggering false seeks
        if (startSec > 0 && currentTime > 0 && currentTime < startSec - 1.0) {
          playerRef.current.seekTo(startSec, true);
          lastCurrentTimeRef.current = startSec;
          showBoundaryNotice("start");
          return;
        }

        // HARD BOUNDARY: Pause at endSec
        if (currentTime >= endSec) {
          playerRef.current.seekTo(endSec, true);
          playerRef.current.pauseVideo();
          showBoundaryNotice("end");
          stopMonitoring();
          lastCurrentTimeRef.current = endSec;
          return;
        }

        // Calculate delta from last known position
        if (lastCurrentTimeRef.current !== null) {
          const delta = currentTime - lastCurrentTimeRef.current;

          // Only count time when:
          // 1. Player is actually playing (per our state tracking)
          // 2. Time moves forward (delta > 0)
          // 3. Delta is small enough to be normal playback (<= 1.5s = not a skip)
          if (isPlayingRef.current && delta > 0 && delta <= 1.5) {
            // Report both current position and delta for accurate interval tracking
            onWatchTimeUpdateRef.current?.({ currentTime, delta });
          }
        }

        lastCurrentTimeRef.current = currentTime;
      }
    }, 250); // Poll frequently for accurate tracking
  }, [stopMonitoring, startSec, endSec, showBoundaryNotice]);

  // Handle player state changes
  const handleStateChange = useCallback((event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      // When playback starts, verify we're within segment bounds
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        // If playing significantly below startSec, seek back immediately
        if (startSec > 0 && currentTime > 0 && currentTime < startSec - 1.0) {
          playerRef.current.seekTo(startSec, true);
          lastCurrentTimeRef.current = startSec;
          showBoundaryNotice("start");
          return;
        }
        // Initialize tracking at current position
        lastCurrentTimeRef.current = currentTime;
      }
      startMonitoring();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      // When paused, still check for boundary violations (user scrubbing)
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        if (startSec > 0 && currentTime > 0 && currentTime < startSec - 1.0) {
          playerRef.current.seekTo(startSec, true);
          lastCurrentTimeRef.current = startSec;
          showBoundaryNotice("start");
        } else if (currentTime > endSec + 0.5) {
          playerRef.current.seekTo(endSec, true);
          lastCurrentTimeRef.current = endSec;
          showBoundaryNotice("end");
        }
      }
      stopMonitoring();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      stopMonitoring();
    } else {
      // BUFFERING, UNSTARTED, etc. - pause tracking
      stopMonitoring();
    }
  }, [startMonitoring, stopMonitoring, startSec, endSec, showBoundaryNotice]);

  // Handle player ready
  const handlePlayerReady = useCallback(() => {
    setIsPlayerReady(true);
    onReadyRef.current?.();
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
      if (boundaryNoticeTimerRef.current) {
        clearTimeout(boundaryNoticeTimerRef.current);
      }
    };
  }, []);

  const handleStateChangeRef = useRef(handleStateChange);
  useEffect(() => {
    handleStateChangeRef.current = handleStateChange;
  }, [handleStateChange]);

  const onPlayerStateChange = useCallback((event) => {
    handleStateChangeRef.current?.(event);
  }, []);

  // Initialize player when YouTube API is ready
  useEffect(() => {
    if (!window.YT || !window.YT.Player || !containerRef.current) {
      return;
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      const initialStart = (typeof initialSeekRef.current === 'number' && initialSeekRef.current >= startSec && initialSeekRef.current < endSec)
        ? Math.floor(initialSeekRef.current)
        : startSec;

      playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          start: initialStart,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startSec, autoplay, handlePlayerReady, onPlayerStateChange]);

  // Seek to resume position once when player is ready (if resume position is specified and differs from current position)
  useEffect(() => {
    if (isPlayerReady && playerRef.current?.seekTo) {
      if (!hasAppliedInitialSeekRef.current) {
        hasAppliedInitialSeekRef.current = true;
        const targetSec = (typeof initialSeekRef.current === 'number' && initialSeekRef.current > startSec && initialSeekRef.current < endSec)
          ? initialSeekRef.current
          : null;
        if (targetSec !== null) {
          playerRef.current.seekTo(targetSec, true);
          lastCurrentTimeRef.current = targetSec;
        }
      }
      if (autoplay && playerRef.current?.playVideo) {
        playerRef.current.playVideo();
      }
    }
  }, [startSec, endSec, isPlayerReady, autoplay]);

  // Reset position tracking and notice when videoId/segment changes
  useEffect(() => {
    resetBoundaryNotice();
    lastCurrentTimeRef.current = null;
    hasAppliedInitialSeekRef.current = false;
    initialSeekRef.current = initialSeekSec;
  }, [videoId, startSec, endSec, resetBoundaryNotice, initialSeekSec]);

  // Pause video when tab becomes hidden, resume when visible
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current?.getPlayerState) return;

    const currentState = playerRef.current.getPlayerState();
    const isPlaying = currentState === window.YT.PlayerState.PLAYING;

    if (!isVisible && isPlaying) {
      // Pause when hidden but remember it was playing
      playerRef.current.pauseVideo();
    }
    // Note: We don't auto-resume on visible to avoid unexpected playback
  }, [isVisible, isPlayerReady]);

  // Pause video when shouldPauseVideo is true
  useEffect(() => {
    if (shouldPauseVideo && isPlayerReady && playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, [shouldPauseVideo, isPlayerReady]);

  // Continuous boundary enforcement - runs even when paused to catch scrubbing
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    const boundaryCheckInterval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        // Enforce hard boundaries regardless of play state (with keyframe tolerance)
        if (startSec > 0 && currentTime > 0 && currentTime < startSec - 1.0) {
          playerRef.current.seekTo(startSec, true);
          showBoundaryNotice("start");
        } else if (currentTime > endSec + 0.5) {
          playerRef.current.seekTo(endSec, true);
          playerRef.current.pauseVideo();
          lastCurrentTimeRef.current = endSec;
          showBoundaryNotice("end");
        }

        if (currentTime > startSec + 2 && currentTime < endSec - 2) {
          boundaryNoticeShownRef.current.start = false;
          boundaryNoticeShownRef.current.end = false;
        }
      }
    }, 200);

    return () => clearInterval(boundaryCheckInterval);
  }, [isPlayerReady, startSec, endSec, videoId]);

  return (
    <>
      <div ref={containerRef} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div
          key={videoId}
          id={`youtube-player-${videoId}`}
          className="absolute top-0 left-0 w-full h-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl"
        />
        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded-3xl sm:rounded-[2.5rem]">
            <div className="text-gray-400 text-lg">Loading video...</div>
          </div>
        )}
        {boundaryNotice && (
          <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />

            <div className="relative w-full max-w-md animate-[boundaryNoticeIn_220ms_ease-out] overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-cyan-50 to-amber-50 px-5 py-5 text-center shadow-2xl ring-1 ring-cyan-100/70">
              <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-cyan-200/40 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-amber-200/50 blur-2xl" />

              <button
                type="button"
                onClick={() => {
                  setBoundaryNotice(null);

                  if (boundaryNoticeTimerRef.current) {
                    clearTimeout(boundaryNoticeTimerRef.current);
                    boundaryNoticeTimerRef.current = null;
                  }
                }}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
                aria-label="Close boundary notice"
              >
                ×
              </button>

              <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                {boundaryNotice.type === "end" ? "⏭" : "⏮"}
              </div>

              <h3 className="relative pr-8 text-lg font-extrabold tracking-tight text-slate-950">
                {boundaryNotice.title}
              </h3>

              <p className="relative mt-2 text-sm font-semibold leading-relaxed text-slate-700 sm:text-base">
                {boundaryNotice.message}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes boundaryNoticeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default YouTubeSegmentPlayer;
