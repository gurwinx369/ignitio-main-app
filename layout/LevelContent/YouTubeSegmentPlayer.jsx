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
  shouldPauseVideo = false
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const containerRef = useRef(null);

  // Track last known position for delta calculation
  const lastCurrentTimeRef = useRef(null);
  // Track whether we're currently playing (for detecting forward playback)
  const isPlayingRef = useRef(false);

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

        // HARD BOUNDARY: If user scrubs below startSec, force back to startSec
        if (currentTime < startSec) {
          playerRef.current.seekTo(startSec, true);
          lastCurrentTimeRef.current = startSec;
          return;
        }

        // HARD BOUNDARY: Pause at endSec
        if (currentTime >= endSec) {
          playerRef.current.pauseVideo();
          stopMonitoring();
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
            onWatchTimeUpdate?.({ currentTime, delta });
          }
        }

        lastCurrentTimeRef.current = currentTime;
      }
    }, 250); // Poll frequently for accurate tracking
  }, [stopMonitoring, startSec, endSec, onWatchTimeUpdate]);

  // Handle player state changes
  const handleStateChange = useCallback((event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      // When playback starts, verify we're within segment bounds
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        // If somehow playing below startSec, seek back immediately
        if (currentTime < startSec) {
          playerRef.current.seekTo(startSec, true);
          lastCurrentTimeRef.current = startSec;
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
        if (currentTime < startSec) {
          playerRef.current.seekTo(startSec, true);
          lastCurrentTimeRef.current = startSec;
        } else if (currentTime > endSec) {
          playerRef.current.seekTo(endSec, true);
          lastCurrentTimeRef.current = endSec;
        }
      }
      stopMonitoring();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      stopMonitoring();
    } else {
      // BUFFERING, UNSTARTED, etc. - pause tracking
      stopMonitoring();
    }
  }, [startMonitoring, stopMonitoring, startSec, endSec]);

  // Handle player ready
  const handlePlayerReady = useCallback(() => {
    setIsPlayerReady(true);
    onReady?.();
  }, [onReady]);

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
    };
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

      playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          start: startSec,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
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
  }, [videoId, startSec, autoplay, handlePlayerReady, handleStateChange]);

  // Seek to start when segment changes
  useEffect(() => {
    if (isPlayerReady && playerRef.current?.seekTo) {
      playerRef.current.seekTo(startSec, true);
      lastCurrentTimeRef.current = startSec;
      if (autoplay) {
        playerRef.current.playVideo();
      }
    }
  }, [startSec, isPlayerReady, autoplay]);

  // Reset position tracking when videoId changes
  useEffect(() => {
    lastCurrentTimeRef.current = null;
  }, [videoId]);

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
        // Enforce hard boundaries regardless of play state
        if (currentTime < startSec) {
          playerRef.current.seekTo(startSec, true);
        } else if (currentTime > endSec) {
          playerRef.current.seekTo(endSec, true);
          if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
          }
        }
      }
    }, 200);

    return () => clearInterval(boundaryCheckInterval);
  }, [isPlayerReady, startSec, endSec, videoId]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div
        id={`youtube-player-${videoId}`}
        className="absolute top-0 left-0 w-full h-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl"
      />
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded-3xl sm:rounded-[2.5rem]">
          <div className="text-gray-400 text-lg">Loading video...</div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSegmentPlayer;
