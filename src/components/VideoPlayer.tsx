"use client";

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-hotkeys'; // Import the hotkeys plugin
import Player from 'video.js/dist/types/player';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface VideoPlayerProps {
  options: any;
  movieId?: string;
  onReady?: (player: Player) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, movieId, onReady }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-theme-stream');
      
      videoRef.current?.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, async function() {
        // Initialize hotkeys plugin
        (this as any).hotkeys({
          volumeStep: 0.1,
          seekStep: 10,
          enableModifiersForNumbers: false,
          alwaysCaptureHotkeys: true
        });

        // Resume Playback Logic
        const user = auth.currentUser;
        if (user && movieId) {
          try {
            const q = query(
              collection(db, 'watch_events'),
              where('userId', '==', user.uid),
              where('movieId', '==', movieId)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              // Find the most recent event in javascript to avoid needing a custom Firestore index
              let latestEvent = querySnapshot.docs[0].data();
              querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.timestamp?.toMillis() > latestEvent.timestamp?.toMillis()) {
                  latestEvent = data;
                }
              });

              // If they watched more than 5 seconds, resume from there
              if (latestEvent.secondsWatched > 5) {
                this.currentTime(latestEvent.secondsWatched);
              }
            }
          } catch (e) {
            console.error("Error fetching resume time", e);
          }
        }
        
        videojs.log('player is ready');
        onReady && onReady(player);
      });

      // Analytics Tracking
      player.on('pause', async () => {
        const user = auth.currentUser;
        if (user && movieId) {
          try {
            await addDoc(collection(db, 'watch_events'), {
              userId: user.uid,
              movieId: movieId,
              secondsWatched: player.currentTime(),
              timestamp: new Date()
            });
          } catch (e) {
            console.error("Error logging analytics", e);
          }
        }
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, movieId, onReady]);

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
