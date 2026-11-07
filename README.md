# The Royal Birthday Palace

A mobile-first birthday story built with React, Vite, TypeScript, Tailwind CSS, Framer Motion and Lucide icons. The invitation opens into four scenes: the princess arrival, one combined wishes video, an interactive birthday finale, and a personal letter. The birthday song starts when the palace opens and keeps playing. The story waits for the wishes video to finish, then guides the visitor through two wishes and a candle-blowing moment before opening the letter.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). Create a production build with `pnpm build`; preview it with `pnpm preview`.

In the current Desktop copy, the production preview is served at `http://127.0.0.1:4174/`. On a regular local shell, `pnpm dev` starts Vite with hot reload.

## Personalise the birthday

Edit [`src/config/birthdayConfig.ts`](src/config/birthdayConfig.ts). Change:

- `princessName` and `princessNickname` for her name and nickname throughout the experience.
- `birthdayDate` for the date ribbon and name plaque.
- `personalMessage` for the final letter.
- `videos.royalWishes` if you choose a different filename or path for the combined 10-second clip.
- `audio.birthdaySong` for the always-on birthday song path.
- `sceneDescriptions` for the short descriptions announced with each scene.

The arrival scene uses three tappable stars. At the cake, a Jungkook fan-art sticker invites the first wish; the other six BTS member stickers pop in for a second wish. The visitor can blow toward the microphone to extinguish the candles, or tap the breeze button if microphone access is unavailable. The letter opens automatically after the candle effect. The festival note says November 10 feels like a festival, with the countdown beginning a month ahead. Harshitha's scene uses a decorative cameo and does not display a personal photo. The wishes scene plays one user-supplied birthday tribute featuring BTS, Lord Krishna and Lord Venkateswara; its caption identifies it as fan-made and does not imply official BTS participation.

## Add Gemini / Veo videos

The 10-second MP4 is included at `public/assets/videos/royal-wishes.mp4`. That is the only video file the site uses. Its path is configured in `birthdayConfig.ts`:

The video is click-to-play with sound, uses `preload="none"` and `playsInline`, and shows a graceful fallback until the file is added. For best mobile playback, export H.264 MP4 at a mobile-friendly resolution. The player accepts an optional local poster image.

## Add portrait, posters and music

- Scene image directories are ready under `public/assets/images/` (`palace`, `princess`, `bts`, `krishna`, `venkateswara`, and `celebration`). The celebration folder includes the Jungkook fan-art sticker and generated six-member sticker sheet. The palace scenes are CSS/SVG artwork, with no remote image dependencies.
- The bundled birthday song lives at `public/assets/audio/birthday-song.mp3`. It starts when the visitor opens the palace, keeps playing through the story and has no off switch. While the wishes video plays, the song volume dips so the wishes remain clear, then returns to its regular level.
- `VideoPlayer` accepts a `poster` path for any video scene. Pass a local image path to it when adding posters.

## Vercel deployment with a GoDaddy domain

1. Import the GitHub repository into Vercel and keep the Vite settings: install command `pnpm install`, build command `pnpm build`, output directory `dist`.
2. In the Vercel project, open **Settings → Domains** and add `harshithadinakar.com` and `www.harshithadinakar.com`.
3. In GoDaddy, open the domain's DNS records and add the exact records Vercel shows for the project. The apex domain normally uses an A record; `www` normally uses a CNAME. Keep any existing mail records.
4. Wait for Vercel to verify the records and provision HTTPS. DNS values are project-specific, so use the values shown in Vercel.
5. In **Settings → Environment Variables**, add `BIRTHDAY_PIN` and `COOKIE_SIGNING_SECRET` for Production (and Preview if preview deployments should also unlock). Enter the four-digit PIN as the value of `BIRTHDAY_PIN`. Set `COOKIE_SIGNING_SECRET` to a random secret of at least 32 characters; generate one with a cryptographically secure random generator and keep it private. Redeploy after adding or changing either variable.

Vercel Routing Middleware protects the site and its static assets before serving them. A successful PIN entry grants that browser a signed, HttpOnly session for 30 days. The unlock endpoint applies a best-effort five-failure cooldown per client address. Keep the repository and environment variables private if the source or media should also be hidden. See [Vercel's custom-domain guide](https://vercel.com/docs/domains/set-up-custom-domain), [Routing Middleware guide](https://vercel.com/docs/routing-middleware), and [GoDaddy's DNS record guide](https://www.godaddy.com/help/manage-dns-records-680). Large video files can make deployment and first playback slower; compress each MP4 before adding it.
