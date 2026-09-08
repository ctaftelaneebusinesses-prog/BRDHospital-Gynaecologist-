import { photos } from "./images";

export interface JourneyStage {
  id: string;
  stage: string;
  weeks: string;
  title: string;
  description: string;
  careInfo: string[];
  image: string;
}

export const journeyStages: JourneyStage[] = [
  {
    id: "first-trimester",
    stage: "Stage 1",
    weeks: "Weeks 1 – 12",
    title: "First Trimester",
    description:
      "The earliest weeks bring big changes. We confirm your pregnancy, review your health history and begin gentle, reassuring monitoring.",
    careInfo: ["Initial prenatal screening", "Nutrition & supplement guidance", "Early ultrasound dating scan"],
    image: photos.journeyFirstTrimester,
  },
  {
    id: "second-trimester",
    stage: "Stage 2",
    weeks: "Weeks 13 – 27",
    title: "Second Trimester",
    description:
      "Often called the 'golden period' — energy returns and your baby's growth accelerates. We monitor development closely and prepare you for what's ahead.",
    careInfo: ["Anomaly & growth scans", "Glucose screening", "Movement & wellness check-ins"],
    image: photos.journeySecondTrimester,
  },
  {
    id: "third-trimester",
    stage: "Stage 3",
    weeks: "Weeks 28 – 40",
    title: "Third Trimester",
    description:
      "As your due date nears, visits become more frequent. We track your baby's position, your wellbeing, and build your personalized birth plan together.",
    careInfo: ["Weekly monitoring visits", "Birth plan preparation", "Position & readiness checks"],
    image: photos.journeyThirdTrimester,
  },
  {
    id: "delivery",
    stage: "Stage 4",
    weeks: "The Big Day",
    title: "Delivery",
    description:
      "Whichever path your delivery takes, our maternity team is by your side — experienced, calm and fully present for this moment.",
    careInfo: ["24/7 maternity support", "Personalized delivery care", "Immediate newborn care"],
    image: photos.journeyDelivery,
  },
  {
    id: "postnatal",
    stage: "Stage 5",
    weeks: "Weeks 1 – 6 Postpartum",
    title: "Postnatal Care",
    description:
      "Recovery matters just as much as delivery. We support your healing, your feeding journey, and your emotional wellbeing as you settle into motherhood.",
    careInfo: ["Postpartum recovery checkups", "Lactation & feeding support", "Emotional wellness guidance"],
    image: photos.journeyPostnatal,
  },
];
