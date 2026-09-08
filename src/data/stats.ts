export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 10, suffix: "+", label: "Years of Experience" },
  { value: 5000, suffix: "+", label: "Families Served" },
  { value: 15, suffix: "+", label: "Healthcare Services" },
  { value: 98, suffix: "%", label: "Patient Satisfaction" },
];
