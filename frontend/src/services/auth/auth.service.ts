import axios from "axios";
import apiClient from "../apiClient";
import {
  ApiEnvelope,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RegisterResponse,
} from "./auth.types";

const unwrapResponse = <T>(payload: T | ApiEnvelope<T>): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    const envelope = payload as ApiEnvelope<T>;

    if (!envelope.success) {
      throw new Error(envelope.message || "Yêu cầu thất bại");
    }

    return envelope.data;
  }

  return payload as T;
};

const extractErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string;
          error?: string;
          details?: string[];
          errors?: Array<{ defaultMessage?: string; message?: string }>;
        }
      | string
      | undefined;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.errors?.length) {
      return responseData.errors[0]?.defaultMessage || responseData.errors[0]?.message || error.message;
    }

    if (responseData?.details?.length) {
      return responseData.details[0];
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã có lỗi xảy ra";
};

// Gom các hàm vào một object authService để dễ quản lý
export const authService = {
  // Hàm đăng ký
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return unwrapResponse<RegisterResponse>(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error) || "Đăng ký thất bại");
    }
  },

  // Hàm đăng nhập (Thêm kiểu trả về là AuthResponse)
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return unwrapResponse<AuthResponse>(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error) || "Đăng nhập thất bại");
    }
  }
};
