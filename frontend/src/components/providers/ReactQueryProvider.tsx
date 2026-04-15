"use client"; // Bắt buộc phải có dòng này

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo QueryClient trong useState để tránh việc tạo lại client mỗi lần re-render
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Dữ liệu được coi là mới trong 1 phút
        retry: 1, // Thử lại 1 lần nếu lỗi
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
