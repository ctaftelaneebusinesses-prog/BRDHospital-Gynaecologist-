/**
 * Site-wide exclusive audio player — only one sound plays at a time.
 * Starting a new sound always stops whatever was playing before it.
 */
let current: HTMLAudioElement | null = null;

export function playExclusiveSound(url: string, volume = 0.6): HTMLAudioElement {
  stopCurrentSound();
  const audio = new Audio(url);
  audio.volume = volume;
  current = audio;
  audio.addEventListener("ended", () => {
    if (current === audio) current = null;
  });
  audio.play().catch(() => {
    // Autoplay can still be blocked in some browsers — fail silently.
  });
  return audio;
}

/** Stops whatever sound is currently playing, if any. */
export function stopCurrentSound() {
  if (current) {
    current.pause();
    current.currentTime = 0;
    current = null;
  }
}

/** True if the given audio element is the one currently playing site-wide. */
export function isCurrentSound(audio: HTMLAudioElement): boolean {
  return current === audio;
}
