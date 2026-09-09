export interface PatientDetails {
  fullName: string;
  phone: string;
  email: string;
  reasonTags: string[];
  reason: string;
  upiTransactionId: string;
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
  reasonTags: [],
  reason: "",
  upiTransactionId: "",
};

export const emptyBookingState: BookingState = {
  date: null,
  time: null,
  patient: emptyPatient,
};
