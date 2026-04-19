import { DeviceData } from "./deviceApi";
import { Product } from "@/types_enum/devices";
import { ExperienceSession, SessionStatus } from "@/types_enum/booking";

interface ApiSession {
  id?: string | number;
  deviceId?: string | number;
  serviceId?: string | number;
  branchName?: string;
  locationDetail?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  maxSlots?: number;
  availableSlots?: number;
  status?: string;
}

const mapDeviceCondition = (
  condition?: string
): Product["condition"] => {
  switch (condition?.toUpperCase()) {
    case "USED":
      return "used";
    case "REFURBISHED":
      return "refurbished";
    default:
      return "new";
  }
};

/**
 * Map DeviceData (from API) to Product (UI type)
 */
export function mapDeviceToProduct(device: DeviceData): Product {
  return {
    id: String(device.id),
    _id: String(device.id),
    name: device.name,
    slug: device.slug,
    description: device.description || "",
    content: device.content || "",
    price: device.price,
    originalPrice: device.originalPrice,
    discountPercentage: device.discountPercentage || 0,
    stock: device.stock,
    averageRating: device.averageRating || 0,
    image: device.image,
    images: device.images || [device.image],
    category: device.category
      ? {
          id: String(device.category.id),
          _id: String(device.category.id),
          name: device.category.name,
          slug: device.category.slug,
          image: device.category.image,
          categoryType: device.category.categoryType,
        }
      : { id: "", _id: "", name: "", slug: "", image: "", categoryType: "" },
    brand: device.brand
      ? {
          id: String(device.brand.id),
          _id: String(device.brand.id),
          name: device.brand.name,
          slug: device.brand.slug,
          image: device.brand.image,
        }
      : { id: "", _id: "", name: "", slug: "", image: "" },
    ratings: [],
    sku: device.sku || String(device.id),
    warranty: device.warranty || { period: 0, policy: "" },
    origin: device.origin || "",
    condition: mapDeviceCondition(device.deviceCondition),
    specifications: device.specifications || [],
    sold: device.sold || 0,
    reviewCount: device.reviewCount ?? device.ratingCount ?? 0,
    isBookingAvailable: device.isBookingAvailable || false,
    bookingPrice: device.bookingPrice || 0,
    sessionIds: [],
    tags: device.tags || [],
    videoUrl: device.videoUrl,
    quantity: 1,
    createdAt: device.createdAt,
  };
}

/**
 * Map API session response to ExperienceSession (UI type)
 */
export function mapApiSession(session: ApiSession): ExperienceSession {
  // API returns: id, device/service info, branchName, locationDetail,
  // sessionDate, startTime (LocalTime), endTime (LocalTime), maxSlots, availableSlots, status
  const sessionDate = session.sessionDate || "";
  const startTimeStr = session.startTime || "";
  const endTimeStr = session.endTime || "";

  // Combine date + time into ISO string for UI compatibility
  const startISO = sessionDate && startTimeStr
    ? `${sessionDate}T${startTimeStr}`
    : session.startTime || "";
  const endISO = sessionDate && endTimeStr
    ? `${sessionDate}T${endTimeStr}`
    : session.endTime || "";

  return {
    id: String(session.id),
    serviceId: String(session.deviceId || session.serviceId || ""),
    branchName: session.branchName || "",
    locationDetail: session.locationDetail || "",
    startTime: startISO,
    endTime: endISO,
    maxSlots: session.maxSlots || 0,
    availableSlots: session.availableSlots || 0,
    status: mapSessionStatus(session.status),
  };
}

function mapSessionStatus(status: string): SessionStatus {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return SessionStatus.OPEN;
    case "CLOSED":
    case "FULL":
      return SessionStatus.CLOSED;
    case "CANCELLED":
      return SessionStatus.CANCELLED;
    default:
      return SessionStatus.OPEN;
  }
}
