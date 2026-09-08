/**
 * Site-wide exclusive audio player — only one sound plays at a time.
 * Starting a new sound always stops whatever was playing before it.
 */
let current: HTMLAudioElement | null = null;

export function playExclusiveSound(url: string, volume = 0.6) {
  if (current) {
    current.pause();
    current.currentTime = 0;
  }
  const audio = new Audio(url);
  audio.volume = volume;
  current = audio;
  audio.play().catch(() => {
    // Autoplay can still be blocked in some browsers — fail silently.
  });
}
