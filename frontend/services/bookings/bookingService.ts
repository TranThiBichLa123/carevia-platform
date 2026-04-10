// services/bookingService.ts

const STORAGE_KEY = 'carevia_bookings';

export const bookingService = {
  // Lấy danh sách lịch hẹn
  getAll: async () => {
    // Hiện tại: Lấy từ LocalStorage (giả lập API)
    // Tương lai: return axios.get('/api/bookings')
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Tạo lịch hẹn mới
  create: async (bookingData: any) => {
    // Hiện tại: Lưu vào LocalStorage
    // Tương lai: return axios.post('/api/bookings', bookingData)
    const existing = await bookingService.getAll();
    const newList = [bookingData, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    return bookingData;
  },

  // Cập nhật trạng thái (Hủy lịch)
  updateStatus: async (id: string, status: string) => {
    // Tương lai: return axios.patch(`/api/bookings/${id}`, { status })
    const existing = await bookingService.getAll();
    const updated = existing.map((b: any) => 
      b.id === id ? { ...b, status } : b
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  }
};
