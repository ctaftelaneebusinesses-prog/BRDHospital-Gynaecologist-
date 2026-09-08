/**
 * Central image asset registry.
 *
 * Most photographs are declared as a slug from Unsplash's CDN. Slots where the
 * clinic's own photography (src/assets) is available use that local file directly
 * instead of a slug — img()/srcSet() detect this and pass the local URL through
 * unchanged rather than building an Unsplash URL from it.
 */

import pregnantMotherAtHome from "../assets/PergentMother-optimized.webp";
import newbornPortrait from "../assets/baby.webp";
import deliveryRoomEmbrace from "../assets/hospital.jpg";
import motherHoldingNewborn from "../assets/motherbaby.jpg";
import doctorWithNewborn from "../assets/doctorbaby-optimized.avif";
import coupleWithUltrasound from "../assets/ultra.jpg";
import pregnancyIllustration from "../assets/motherwithinsidebaby-optimized.webp";
import babyFeetInParentsHands from "../assets/legs-cropped.jpg";

const BASE = "https://images.unsplash.com/";

interface ImgOptions {
  w?: number;
  h?: number;
  q?: number;
}

function isLocalAsset(slug: string): boolean {
  return slug.startsWith("/") || slug.startsWith("http") || slug.startsWith("data:");
}

/** Build an optimized, responsive Unsplash URL from a photo slug (or pass a local asset URL through). */
export function img(slug: string, { w = 1200, h, q = 80 }: ImgOptions = {}): string {
  if (isLocalAsset(slug)) return slug;
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    q: String(q),
    w: String(w),
  });
  if (h) params.set("h", String(h));
  return `${BASE}${slug}?${params.toString()}`;
}

/** Build a srcSet string across a few common widths (empty for local assets, which have one fixed size). */
export function srcSet(slug: string, widths: number[] = [480, 768, 1080, 1600]): string {
  if (isLocalAsset(slug)) return "";
  return widths.map((w) => `${img(slug, { w })} ${w}w`).join(", ");
}

// Raw photo slugs, organized by where they're used.
export const photos = {
  heroPregnant: pregnantMotherAtHome,
  heroParentsNewborn: "photo-1543342384-1f1350e27861",

  collageParentsWindow: "photo-1774041259458-1b5be7f70704",
  collageFatherNewborn: babyFeetInParentsHands,
  collageBellyHands: pregnantMotherAtHome,
  collageMotherBabySepia: motherHoldingNewborn,
  collageFamilySofa: newbornPortrait,

  serviceGynecology: "photo-1632053652571-a6a45052bbbd",
  servicePregnancy: "photo-1704901901060-36b29dd3b2cb",
  serviceMaternity: "photo-1785706134106-bc597f2d82ff",
  serviceFertility: "photo-1781888691534-0ccaad251fbb",
  serviceWellness: "photo-1544367567-0f2fcb009e0b",
  serviceUltrasound: "photo-1654931800911-7a9cfb3b7c17",
  serviceUltrasoundMachine: "photo-1691933880113-3c0d20a48451",

  journeyFirstTrimester: "photo-1704901901060-36b29dd3b2cb",
  journeySecondTrimester: "flagged/photo-1572531186838-27a5459566f2",
  journeyThirdTrimester: "photo-1634577107465-ce5147bac363",
  journeyDelivery: doctorWithNewborn,
  journeyPostnatal: "photo-1620737007484-2d3bd3079a35",

  doctorPrimary: "photo-1736289173074-df6009da27c9",
  doctorSecondary: "photo-1756699279298-c89cdef354ab",
  doctorTertiary: "photo-1623854767648-e7bb8009f0db",

  whyChooseUs: "photo-1543342384-1f1350e27861",

  storyBeginning: coupleWithUltrasound,
  storyMoment: deliveryRoomEmbrace,
  storyJourneyContinues: "photo-1764697383585-20e59662c817",

  testimonialAvatar1: "photo-1745434159123-af6142c7862f",
  testimonialAvatar2: "photo-1781888691534-0ccaad251fbb",
  testimonialAvatar3: "photo-1544005313-94ddf0286df2",

  finalCta: pregnancyIllustration,

  aboutConsultation: "photo-1632053652571-a6a45052bbbd",
} as const;

export type PhotoKey = keyof typeof photos;
