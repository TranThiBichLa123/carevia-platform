export type UserRole = 'CLIENT' | 'STAFF' | 'ADMIN';

export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message: string;
  code: string;
  data: T;
  timestamp: string;
}

// Định nghĩa cấu trúc dữ liệu gửi lên khi Đăng ký
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  langKey?: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: string;
  avatarUrl?: string;
  createdAt: string;
  langKey?: string;
}

// Định nghĩa cấu trúc dữ liệu gửi lên khi Đăng nhập (Khớp với Controller của bạn)
export interface LoginRequest {
  login: string;    // Backend dùng 'login' thay vì 'username'
  password: string;
}

// Định nghĩa cấu trúc dữ liệu Backend trả về khi Login thành công
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    fullName?: string;
    avatarUrl?: string;
    langKey?: string;
  };
}
