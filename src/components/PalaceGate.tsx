import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

type PalaceGateProps = { princessName: string; princessNickname: string; onEnter: () => void; onStartMusic: () => void }

export function PalaceGate({ princessName, princessNickname, onEnter, onStartMusic }: PalaceGateProps) {
  const [opening, setOpening] = useState(false)
  const enterPalace = () => {
    if (opening) return
    onStartMusic()
    setOpening(true)
    window.setTimeout(onEnter, 1100)
  }
  return (
    <motion.main className={`invitation-screen ${opening ? 'is-opening' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.8 }}>
      <div className="gate-halo" aria-hidden="true" />
      <div className="gate-scene" aria-hidden="true">
        <div className="gate-moon" /><div className="gate-tower gate-tower--left" /><div className="gate-tower gate-tower--right" />
        <div className="gate-center"><div className="gate-arch"><div className="gate-doors"><span /><span /></div><div className="gate-door-glow" /></div><div className="gate-stair" /></div>
        <i className="sparkle s1">✦</i><i className="sparkle s2">✧</i><i className="sparkle s3">✦</i><i className="sparkle s4">✧</i>
      </div>
      <div className="invitation-copy">
        <div className="eyebrow"><span /> A PRIVATE ROYAL INVITATION <span /></div>
        <p className="invitation-for">Prepared especially for <strong>{princessName}</strong><span className="invitation-nickname"> · {princessNickname}</span></p>
        <h1>An Invitation to<br /><em>a Royal Celebration</em></h1>
        <p className="invitation-subtitle">A magical kingdom has been waiting<br className="mobile-break" /> for its princess.</p>
        <button className="gold-button" type="button" onClick={enterPalace} disabled={opening}><Sparkles size={16} /><span>{opening ? 'The gates are opening' : 'Enter the palace'}</span><ArrowRight size={17} /></button>
        <p className="tiny-note">A little film of love, made just for you</p>
      </div>
      <div className="invitation-footer"><span>✧</span> YOUR STORY BEGINS HERE <span>✧</span></div>
    </motion.main>
  )
}
