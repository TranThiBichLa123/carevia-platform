import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth/auth.service'; 
import { LoginRequest, AuthResponse } from '@/services/auth/auth.types';
import { ENV } from '@/config/env';

export const useLogin = () => {
  return useMutation({
    // 1. Chỉ định rõ kiểu dữ liệu đầu vào là LoginRequest
    mutationFn: (data: LoginRequest) => authService.login(data),
    
    // 2. Sử dụng AuthResponse thay cho 'any' để có gợi ý code (Intellisense)
    onSuccess: (res: AuthResponse) => { 
      // Lưu Access Token vào LocalStorage dùng Key từ file ENV
      localStorage.setItem(ENV.TOKEN_KEY, res.accessToken);
      
      // Lưu Refresh Token để xử lý gia hạn phiên đăng nhập sau này
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, res.refreshToken);
      
      // Lưu thông tin User (chuyển Object thành String) để hiển thị tên/avatar ở Header
      localStorage.setItem('user_info', JSON.stringify(res.user));

      console.log("Đăng nhập thành công! Chào mừng", res.user.username);
    },

    // 3. Xử lý khi có lỗi (Sai mật khẩu, không tìm thấy user...)
    onError: (error: any) => {
      const message = error.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      console.error("Login Error:", message);
      // Bạn có thể dùng thư viện toast để hiển thị thông báo lỗi ở đây
    }
  });
};
