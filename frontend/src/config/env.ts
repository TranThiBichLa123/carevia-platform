// src/config/env.ts
export const ENV = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Carevia-Platform',
  API_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'carevia_access_token',
  REFRESH_TOKEN_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'carevia_refresh_token',
  TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
};
