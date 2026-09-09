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
    name: "Dr. Haritha Mandava",
    title: "Obstetrician, Gynaecologist & Sonologist",
    specializations: ["Obstetrics & Gynaecology", "High-Risk Pregnancy Care", "Ultrasound & Sonology"],
    experienceYears: 14,
    qualifications: ["MBBS", "MS (OBG)"],
    languages: ["English", "Telugu", "Tamil", "Hindi", "Kannada"],
    availability: "Mon – Sat, 9:00 AM – 6:00 PM",
    rating: 4.9,
    reviewCount: 612,
    bio: "A graduate of Guntur Medical College, Dr. Haritha Mandava brings over a decade of experience guiding women through every stage of reproductive health — from routine wellness visits to high-risk pregnancies. As a qualified sonologist, she personally performs and reads ultrasound scans, so patients get clear answers from the same doctor they trust for their care.",
    image: photos.doctorPrimary,
  },
];
