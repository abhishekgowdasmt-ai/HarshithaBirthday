import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'

type Props = { princessName: string; princessNickname: string; date: string; onComplete: () => void }

const sparkles = ['✦', '✧', '✦', '♥', '✧', '✦', '✧', '✦']

export function PrincessEntrance({ princessName, princessNickname, date, onComplete }: Props) {
  const [lit, setLit] = useState(false)
  const reducedMotion = useReducedMotion()
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const lightStar = () => {
    setLit((current) => current || true)
  }

  useEffect(() => {
    if (!lit) return
    const timer = window.setTimeout(() => onCompleteRef.current(), 700)
    return () => window.clearTimeout(timer)
  }, [lit])

  return (
    <div className="november-arrival">
      <p className="eyebrow eyebrow--light"><span /> ONE STAR, JUST FOR YOU <span /></p>
      <h1>Tap the star<br /><em>of November 10</em></h1>
      <p className="november-arrival__lede">A single touch opens the rest of your birthday, {princessNickname}.</p>
      <motion.button
        className={`november-star ${lit ? 'is-lit' : ''}`}
        type="button"
        aria-label={lit ? `The star of ${date} is lit` : `Tap the star of ${date}`}
        aria-pressed={lit}
        onClick={lightStar}
        animate={reducedMotion || lit ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      >
        <span className="november-star__halo" aria-hidden="true" />
        <span className="november-star__halo november-star__halo--outer" aria-hidden="true" />
        <span className="november-star__core">
          <Star size={92} strokeWidth={1.15} fill={lit ? 'currentColor' : 'none'} />
          <strong>{date.replace(/th$/, '')}</strong>
          <small>{princessName}</small>
        </span>
        <span className="november-star__hint">{lit ? 'Opening your story' : 'Tap'}</span>
        {lit && (
          <span className="november-star__burst" aria-hidden="true">
            {sparkles.map((sparkle, index) => (
              <motion.i
                key={index}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((index / sparkles.length) * Math.PI * 2) * 120,
                  y: Math.sin((index / sparkles.length) * Math.PI * 2) * 120,
                  scale: 1,
                }}
                transition={{ duration: reducedMotion ? 0.2 : 0.7, ease: 'easeOut' }}
              >
                {sparkle}
              </motion.i>
            ))}
          </span>
        )}
      </motion.button>
    </div>
  )
}
