"use client";
import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, Calendar, Clock, User, Phone, 
  ChevronLeft, QrCode, PhoneCall, Navigation, 
  ShieldCheck, Info 
} from 'lucide-react';

const BookingDetail = () => {
    const params = useParams<{ id: string }>();
    const bookingId = params?.id ?? "BK-7821";

  // 1. Giả lập lấy dữ liệu từ localStorage hoặc Service
  const booking = useMemo(() => {
    // Trong thực tế: await bookingService.getById(bookingId)
    return {
      id: bookingId,
      deviceName: "Công nghệ Nâng cơ Hifu Pro",
      branchName: "Carevia Clinic - Quận 1",
      address: "123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM",
      startTime: "2024-05-20T09:00:00",
      endTime: "2024-05-20T10:30:00",
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      status: "upcoming",
      price: 50,
      image: "https://picsum.photos"
    };
  }, [bookingId]);

  const statusMap = {
    upcoming: { label: 'Sắp diễn ra', color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { label: 'Đã hoàn thành', color: 'text-green-600', bg: 'bg-green-50' },
    cancelled: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50' }
  };

  const currentStatus = statusMap[booking.status as keyof typeof statusMap];

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
            {booking.status === 'upcoming' && (
                <button className="text-[11px] font-bold text-red-500 uppercase tracking-widest underline decoration-2 underline-offset-4">
                    Yêu cầu hủy lịch hẹn
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
