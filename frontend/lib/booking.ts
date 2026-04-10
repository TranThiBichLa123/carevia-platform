import { ExperienceSession, SessionStatus } from "@/types_enum/booking";

export const getAvailableSessionsByProductId = (
  sessions: ExperienceSession[],
  productId: string,
  appointmentDate?: string
) => {
  return sessions.filter((session) => {
    const isMatchingProduct = session.serviceId === productId;
    const isOpen = session.status === SessionStatus.OPEN;
    const hasSlots = session.availableSlots > 0;
    const matchesDate = appointmentDate
      ? session.startTime.startsWith(appointmentDate)
      : true;

    return isMatchingProduct && isOpen && hasSlots && matchesDate;
  });
};