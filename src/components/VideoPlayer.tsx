"use client";

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-hotkeys'; // Import the hotkeys plugin
import Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
  options: any;
  onReady?: (player: Player) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onReady }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-theme-stream');
      
      videoRef.current?.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, function() {
        // Initialize hotkeys plugin
        (this as any).hotkeys({
          volumeStep: 0.1,
          seekStep: 10, // Skip 10 seconds with arrows
          enableModifiersForNumbers: false,
          alwaysCaptureHotkeys: true // Forces hotkeys even when player doesn't have focus
        });
        
        videojs.log('player is ready');
        onReady && onReady(player);
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, onReady]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
