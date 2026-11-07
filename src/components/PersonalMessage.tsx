import { Heart, Sparkles } from 'lucide-react'
import { birthdayConfig } from '../config/birthdayConfig'

export function PersonalMessage() {
  return (
    <div className="letter-layout">
      <div className="balcony-scene" aria-hidden="true">
        <div className="night-moon" />
        <div className="night-stars">✦ · ✧ · ✦ · ✧</div>
        <div className="balcony-arch"><div className="balcony-view" /></div>
        <div className="balcony-rail"><i /><i /><i /><i /><i /></div>
        <div className="balcony-flower">✿　✧　✿</div>
      </div>
      <div className="letter-copy">
        <p className="eyebrow eyebrow--light"><span /> A NOTE FROM THE HEART <span /></p>
        <h1>For you,<br /><em>with all my love</em></h1>
        <div className="letter-card letter-card--open">
          <div className="letter-card__seal" aria-hidden="true"><Heart size={16} fill="currentColor" /></div>
          <div className="letter-message">
            {birthdayConfig.personalMessage.split('\n').map((line, index) => line
              ? <p key={index}>{line}</p>
              : <br key={index} />)}
          </div>
        </div>
        <p className="letter-signoff"><Sparkles size={14} /> With love, your secret royal well-wisher.</p>
      </div>
    </div>
  )
}
