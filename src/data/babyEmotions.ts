import cryingSound from "../assets/baby-crying.mp3";
import laughingSound from "../assets/baby-laughing.mp3";
import talkingSound from "../assets/baby-talking.mp3";
import { photos } from "./images";

export interface BabyEmotion {
  id: string;
  label: string;
  description: string;
  image: string;
  sound: string;
}

export const babyEmotions: BabyEmotion[] = [
  {
    id: "crying",
    label: "Crying",
    description: "Every cry is a signal — we help new parents learn to read them with confidence.",
    image: photos.babyCrying,
    sound: cryingSound,
  },
  {
    id: "laughing",
    label: "Laughing",
    description: "The sound every parent waits for — pure, contagious joy.",
    image: photos.babyLaughing,
    sound: laughingSound,
  },
  {
    id: "talking",
    label: "Cooing & Babbling",
    description: "Tiny sounds that mark the very first steps toward saying 'Mama'.",
    image: photos.babyTalking,
    sound: talkingSound,
  },
];
