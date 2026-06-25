export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const formatTime = (value: string) => value.slice(0, 5);

export const getTodayInputValue = () => new Date().toISOString().slice(0, 10);

// Định dạng chuẩn chỉnh gửi lên không lo lệch 7 tiếng
export const toIsoDateTime = (value: string, isEndDate = false) => {
  const date = new Date(value);
  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
};
export const getBackofficeErrorMessage = (
  error: unknown,
  fallback: string
) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object"
  ) {
    const payload = error.response.data as { message?: string; error?: string };
    if (typeof payload.message === "string") {
      return payload.message;
    }
    if (typeof payload.error === "string") {
      return payload.error;
    }
  }

  return fallback;
};