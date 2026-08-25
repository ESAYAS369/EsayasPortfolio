import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Sparkles, 
  PictureInPicture2,
  Loader2,
  ExternalLink,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyVideoPlayerProps {
  videoUrl: string;
  posterImage?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  showCustomControls?: boolean;
  onEnded?: () => void;
}

export type VideoSourceType = 'youtube' | 'vimeo' | 'direct' | 'unknown';

export function parseVideoUrl(url: string): { type: VideoSourceType; embedUrl: string; videoId?: string } {
  if (!url) return { type: 'unknown', embedUrl: '' };

  const cleanUrl = url.trim();

  // YouTube Shorts
  const ytShortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (ytShortsMatch) {
    const id = ytShortsMatch[1];
    return {
      type: 'youtube',
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // YouTube standard / youtu.be
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // Vimeo
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      type: 'vimeo',
      videoId: id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&color=c5a059&title=0&byline=0&portrait=0`,
    };
  }

  // Direct video file (Supabase, MP4, WebM, MOV, OGG, etc.)
  return {
    type: 'direct',
    embedUrl: cleanUrl,
  };
}

export default function PropertyVideoPlayer({
  videoUrl,
  posterImage,
  title,
  autoPlay = false,
  muted = false,
  loop = true,
  className = '',
  showCustomControls = true,
  onEnded,
}: PropertyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const parsed = parseVideoUrl(videoUrl);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setSpeedMenuOpen(false);
      }, 2500);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSpeedMenuOpen(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render iframe for YouTube or Vimeo
  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return (
      <div className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        )}
        <iframe
          src={parsed.embedUrl}
          title={title || "Property Video Tour"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  // Render HTML5 Player with custom luxury controls for direct video files (MP4, Supabase storage)
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 select-none shadow-2xl ${className}`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterImage}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            if (videoRef.current.buffered.length > 0) {
              setBuffered(
                (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) /
                  videoRef.current.duration) *
                  100
              );
            }
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Ambient Radial Lighting on hover */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-dark/90 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      )}

      {/* Initial Big Play Button overlay if not started */}
      {!hasStarted && !isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex flex-col items-center justify-center bg-dark/60 backdrop-blur-xs cursor-pointer z-20 group/play"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gold/90 text-dark flex items-center justify-center shadow-2xl shadow-gold/30 group-hover/play:bg-white transition-colors"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </motion.div>
          {title && (
            <div className="mt-4 text-center px-4">
              <span className="text-xs uppercase tracking-[0.3em] text-gold block font-semibold mb-1">Luxury Video Tour</span>
              <p className="text-white text-lg font-serif">{title}</p>
            </div>
          )}
        </div>
      )}

      {/* Custom Control Bar */}
      {showCustomControls && (
        <AnimatePresence>
          {(showControls || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-dark/95 via-dark/70 to-transparent z-30 flex flex-col gap-3"
            >
              {/* Progress Slider Bar */}
              <div className="relative group/bar flex items-center h-4 cursor-pointer">
                {/* Buffered track */}
                <div 
                  className="absolute left-0 h-1.5 rounded-full bg-white/20 pointer-events-none"
                  style={{ width: `${buffered}%` }}
                />
                {/* Progress Fill */}
                <div 
                  className="absolute left-0 h-1.5 rounded-full bg-gold shadow-sm shadow-gold/50 pointer-events-none transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                {/* Range Input */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Bottom Controls Row */}
              <div className="flex items-center justify-between gap-4 text-white text-xs">
                {/* Left: Play / Pause, Time, Title */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full hover:bg-white/10 text-gold hover:text-white transition-colors"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-white/70">
                    <span className="text-white font-medium">{formatTime(currentTime)}</span>
                    <span className="opacity-40">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Volume Controls */}
                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-gold transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-20 h-1 accent-gold bg-white/20 rounded-full cursor-pointer hidden sm:block opacity-70 group-hover/vol:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Right: Quality / Speed, PiP, Fullscreen */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Playback Speed dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-white/10 hover:bg-gold hover:text-dark transition-colors"
                    >
                      {playbackRate}x
                    </button>

                    {speedMenuOpen && (
                      <div className="absolute bottom-full right-0 mb-2 py-1 bg-dark/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md flex flex-col z-40 min-w-[70px]">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`px-3 py-1.5 text-left text-[11px] font-mono hover:bg-gold/20 hover:text-gold transition-colors ${
                              playbackRate === s ? 'text-gold font-bold bg-white/5' : 'text-white/70'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Picture-in-Picture */}
                  {document.pictureInPictureEnabled && (
                    <button
                      onClick={togglePictureInPicture}
                      className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-gold transition-colors hidden sm:block"
                      title="Picture in Picture"
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-gold transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Dedicated Cinema Lightbox Modal for any property
interface PropertyVideoModalProps {
  property: {
    title: string;
    location: string;
    price: string;
    videoUrl?: string;
    image?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiry?: () => void;
}

export function PropertyVideoModal({
  property,
  isOpen,
  onClose,
  onOpenInquiry,
}: PropertyVideoModalProps) {
  if (!isOpen || !property || !property.videoUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark/95 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl glass rounded-3xl overflow-hidden border border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col z-10 text-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-dark/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gold/10 text-gold border border-gold/20">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block">Cinema Showcase</span>
                <h3 className="text-lg font-serif text-white">{property.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gold font-serif text-lg hidden sm:block">{property.price}</span>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/10 hover:bg-gold hover:text-dark text-white transition-all"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="p-4 sm:p-6 bg-black flex-1">
            <PropertyVideoPlayer
              videoUrl={property.videoUrl}
              posterImage={property.image}
              title={property.title}
              autoPlay={true}
              muted={false}
              className="max-h-[65vh] w-full"
            />
          </div>

          {/* Footer Info & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-dark/60">
            <div className="text-white/60 text-xs flex items-center gap-2">
              <span>📍 {property.location}</span>
            </div>

            {onOpenInquiry && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInquiry();
                }}
                className="w-full sm:w-auto bg-gold text-dark font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-white transition-all shadow-lg shadow-gold/20"
              >
                Schedule Private Viewing
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
