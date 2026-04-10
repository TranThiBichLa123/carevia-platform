export enum BookingStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
  NOSHOW = "NoShow",
}

export enum SessionStatus {
  OPEN = "Open",
  CLOSED = "Closed",
  CANCELLED = "Cancelled",
}

export interface ExperienceSession {
  id: string;
  serviceId: string;
  branchName: string;
  locationDetail: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  availableSlots: number;
  status: SessionStatus;
}

export interface Booking {
  id: string;
  bookingCode: string;
  accountId: string;
  sessionId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
  customerNote?: string;
  createdAt: string;
}