"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, Calendar, Clock, User, Phone, 
  ChevronLeft, QrCode, PhoneCall, Navigation, 
  ShieldCheck, Info, XCircle, Loader2
} from 'lucide-react';
import { bookingService } from '@/services/bookings/bookingService';
import { mockBookings, mockSessions, mockProducts } from '@/constants/data';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BookingDetail = () => {
    const params = useParams<{ id: string }>();
    const bookingId = params?.id ?? "";

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getById(bookingId);
        if (data) {
          setBooking(data);
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback: localStorage + mock
      const STORAGE_KEY = 'carevia_bookings';
      const savedData = localStorage.getItem(STORAGE_KEY);
      const localBookings = savedData ? JSON.parse(savedData) : [];
      const found = localBookings.find((b: any) => b.id === bookingId);

      if (found) {
        setBooking(found);
      } else {
        const mockBooking = mockBookings.find((b) => b.id === bookingId);
        if (mockBooking) {
          const session = mockSessions.find((s) => s.id === mockBooking.sessionId);
          const product = mockProducts.find((p) => p.sessionIds.includes(mockBooking.sessionId));
          setBooking({
            ...mockBooking,
            deviceName: product?.name || 'Unknown Device',
            image: product?.image || '',
            branchName: session?.branchName || '',
            address: session?.locationDetail || '',
            customerName: 'Bạn',
            customerPhone: '',
            price: mockBooking.totalPrice,
          });
        }
      }
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await bookingService.updateStatus(bookingId, 'CANCELLED', cancelReason);
      setBooking((prev: any) => ({ ...prev, status: 'cancelled' }));
      toast.success('Đã hủy lịch hẹn thành công.');
      const STORAGE_KEY = 'carevia_bookings';
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const localBookings = JSON.parse(savedData);
        const updated = localBookings.map((b: any) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      // Fallback: update locally
      setBooking((prev: any) => ({ ...prev, status: 'cancelled' }));
      toast.success('Đã hủy lịch hẹn.');
    }
    setIsCancelling(false);
    setIsCancelDialogOpen(false);
  };

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    upcoming: { label: 'Sắp diễn ra', color: 'text-blue-600', bg: 'bg-blue-50' },
    pending: { label: 'Chờ xác nhận', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    Pending: { label: 'Chờ xác nhận', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    confirmed: { label: 'Đã xác nhận', color: 'text-green-600', bg: 'bg-green-50' },
    Confirmed: { label: 'Đã xác nhận', color: 'text-green-600', bg: 'bg-green-50' },
    completed: { label: 'Đã hoàn thành', color: 'text-green-600', bg: 'bg-green-50' },
    Completed: { label: 'Đã hoàn thành', color: 'text-green-600', bg: 'bg-green-50' },
    cancelled: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50' },
    Cancelled: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Không tìm thấy lịch hẹn với mã: {bookingId}</p>
        <Link href="/client/my-bookings" className="text-teal-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const currentStatus = statusMap[booking.status] || statusMap.pending;
  const canCancel = ['upcoming', 'pending', 'Pending', 'confirmed', 'Confirmed'].includes(booking.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header điều hướng */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[13px] font-black uppercase tracking-[0.2em]">Chi tiết lịch hẹn</h1>
          <div className="w-10"></div> {/* Placeholder cân bằng */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        
        {/* THÔNG TIN TRẠNG THÁI & QR */}
        <div className="bg-white border border-gray-200 p-8 text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${currentStatus.bg} ${currentStatus.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`}></span>
                {currentStatus.label}
            </div>
            
            <div className="flex justify-center py-4">
                <div className="p-3 border-2 border-gray-100 rounded-xl bg-white shadow-sm">
                    <QrCode size={160} strokeWidth={1.5} className="text-gray-800" />
                    <p className="text-[10px] font-bold text-gray-400 mt-2 tracking-[0.3em]">ID: {booking.id}</p>
                </div>
            </div>
            <p className="text-[11px] text-gray-500 italic">Vui lòng đưa mã này cho nhân viên lễ tân khi đến chi nhánh</p>
        </div>

        {/* THÔNG TIN DỊCH VỤ */}
        <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="aspect-video w-full bg-gray-100">
                <img src={booking.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="p-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">{booking.deviceName}</h2>
                <div className="mt-4 grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày hẹn</p>
                        <p className="text-sm font-bold flex items-center gap-2"><Calendar size={14} className="text-[#00b2bd]" /> 20/05/2024</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Giờ hẹn</p>
                        <p className="text-sm font-bold flex items-center gap-2"><Clock size={14} className="text-[#00b2bd]" /> 09:00 - 10:30</p>
                    </div>
                </div>
            </div>
        </div>

        {/* THÔNG TIN ĐỊA ĐIỂM */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Địa điểm thực hiện
            </h3>
            <div>
                <p className="text-sm font-bold text-gray-900">{booking.branchName}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">{booking.address}</p>
            </div>
            <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 border border-gray-200 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                    <Navigation size={14} /> Chỉ đường
                </button>
                <button className="flex-1 py-3 border border-gray-200 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                    <PhoneCall size={14} /> Gọi chi nhánh
                </button>
            </div>
        </div>

        {/* THÔNG TIN KHÁCH HÀNG */}
        <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <User size={14} /> Thông tin khách hàng
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-500 font-medium">Họ và tên</span>
                    <span className="text-xs font-bold uppercase">{booking.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Số điện thoại</span>
                    <span className="text-xs font-bold">{booking.customerPhone}</span>
                </div>
            </div>
        </div>

        {/* LƯU Ý QUAN TRỌNG */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-sm flex gap-3">
            <Info size={18} className="text-amber-600 shrink-0" />
            <div className="space-y-1">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Lưu ý trải nghiệm</p>
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                    Quý khách vui lòng có mặt trước 10 phút. Nếu đi trễ quá 15 phút, Clinic xin phép dời lịch hẹn của quý khách sang khung giờ khác để đảm bảo chất lượng phục vụ.
                </p>
            </div>
        </div>

        {/* FOOTER CAM KẾT */}
        <div className="py-6 text-center space-y-4">
            <div className="flex justify-center items-center gap-2 text-[#00b2bd]">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dịch vụ chuẩn y khoa</span>
            </div>
            {canCancel && (
                <button 
                    onClick={() => setIsCancelDialogOpen(true)}
                    className="text-[11px] font-bold text-red-500 uppercase tracking-widest underline decoration-2 underline-offset-4"
                >
                    Yêu cầu hủy lịch hẹn
                </button>
            )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle size={18} /> Hủy lịch hẹn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn hủy lịch hẹn <strong>{booking.deviceName}</strong>?
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Lý do hủy (không bắt buộc)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm resize-none"
                rows={3}
                placeholder="Nhập lý do hủy..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Giữ lịch
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetail;
