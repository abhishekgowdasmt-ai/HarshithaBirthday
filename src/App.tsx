import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Crown, Sparkles } from 'lucide-react'
import { birthdayConfig } from './config/birthdayConfig'
import { PalaceGate } from './components/PalaceGate'
import { PrincessEntrance } from './components/PrincessEntrance'
import { RoyalWishesScene } from './components/RoyalWishesScene'
import { BirthdayCelebration } from './components/BirthdayCelebration'
import { PersonalMessage } from './components/PersonalMessage'
import { SceneNavigation } from './components/SceneNavigation'
import { MusicController } from './components/MusicController'

const scenes = [
  { id: 'arrival', label: 'The arrival', short: 'ARRIVAL', description: birthdayConfig.sceneDescriptions.arrival, className: 'scene--arrival', durationMs: 9500 },
  { id: 'wishes', label: 'Wishes & blessings', short: 'THE WISHES', description: birthdayConfig.sceneDescriptions.wishes, className: 'scene--wishes', durationMs: 0 },
  { id: 'celebration', label: 'The celebration', short: 'THE FINALE', description: birthdayConfig.sceneDescriptions.celebration, className: 'scene--celebration', durationMs: 0 },
  { id: 'letter', label: 'A personal note', short: 'A LETTER', description: birthdayConfig.sceneDescriptions.letter, className: 'scene--letter', durationMs: 0 },
] as const

function App() {
  const [entered, setEntered] = useState(false)
  const [current, setCurrent] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [musicStatus, setMusicStatus] = useState<'starting' | 'playing' | 'blocked'>('starting')
  const musicRef = useRef<HTMLAudioElement>(null)
  const reducedMotion = useReducedMotion()
  const activeScene = scenes[current]
  // The wishes scene is intentionally gated by the film's real ended event.
  const autoAdvanceMs = current === 0 ? activeScene.durationMs : undefined
  const transition = useMemo(() => reducedMotion ? { duration: 0.01 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }, [reducedMotion])

  const startMusic = () => {
    const audio = musicRef.current
    if (!audio) return
    audio.volume = videoPlaying ? 0.18 : 0.66
    setMusicStatus('starting')
    void audio.play().then(() => setMusicStatus('playing')).catch(() => setMusicStatus('blocked'))
  }

  useEffect(() => {
    const audio = musicRef.current
    if (audio) audio.volume = videoPlaying ? 0.18 : 0.66
  }, [videoPlaying])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && current === 0) {
        setVideoPlaying(false)
        setCurrent((value) => Math.min(value + 1, scenes.length - 1))
      }
      if (event.key === 'ArrowLeft') {
        setVideoPlaying(false)
        setCurrent((value) => Math.max(value - 1, 0))
      }
      if (event.key === 'Escape') setEntered(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current])

  useEffect(() => {
    if (!entered) return
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [current, entered, reducedMotion])

  useEffect(() => {
    if (!entered || current >= scenes.length - 1 || autoAdvanceMs === undefined) return
    const timer = window.setTimeout(() => {
      setVideoPlaying(false)
      setCurrent((value) => Math.min(value + 1, scenes.length - 1))
    }, autoAdvanceMs)
    return () => window.clearTimeout(timer)
  }, [entered, current, autoAdvanceMs])

  const enter = () => {
    setCurrent(0)
    setVideoPlaying(false)
    setEntered(true)
  }
  const replay = () => {
    setCurrent(0)
    setVideoPlaying(false)
    setEntered(false)
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }
  const back = () => {
    setVideoPlaying(false)
    if (current === 0) setEntered(false)
    else setCurrent((value) => Math.max(value - 1, 0))
  }
  const videoEnded = () => {
    setVideoPlaying(false)
    setCurrent((value) => Math.min(value + 1, scenes.length - 1))
  }

  const sceneContent = activeScene.id === 'arrival'
    ? <PrincessEntrance princessName={birthdayConfig.princessName} princessNickname={birthdayConfig.princessNickname} date={birthdayConfig.birthdayDate} />
    : activeScene.id === 'wishes'
      ? <RoyalWishesScene onVideoPlayingChange={setVideoPlaying} onVideoEnded={videoEnded} />
      : activeScene.id === 'celebration'
        ? <BirthdayCelebration princessName={birthdayConfig.princessName} date={birthdayConfig.birthdayDate} onComplete={() => { setVideoPlaying(false); setCurrent(scenes.length - 1) }} />
        : <PersonalMessage />

  return (
    <div className="app-shell">
      <div className="ambient-grain" aria-hidden="true" />
      <audio ref={musicRef} src={birthdayConfig.audio.birthdaySong} loop preload="auto" aria-hidden="true" onError={() => setMusicStatus('blocked')} />
      {!entered ? <PalaceGate princessName={birthdayConfig.princessName} princessNickname={birthdayConfig.princessNickname} onEnter={enter} onStartMusic={startMusic} /> : (
        <motion.main className={`story-screen ${activeScene.className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <header className="story-header">
            <div className="brand-mark"><span className="brand-crown"><Crown size={18} /></span><span><small>THE ROYAL</small><strong>BIRTHDAY PALACE</strong></span></div>
            <div className="story-chapter"><span>CHAPTER {String(current + 1).padStart(2, '0')}</span><i>·</i>{activeScene.short}</div>
            <MusicController status={musicStatus} onStart={startMusic} />
          </header>
          <div className="story-main">
            <div className="scene-topline"><span><Sparkles size={13} /> {activeScene.label}</span><span className="scene-topline__date">{birthdayConfig.birthdayDate}</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.section key={activeScene.id} className={`scene ${activeScene.className}`} initial={{ opacity: 0, y: reducedMotion ? 0 : 17, filter: reducedMotion ? 'none' : 'blur(3px)' }} animate={{ opacity: 1, y: 0, filter: 'none' }} exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }} transition={transition} aria-label={activeScene.description}>
                {sceneContent}
              </motion.section>
            </AnimatePresence>
          </div>
          <footer className="story-footer">
            <div className="footer-whisper"><span>✧</span> MADE WITH LOVE, JUST FOR YOU <span>✧</span></div>
          <SceneNavigation current={current + 1} count={scenes.length} onBack={back} onReplay={replay} autoAdvanceMs={current < scenes.length - 1 ? autoAdvanceMs : undefined} awaitingVideo={current === 1} continueLabel={current === 2 ? 'WISH RITUAL' : undefined} />
          </footer>
        </motion.main>
      )}
    </div>
  )
}

export default App
