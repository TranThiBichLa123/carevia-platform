// src/services/apiClient.ts
import axios from 'axios';
import { ENV } from '../config/env'; // Import từ file cấu hình trên

const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
