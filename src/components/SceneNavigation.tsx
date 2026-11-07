import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react'

type SceneNavigationProps = {
  current: number
  count: number
  onBack: () => void
  onReplay: () => void
  autoAdvanceMs?: number
  awaitingVideo?: boolean
  continueLabel?: string
}

export function SceneNavigation({ current, count, onBack, onReplay, autoAdvanceMs, awaitingVideo = false, continueLabel }: SceneNavigationProps) {
  return (
    <nav className="scene-navigation" aria-label="Birthday story progress">
      <button className="nav-arrow" type="button" onClick={onBack} aria-label="Go back"><ArrowLeft size={17} /><span>Back</span></button>
      <div className="scene-progress" aria-label={`Scene ${current} of ${count}`}>
        <div className="progress-label"><span>THE ROYAL JOURNEY</span><span>{String(current).padStart(2, '0')} <i>/</i> {String(count).padStart(2, '0')}</span></div>
        <div className="progress-track">{Array.from({ length: count }, (_, i) => <span key={i} className={i < current ? 'is-lit' : ''} />)}</div>
        {autoAdvanceMs !== undefined && <div className="auto-progress" key={`${current}-${autoAdvanceMs}`} aria-hidden="true"><span style={{ animationDuration: `${autoAdvanceMs}ms` }} /></div>}
      </div>
      {current === count
        ? <button className="nav-arrow nav-arrow--replay" type="button" onClick={onReplay} aria-label="Replay birthday story"><span>Replay</span><RotateCcw size={16} /></button>
          : <div className="auto-next-label" aria-label={awaitingVideo ? 'The next scene starts after the complete video finishes playing' : continueLabel ? 'Complete the birthday wish ritual to continue' : 'Continues automatically'}><Sparkles size={13} /><span>{awaitingVideo ? 'VIDEO TO FINISH' : continueLabel ?? 'CONTINUES AUTOMATICALLY'}</span></div>}
    </nav>
  )
}
