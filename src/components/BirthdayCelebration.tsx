import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CakeSlice, Mic, Sparkles, Star, Wind } from 'lucide-react'
import { birthdayConfig } from '../config/birthdayConfig'

type Step = 'first-wish' | 'second-wish' | 'blow-prompt' | 'listening' | 'manual-blow' | 'blown'
type Props = { princessName: string; date: string; onComplete: () => void }

const otherMembers = [
  { name: 'Jin', column: 0, row: 0 },
  { name: 'SUGA', column: 1, row: 0 },
  { name: 'J-Hope', column: 2, row: 0 },
  { name: 'RM', column: 0, row: 1 },
  { name: 'Jimin', column: 1, row: 1 },
  { name: 'V', column: 2, row: 1 },
]

export function BirthdayCelebration({ princessName, date, onComplete }: Props) {
  const [step, setStep] = useState<Step>('first-wish')
  const [wishCount, setWishCount] = useState(0)
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number } | null>(null)
  const celebrationRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef<Step>('first-wish')
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()
  const candlesBlownOut = step === 'blown'

  const moveTo = (next: Step) => {
    stepRef.current = next
    setStep(next)
  }

  const stopMicrophone = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    micStreamRef.current?.getTracks().forEach((track) => track.stop())
    micStreamRef.current = null
    const audioContext = audioContextRef.current
    audioContextRef.current = null
    if (audioContext && audioContext.state !== 'closed') void audioContext.close().catch(() => undefined)
  }, [])

  useEffect(() => () => stopMicrophone(), [stopMicrophone])

  useEffect(() => {
    if (step !== 'blown') return
    const timer = window.setTimeout(onComplete, 3000)
    return () => window.clearTimeout(timer)
  }, [step, onComplete])

  const makeWish = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const container = celebrationRef.current?.getBoundingClientRect()
    const button = event.currentTarget.getBoundingClientRect()
    if (container) setBurstOrigin({ x: button.left + button.width / 2 - container.left, y: button.top + button.height / 2 - container.top })
    setWishCount((value) => value + 1)
    moveTo(stepRef.current === 'first-wish' ? 'second-wish' : 'blow-prompt')
  }

  const finishBlow = () => {
    if (stepRef.current === 'blown') return
    moveTo('blown')
    stopMicrophone()
  }

  const listenForBlow = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof window.AudioContext === 'undefined') {
      moveTo('manual-blow')
      return
    }

    moveTo('listening')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      micStreamRef.current = stream
      const audioContext = new window.AudioContext()
      audioContextRef.current = audioContext
      if (audioContext.state === 'suspended') await audioContext.resume()

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      audioContext.createMediaStreamSource(stream).connect(analyser)
      const samples = new Uint8Array(analyser.fftSize)
      const startedAt = performance.now()
      let strongBlowFrames = 0

      const listen = () => {
        if (stepRef.current !== 'listening') return
        analyser.getByteTimeDomainData(samples)
        const rms = Math.sqrt(samples.reduce((sum, sample) => sum + (sample - 128) ** 2, 0) / samples.length) / 128
        strongBlowFrames = rms > 0.12 ? strongBlowFrames + 1 : 0

        if (strongBlowFrames >= 8) {
          finishBlow()
          return
        }
        if (performance.now() - startedAt > 15000) {
          stopMicrophone()
          moveTo('manual-blow')
          return
        }
        animationFrameRef.current = window.requestAnimationFrame(listen)
      }

      animationFrameRef.current = window.requestAnimationFrame(listen)
    } catch {
      stopMicrophone()
      moveTo('manual-blow')
    }
  }

  const wishHint = {
    'first-wish': 'Jungkook has a special first wish just for you.',
    'second-wish': 'The other six are here too—make one more wish, Princi!',
    'blow-prompt': 'Two wishes made. Now blow gently toward the microphone to put out the candles.',
    listening: 'Blow gently toward your microphone. The candles are listening.',
    'manual-blow': 'No worries—tap below to send a little breeze to the candles.',
    blown: 'Wish granted. Your letter is opening in a moment…',
  }[step]

  return (
    <div className="celebration-content" ref={celebrationRef}>
      <div className="celebration-copy">
        <p className="eyebrow eyebrow--light"><span /> THE GRAND FINALE <span /></p>
        <h1>Happy birthday,<br /><em>Princess {princessName}</em></h1>
        <p className="scene-lede">{birthdayConfig.sceneDescriptions.celebration}</p>
        <span className="date-pill"><Star size={13} /> {date}</span>
        <div className={`festival-note ${wishCount > 0 ? 'is-glowing' : ''}`}>
          <span className="festival-note__icon" aria-hidden="true">✧</span>
          <p>To me, your birthday is its own little festival. A month before {date}, my heart is already counting down to the day I get to celebrate you.</p>
        </div>
        {(step === 'first-wish' || step === 'second-wish') && (
          <button className="wish-button" type="button" onClick={makeWish}>
            <Sparkles size={17} />
            <span>{step === 'first-wish' ? 'Make a wish' : 'Make one more wish'}</span>
            <ArrowRight size={15} />
          </button>
        )}
        {step === 'blow-prompt' && (
          <button className="wish-button" type="button" onClick={() => void listenForBlow()}>
            <Mic size={17} />
            <span>Blow out the candles</span>
            <ArrowRight size={15} />
          </button>
        )}
        {step === 'listening' && (
          <button className="wish-button wish-button--breeze" type="button" onClick={finishBlow}>
            <Wind size={17} />
            <span>Tap to send a breeze</span>
          </button>
        )}
        {step === 'manual-blow' && (
          <button className="wish-button wish-button--breeze" type="button" onClick={finishBlow}>
            <Wind size={17} />
            <span>Send a little breeze</span>
          </button>
        )}
        <p className="wish-hint" aria-live="polite">{wishHint}</p>
      </div>
      <div className={`cake-scene ${wishCount > 0 ? 'has-bts-wishes' : ''} ${candlesBlownOut ? 'is-wished' : ''}`} aria-label="A glowing birthday cake in the palace ballroom">
        <div className="celebration-constellation" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>
        <div className="chandelier chandelier--one"/><div className="chandelier chandelier--two"/>
        {wishCount > 0 && (
          <motion.div className="bts-wish-parade" initial={{ opacity: 0, y: -22, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0.01 : 0.45, ease: 'easeOut' }} aria-label="The other six BTS members have arrived with one more wish">
            <div className="bts-wish-parade__members">
              {otherMembers.map((member, index) => (
                <motion.div key={member.name} className="bts-member-sticker" initial={{ opacity: 0, y: -30, rotate: index % 2 ? 12 : -12, scale: 0.55 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0.01 : 0.42, delay: reducedMotion ? 0 : index * 0.075, type: 'spring', stiffness: 300, damping: 18 }}>
                  <span className="bts-member-sticker__portrait" role="img" aria-label={`${member.name}, BTS`} style={{ backgroundImage: "url('/assets/images/celebration/bts-six-wish-stickers.png')", backgroundPosition: `${member.column * 50}% ${member.row * 100}%` }} />
                  <span className="bts-member-sticker__name">{member.name}</span>
                </motion.div>
              ))}
            </div>
            <motion.p className="bts-wish-parade__message" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.5 }}>One more wish for you, Princi!</motion.p>
          </motion.div>
        )}
        <div className="cake-glow"/><div className={`cake-candles ${candlesBlownOut ? 'is-blown-out' : ''}`} aria-hidden="true"><i/><i/><i/></div>
        <div className="cake cake-top"><CakeSlice size={21}/></div><div className="cake cake-mid"/><div className="cake cake-base"/>
        <div className="cake-stand"/><div className="cake-nameplate">{princessName}</div>
        <i className="confetti c1">✦</i><i className="confetti c2">✧</i><i className="confetti c3">✦</i><i className="confetti c4">✧</i><i className="confetti c5">✦</i><i className="confetti c6">✧</i>
        <div className="celebration-rose">✿　✿　✿</div>
        <motion.div className="jungkook-sticker-wrap" animate={{ y: wishCount > 0 ? [0, -12, 0] : [0, -5, 0], rotate: wishCount > 0 ? [0, -3, 3, 0] : [0, 1, -1, 0] }} transition={wishCount > 0 ? { duration: 0.75, ease: 'easeOut' } : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.04 }}>
          <AnimatePresence mode="wait">
            {step === 'first-wish' && <motion.span key="first" className="jungkook-speech" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.22 }}>Princi, make a wish!</motion.span>}
            {step === 'second-wish' && <motion.span key="second" className="jungkook-speech" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.22 }}>One more with us!</motion.span>}
          </AnimatePresence>
          <img className="jungkook-sticker" src="/assets/images/celebration/jungkook-comic-sticker.png" alt="Jungkook fan-art sticker inviting Harshitha to make a birthday wish" />
          <span className="sticker-caption">Jungkook · fan art</span>
        </motion.div>
        <AnimatePresence>
          {candlesBlownOut && <motion.div className="blow-breeze" initial={{ opacity: 0, x: -80, scale: 0.7 }} animate={{ opacity: [0, 1, 0], x: [-80, 40, 130], scale: [0.7, 1.1, 1.2] }} transition={{ duration: reducedMotion ? 0.3 : 1.1, ease: 'easeOut' }} aria-hidden="true"><span>〰</span><span>〰</span><span>〰</span></motion.div>}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {wishCount > 0 && burstOrigin && (
          <motion.div key={wishCount} className="wish-burst" style={{ left: burstOrigin.x, top: burstOrigin.y }} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.35 : 1.7 }}>
            {Array.from({ length: 28 }, (_, index) => {
              const angle = (Math.PI * 2 * index) / 28
              const radiusX = reducedMotion ? 38 : 300
              const radiusY = reducedMotion ? 28 : 205
              return (
                <motion.span key={index} initial={{ x: 0, y: 0, scale: 0, opacity: 0 }} animate={{ x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY, scale: [0, 1.15, 0.65], opacity: [0, 1, 0], rotate: [0, 45, 90] }} transition={{ duration: reducedMotion ? 0.35 : 1.5, delay: index * 0.012, ease: 'easeOut' }}>
                  {index % 5 === 0 ? '♥' : index % 2 ? '✧' : '✦'}
                </motion.span>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="firework fw-one"/><div className="firework fw-two"/><div className="firework fw-three"/>
      <div className="celebration-footnote"><Sparkles size={14} /> YOUR KINGDOM IS FULL OF LOVE</div>
    </div>
  )
}
