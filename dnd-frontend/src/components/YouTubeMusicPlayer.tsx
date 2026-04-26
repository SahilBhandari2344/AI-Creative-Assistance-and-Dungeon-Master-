'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, X } from 'lucide-react';

interface YouTubeMusicPlayerProps {
  defaultVideoId?: string;
}

export default function YouTubeMusicPlayer({ defaultVideoId = 'sHGaUGWha1M' }: YouTubeMusicPlayerProps) {
  const [videoId, setVideoId] = useState(defaultVideoId);
  const [inputUrl, setInputUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(25);
  const [showPanel, setShowPanel] = useState(false);
  const playerRef = useRef<any>(null);
  const apiLoadedRef = useRef(false);
  const playerContainerIdRef = useRef('yt-player-' + Math.random().toString(36).substr(2, 9));
  const isDestroyingRef = useRef(false);
  const initAttemptedRef = useRef(false);

  console.log('🎵 Player State:', { 
    hasPlayer: !!playerRef.current, 
    videoId, 
    isPlaying,
    apiLoaded: apiLoadedRef.current,
    containerId: playerContainerIdRef.current
  });

  const extractVideoId = (url: string): string | null => {
    url = url.trim();
    console.log('🔍 Extracting from:', url);
    
    const patterns = [
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log('✅ Extracted ID:', match[1]);
        return match[1];
      }
    }
    
    console.log('❌ No match found');
    return null;
  };

  const handleUrlSubmit = () => {
    console.log('📝 Submit clicked, input:', inputUrl);
    const extractedId = extractVideoId(inputUrl);
    if (extractedId) {
      console.log('🎬 Setting video ID:', extractedId);
      setVideoId(extractedId);
      setInputUrl('');
    } else {
      console.log('⚠️ Invalid URL');
      alert('Invalid URL! Accepted formats:\n- https://youtu.be/VIDEO_ID\n- https://youtube.com/watch?v=VIDEO_ID\n- Or just the video ID (11 characters)');
    }
  };

  // Create player container outside React's control
  useEffect(() => {
    const containerId = playerContainerIdRef.current;
    console.log('🔧 Setting up container:', containerId);
    
    // Create container element directly in body
    if (!document.getElementById(containerId)) {
      console.log('📦 Creating container element');
      const container = document.createElement('div');
      container.id = containerId;
      container.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;';
      document.body.appendChild(container);
      console.log('✅ Container created');
    } else {
      console.log('✅ Container already exists');
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleanup triggered');
      if (isDestroyingRef.current) return;
      isDestroyingRef.current = true;

      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === 'function') {
            console.log('💥 Destroying player');
            playerRef.current.destroy();
          }
          playerRef.current = null;
        } catch (e) {
          console.error('Error destroying player:', e);
        }
      }

      setTimeout(() => {
        const container = document.getElementById(containerId);
        if (container && container.parentNode) {
          try {
            console.log('🗑️ Removing container');
            container.parentNode.removeChild(container);
          } catch (e) {
            console.error('Error removing container:', e);
          }
        }
      }, 100);
    };
  }, []);

  const initializePlayer = () => {
    console.log('🎮 initializePlayer called');
    console.log('   - Has player?', !!playerRef.current);
    console.log('   - Is destroying?', isDestroyingRef.current);
    console.log('   - Already attempted?', initAttemptedRef.current);
    
    if (playerRef.current || isDestroyingRef.current || initAttemptedRef.current) {
      console.log('⚠️ Skipping - player exists, destroying, or already attempted');
      return;
    }
    
    const containerId = playerContainerIdRef.current;
    const container = document.getElementById(containerId);
    
    console.log('   - Container found?', !!container);
    
    if (!container) {
      console.log('⏳ Container not ready, retrying in 100ms...');
      setTimeout(initializePlayer, 100);
      return;
    }
    
    // Check if API is actually ready
    if (!(window as any).YT || !(window as any).YT.Player) {
      console.log('⏳ API not ready yet, retrying in 100ms...');
      setTimeout(initializePlayer, 100);
      return;
    }
    
    initAttemptedRef.current = true;
    console.log('🎬 Creating YouTube player with video:', videoId);
    
    try {
      playerRef.current = new (window as any).YT.Player(containerId, {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (event: any) => {
            console.log('✅ Player READY event fired!');
            if (!isDestroyingRef.current) {
              event.target.setVolume(volume);
              console.log('🔊 Volume set to:', volume);
            }
          },
          onStateChange: (event: any) => {
            const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
            console.log('🎵 State change:', states[event.data + 1] || 'UNKNOWN');
            if (!isDestroyingRef.current) {
              setIsPlaying(event.data === 1);
            }
          },
          onError: (event: any) => {
            console.error('❌ Player error:', event.data);
            if (!isDestroyingRef.current) {
              const errors: Record<number, string> = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found or removed',
                101: 'Video cannot be embedded',
                150: 'Video cannot be embedded',
              };
              alert(`YouTube Error: ${errors[event.data] || 'Unknown error'}`);
            }
          },
        },
      });
      console.log('✅ Player object created successfully');
    } catch (error) {
      console.error('❌ Failed to create player:', error);
      initAttemptedRef.current = false; // Allow retry on error
    }
  };

  // Load YouTube API AND initialize player when ready
  useEffect(() => {
    console.log('📡 Load API effect triggered. Already loaded?', apiLoadedRef.current);
    
    const loadAPI = () => {
      console.log('🔍 Checking for YouTube API...');
      if ((window as any).YT && (window as any).YT.Player) {
        console.log('✅ API already available');
        apiLoadedRef.current = true;
        // Initialize immediately if API is ready
        setTimeout(initializePlayer, 100);
        return;
      }

      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        console.log('⏳ API script already loading...');
        // Set up callback in case it wasn't set
        if (!(window as any).onYouTubeIframeAPIReady) {
          (window as any).onYouTubeIframeAPIReady = () => {
            console.log('🎉 YouTube API Ready callback fired!');
            apiLoadedRef.current = true;
            initializePlayer();
          };
        }
        return;
      }

      console.log('📥 Creating API script tag');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      (window as any).onYouTubeIframeAPIReady = () => {
        console.log('🎉 YouTube API Ready callback fired!');
        apiLoadedRef.current = true;
        initializePlayer();
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        console.log('✅ Script tag inserted');
      } else {
        console.error('❌ No script tag found to insert before');
      }
    };

    loadAPI();
  }, []);

  // Handle video ID changes
  useEffect(() => {
    console.log('🔄 Video ID change effect. ID:', videoId);
    console.log('   - Has player?', !!playerRef.current);
    console.log('   - Has loadVideoById?', !!playerRef.current?.loadVideoById);
    
    if (!playerRef.current || !playerRef.current.loadVideoById || isDestroyingRef.current) {
      console.log('⏳ Player not ready for video change');
      return;
    }

    console.log('📼 Loading video:', videoId);
    try {
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
      });
      console.log('✅ loadVideoById called');
    } catch (error) {
      console.error('❌ Failed to load video:', error);
    }
  }, [videoId]);

  const togglePlay = () => {
    console.log('▶️ Toggle play clicked');
    console.log('   - Has player?', !!playerRef.current);
    console.log('   - Currently playing?', isPlaying);
    
    if (!playerRef.current || isDestroyingRef.current) {
      console.error('❌ Player not available');
      alert('Player is not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      if (isPlaying) {
        console.log('⏸️ Calling pauseVideo()');
        playerRef.current.pauseVideo();
      } else {
        console.log('▶️ Calling playVideo()');
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('❌ Failed to toggle play:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    console.log('🔊 Volume change:', volume, '→', newVolume);
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume && !isDestroyingRef.current) {
      try {
        playerRef.current.setVolume(newVolume);
      } catch (error) {
        console.error('❌ Failed to set volume:', error);
      }
    }
  };

  return (
    <>
      {/* Floating Music Button */}
      <button
        onClick={() => {
          console.log('🎵 Music button clicked, panel was:', showPanel);
          setShowPanel(!showPanel);
        }}
        className="fixed bottom-24 right-6 z-40 bg-amber-800 hover:bg-amber-900 text-amber-50 p-3 rounded-full border-2 border-amber-900 shadow-xl transition-all hover:scale-110"
        title="Background Music"
      >
        <Music className="w-6 h-6" />
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Music Control Panel */}
      {showPanel && (
        <div className="fixed bottom-40 right-6 z-40 bg-amber-50 border-4 border-amber-900/30 rounded-lg shadow-2xl w-80 p-4 font-serif">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Background Music
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-stone-600 hover:text-stone-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* URL Input */}
          <div className="mb-3">
            <label className="text-xs text-stone-600 mb-1 block">
              YouTube URL or Video ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="youtu.be/... or video ID"
                className="flex-1 px-3 py-2 border-2 border-amber-900/20 rounded text-sm focus:outline-none focus:border-amber-700 transition"
              />
              <button
                onClick={handleUrlSubmit}
                className="bg-amber-700 hover:bg-amber-800 text-amber-50 px-3 py-2 rounded text-sm font-semibold transition"
              >
                Load
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mb-3 p-2 bg-stone-100 rounded text-xs font-mono space-y-1">
            <div>Video: {videoId}</div>
            <div>Player: {playerRef.current ? '✅ Ready' : '❌ Not Ready'}</div>
            <div>API: {apiLoadedRef.current ? '✅ Loaded' : '⏳ Loading...'}</div>
            <div>Container: {document.getElementById(playerContainerIdRef.current) ? '✅' : '❌'}</div>
            <div className="font-bold">Status: {isPlaying ? '▶️ Playing' : '⏸️ Paused'}</div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-stone-300">
            <button
              onClick={togglePlay}
              disabled={!playerRef.current}
              className="bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-amber-50 p-3 rounded transition shadow-md hover:shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex-1 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-stone-600" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="flex-1 accent-amber-700 cursor-pointer"
              />
              <span className="text-xs text-stone-600 w-8 font-semibold">{volume}%</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-stone-600 bg-amber-50 border border-amber-300 rounded p-2">
            <p className="font-semibold mb-1 text-amber-800">💡 Tip:</p>
            <p className="text-stone-700 leading-relaxed">
              Music keeps playing even when you close this panel. Use the floating 🎵 button to control it!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
