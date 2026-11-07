import { Music2, Play, Volume2 } from 'lucide-react'

type MusicControllerProps = {
  status: 'starting' | 'playing' | 'blocked'
  onStart: () => void
}

export function MusicController({ status, onStart }: MusicControllerProps) {
  if (status === 'blocked') {
    return (
      <button className="music-status music-status--retry" type="button" onClick={onStart} aria-label="Start the birthday song">
        <Play size={14} fill="currentColor" /> <span>Start birthday song</span>
      </button>
    )
  }

  return (
    <div className="music-status" role="status" aria-live="polite">
      {status === 'playing' ? <Volume2 size={15} /> : <Music2 size={15} />}
      <span>{status === 'playing' ? 'Birthday song · ON' : 'Starting birthday song'}</span>
      <i className="music-status__pulse" aria-hidden="true" />
    </div>
  )
}
