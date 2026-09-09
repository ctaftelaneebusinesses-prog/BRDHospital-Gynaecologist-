import { photos } from "./images";

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  experienceYears: number;
  qualifications: string[];
  languages: string[];
  availability: string;
  rating: number;
  reviewCount: number;
  bio: string;
  image: string;
}

export const doctors: Doctor[] = [
  {
    id: "dr-haritha",
    name: "Dr. Haritha",
    title: "Gynecologist & Obstetrician",
    specializations: ["Gynecological Care", "Reproductive Health", "Gynecological Surgery"],
    experienceYears: 14,
    qualifications: ["MBBS", "MS (Obstetrics & Gynecology)", "FICOG"],
    languages: ["English", "Telugu", "Tamil", "Hindi", "Kannada"],
    availability: "Mon – Sat, 9:00 AM – 6:00 PM",
    rating: 4.9,
    reviewCount: 612,
    bio: "Dr. Haritha has spent over a decade guiding women through every stage of reproductive health, from routine wellness visits to complex gynecological care. Patients describe her as attentive, plain-spoken and endlessly reassuring.",
    image: photos.doctorPrimary,
  },
];
