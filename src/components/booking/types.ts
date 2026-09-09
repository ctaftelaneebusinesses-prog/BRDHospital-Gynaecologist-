export interface PatientDetails {
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  reasonTags: string[];
  reason: string;
  message: string;
}

export interface BookingState {
  date: Date | null;
  time: string | null;
  patient: PatientDetails;
}

export const emptyPatient: PatientDetails = {
  fullName: "",
  phone: "",
  email: "",
  dob: "",
  reasonTags: [],
  reason: "",
  message: "",
};

export const emptyBookingState: BookingState = {
  date: null,
  time: null,
  patient: emptyPatient,
};
