import axios from 'axios';
import { ENV } from '@/config/env';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.TIMEOUT,
});


// THÊM ĐOẠN NÀY: Tự động đính kèm Token vào mọi Request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ENV.TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
