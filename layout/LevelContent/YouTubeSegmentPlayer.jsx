import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * YouTubeSegmentPlayer - A reusable player for YouTube video segments
 *
 * Plays a specific segment of a YouTube video from startSec to endSec
 * and tracks watch time for the 50% completion gating.
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
  isVisible = true
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const lastReportedTimeRef = useRef(0);

  // Stop monitoring - stable ref-based function
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start monitoring - depends on stopMonitoring, startSec, endSec, onWatchTimeUpdate
  const startMonitoring = useCallback(() => {
    stopMonitoring();

    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();

        // HARD BOUNDARY: If user scrubs below startSec, force back to startSec
        if (currentTime < startSec) {
          playerRef.current.seekTo(startSec, true);
          return;
        }

        // HARD BOUNDARY: Pause at endSec
        if (currentTime >= endSec) {
          playerRef.current.pauseVideo();
          stopMonitoring();
          return;
        }

        // Track watch time relative to segment start (only valid time counts)
        const watchedTime = currentTime - startSec;

        // Report watch time every second
        if (watchedTime - lastReportedTimeRef.current >= 1) {
          lastReportedTimeRef.current = watchedTime;
          onWatchTimeUpdate?.(watchedTime);
        }
      }
    }, 250); // Poll more frequently for tighter boundary enforcement
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
          return;
        }
      }
      startMonitoring();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      // When paused, still check for boundary violations (user scrubbing)
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime < startSec) {
          playerRef.current.seekTo(startSec, true);
        } else if (currentTime > endSec) {
          playerRef.current.seekTo(endSec, true);
        }
      }
      stopMonitoring();
    } else {
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
      lastReportedTimeRef.current = 0;
      if (autoplay) {
        playerRef.current.playVideo();
      }
    }
  }, [startSec, isPlayerReady, autoplay]);

  // Reset watch time tracking when videoId changes
  useEffect(() => {
    lastReportedTimeRef.current = 0;
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
