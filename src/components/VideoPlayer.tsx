import { useRef, useState } from 'react'
import { LoaderCircle, Pause, Play, Volume2, VolumeX } from 'lucide-react'

type VideoPlayerProps = {
  src: string
  title: string
  poster?: string
  aspect?: 'portrait' | 'landscape'
  onPlayingChange?: (playing: boolean) => void
  onEnded?: () => void
}

export function VideoPlayer({ src, title, poster, aspect = 'landscape', onPlayingChange, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'missing' | 'playing'>('idle')
  const [muted, setMuted] = useState(false)

  const play = async () => {
    const video = videoRef.current
    if (!video || status === 'missing') return
    setStatus('loading')
    try {
      await video.play()
      setStatus('playing')
    } catch {
      // A rejected play() call can be a transient browser issue. Keep the
      // retry button available unless the media element reported a real error.
      setStatus(video.error ? 'missing' : 'ready')
    }
  }

  return (
    <div className={`video-frame video-frame--${aspect}`}>
      <video
        ref={videoRef}
        className="video-element"
        src={src}
        poster={poster}
        preload="none"
        playsInline
        muted={muted}
        controls={false}
        onLoadStart={() => setStatus((current) => current === 'idle' ? 'idle' : 'loading')}
        onCanPlay={() => setStatus((current) => current === 'loading' ? 'ready' : current)}
        onPlaying={() => { setStatus('playing'); onPlayingChange?.(true) }}
        onPause={() => { setStatus((current) => current === 'playing' ? 'ready' : current); onPlayingChange?.(false) }}
        onError={() => { setStatus('missing'); onPlayingChange?.(false) }}
        onEnded={() => { setStatus('ready'); onPlayingChange?.(false); onEnded?.() }}
        aria-label={title}
      />
      {(status === 'idle' || status === 'missing') && (
        <div className="video-fallback" aria-live="polite">
          {poster && <img src={poster} alt="" className="video-poster" />}
          <span className="video-fallback__ornament" aria-hidden="true">✧</span>
          <button className="video-play" type="button" onClick={play} disabled={status === 'missing'} aria-label={`Play ${title}`}>
            <Play size={16} fill="currentColor" />
          </button>
          <span className="video-caption">{status === 'missing' ? 'Your scene awaits' : 'A moment made for you'}</span>
        </div>
      )}
      {status === 'loading' && <div className="video-loading"><LoaderCircle className="spin" size={22} /> Preparing your scene…</div>}
      {status === 'ready' && (
        <button className="video-resume" type="button" onClick={play} aria-label={`Play ${title}`}><Play size={14} fill="currentColor" /> Play scene</button>
      )}
      {status === 'playing' && (
        <>
          <button className="video-pause" type="button" onClick={() => videoRef.current?.pause()} aria-label={`Pause ${title}`}><Pause size={15} fill="currentColor" /> Pause</button>
          <button className="video-mute" type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute video' : 'Mute video'}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </>
      )}
    </div>
  )
}
