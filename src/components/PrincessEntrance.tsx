import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Crown, Heart, Sparkles, Star } from 'lucide-react'

type Props = { princessName: string; princessNickname: string; date: string }

const starPositions: CSSProperties[] = [
  { top: '14%', left: '11%' },
  { top: '19%', right: '9%' },
  { bottom: '19%', left: '14%' },
]

export function PrincessEntrance({ princessName, princessNickname, date }: Props) {
  const [litStars, setLitStars] = useState<number[]>([])

  const lightStar = (index: number) => {
    setLitStars((current) => current.includes(index) ? current : [...current, index])
  }

  return (
    <div className="scene-layout arrival-layout">
      <div className="scene-copy">
        <p className="eyebrow eyebrow--light"><span /> THE PRINCESS ARRIVES <span /></p>
        <h1>Welcome,<br /><em>Your Royal Highness</em></h1>
        <p className="scene-lede">Every rose, every candle, every golden light has been waiting for this moment.</p>
        <div className="name-plaque"><Crown size={19} /><div><span>OUR PRINCESS</span><strong>{princessName}</strong><small>{princessNickname} · {date}</small></div><Heart size={17} /></div>
        <div className="scene-note star-instructions"><Sparkles size={14} /> {litStars.length === 3 ? 'The palace stars are shining just for you.' : `Tap the floating stars to light the palace · ${litStars.length}/3`}</div>
      </div>
      <div className="portrait-stage">
        <motion.div className="portrait-orbit" animate={{ rotate: 360 }} transition={{ duration: 44, repeat: Infinity, ease: 'linear' }} />
        <div className="portrait-frame">
          <div className="portrait-placeholder" aria-label={`Decorative royal cameo for ${princessNickname}`}><div className="cameo-orbit"/><div className="cameo-silhouette" aria-hidden="true"><Crown size={24} strokeWidth={1.2} /><i className="cameo-head"/><span /></div><span className="cameo-name">{princessNickname}</span><small>A little royal cameo, just for you</small></div>
        </div>
        <div className="star-interactions" aria-label="Interactive palace stars">
          {starPositions.map((position, index) => {
            const lit = litStars.includes(index)
            return (
              <motion.button
                key={index}
                className={`constellation-star ${lit ? 'is-lit' : ''}`}
                type="button"
                style={position}
                aria-label={`Light palace star ${index + 1}`}
                aria-pressed={lit}
                onClick={() => lightStar(index)}
                animate={{ y: [0, -6, 0], rotate: [0, 7, -5, 0] }}
                transition={{ duration: 2.4 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.82 }}
              >
                <Star size={20} fill={lit ? 'currentColor' : 'none'} />
              </motion.button>
            )
          })}
        </div>
        <div className="rose rose-a">✿</div><div className="rose rose-b">✿</div><div className="rose rose-c">✿</div>
      </div>
    </div>
  )
}
