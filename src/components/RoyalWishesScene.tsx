import { Flower2, Music2, Sparkles } from 'lucide-react'
import { birthdayConfig } from '../config/birthdayConfig'
import { VideoPlayer } from './VideoPlayer'

type RoyalWishesSceneProps = {
  onVideoPlayingChange: (playing: boolean) => void
  onVideoEnded: () => void
}

export function RoyalWishesScene({ onVideoPlayingChange, onVideoEnded }: RoyalWishesSceneProps) {
  return (
    <div className="scene-layout wishes-layout">
      <div className="scene-copy wishes-copy">
        <p className="eyebrow eyebrow--light"><span /> ONE LITTLE FILM, THREE ROYAL WISHES <span /></p>
        <h1>Love, wishes<br /><em>& blessings</em></h1>
        <p className="scene-lede">A single 10-second birthday film brings together wishes from BTS, Lord Krishna and Lord Venkateswara for {birthdayConfig.princessName}.</p>
        <div className="wish-guest-list" aria-label="The birthday wishes in this film">
          <div><span className="wish-icon wish-icon--purple"><Music2 size={15} /></span><span><strong>BTS</strong><small>A fan-made birthday wish</small></span></div>
          <div><span className="wish-icon wish-icon--lotus"><Flower2 size={15} /></span><span><strong>Lord Krishna</strong><small>A blessing of love and wisdom</small></span></div>
          <div><span className="wish-icon wish-icon--gold"><Sparkles size={15} /></span><span><strong>Lord Venkateswara</strong><small>A blessing for peace and happiness</small></span></div>
        </div>
        <p className="fan-disclaimer">This is a fan-made birthday tribute and does not imply official participation by BTS members.</p>
      </div>
      <div className="wishes-film-card">
        <div className="wishes-film-heading"><span><Sparkles size={14} /> THE BIRTHDAY WISHES</span><span>00:10</span></div>
        <VideoPlayer src={birthdayConfig.videos.royalWishes} title="Ten-second birthday wishes from BTS, Lord Krishna and Lord Venkateswara" onPlayingChange={onVideoPlayingChange} onEnded={onVideoEnded} />
        <p className="video-location-note">The story continues after the complete film has played.</p>
      </div>
    </div>
  )
}
