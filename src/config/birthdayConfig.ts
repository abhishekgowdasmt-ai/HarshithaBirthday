export const birthdayConfig = {
  princessName: 'Harshitha',
  princessNickname: 'Princi',
  birthdayDate: 'November 10th',
  personalMessage: `Dearest Harshitha,\n\nMay this next chapter bring you the kind of joy that feels like sunlight through a palace window. Keep dreaming boldly, laughing freely, and being the wonderful person everyone is lucky to know. Today, and every day, you deserve to feel celebrated.\n\nWith all my warmest wishes,\nYour secret royal well-wisher`,
  videos: {
    royalWishes: '/assets/videos/royal-wishes.mp4',
  },
  audio: {
    birthdaySong: '/assets/audio/birthday-song.mp3',
  },
  sceneDescriptions: {
    arrival: 'Tonight, every light in the palace shines for you.',
    wishes: 'One short birthday film brings together heartfelt wishes and divine blessings.',
    celebration: 'Today, the entire kingdom celebrates you!',
    letter: 'A little note, wrapped in a little bit of magic.',
  },
} as const

export type BirthdayConfig = typeof birthdayConfig
