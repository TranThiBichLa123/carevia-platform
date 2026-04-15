"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/common/Container';
import { motion } from 'framer-motion';


const MyBookings = () => {
    const STORAGE_KEY = 'carevia_bookings';
    const [bookings, setBookings] = useState<any[]>([]); // Khởi tạo mảng rỗng
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // 1. Hàm nạp dữ liệu (Sau này chỉ cần thay code bên trong bằng fetch/axios)
    const fetchBookings = async () => {
        setLoading(true);
        // Giả lập độ trễ mạng để chuẩn bị cho API thật
        setTimeout(() => {
            const savedData = localStorage.getItem(STORAGE_KEY);
            const localBookings = savedData ? JSON.parse(savedData) : [];

            // Trộn dữ liệu mẫu với dữ liệu người dùng đã đặt cho phong phú
            const mockData = [
                { id: "BK-SAMPLE", deviceName: "Nâng cơ Hifu (Mẫu)", status: "completed" }
            ];

            setBookings([...localBookings, ...mockData]);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // 2. Hàm xử lý hủy lịch (Chuẩn bị để gọi API PATCH/PUT)
    const handleCancelBooking = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
            // Cập nhật State để UI thay đổi ngay lập tức
            const updatedBookings = bookings.map(booking =>
                booking.id === id ? { ...booking, status: 'cancelled' } : booking
            );
            setBookings(updatedBookings);

            // Cập nhật vào LocalStorage (Tương lai là: await api.update(id, {status: 'cancelled'}))
            // Chỉ lưu những booking thực tế của người dùng (không lưu mẫu)
            const userBookings = updatedBookings.filter(b => b.id !== "BK-SAMPLE");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userBookings));
        }
    };

    // 3. Logic lọc giữ nguyên
    const filteredBookings = bookings.filter(booking =>
        filter === 'all' ? true : booking.status === filter
    );

    // 4. Helper hiển thị giữ nguyên của bạn
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'upcoming': return { label: 'Sắp tới', class: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Clock size={14} /> };
            case 'completed': return { label: 'Đã hoàn thành', class: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCircle2 size={14} /> };
            case 'cancelled': return { label: 'Đã hủy', class: 'bg-red-50 text-red-600 border-red-100', icon: <XCircle size={14} /> };
            default: return { label: 'Chờ xác nhận', class: 'bg-gray-50 text-gray-600 border-gray-100', icon: <AlertCircle size={14} /> };
        }
    };

    if (loading) return <div className="text-center py-20 font-black text-gray-300">Đang tải lịch hẹn...</div>;


    return (
        <Container className="min-h-screen bg-[#f8f9fa] pb-20">
            {/* Header */}
            <div className=" sticky top-0 z-10">
                {/* Breadcrumb - Hiển thị đúng chữ TRANG CHỦ thay vì Icon */}
                <div className="">
                    <div className="container px-4 py-3">
                        <nav className="flex items-center text-[13px] gap-2">
                            {/* Giữ nguyên chữ Trang Chủ */}
                            <Link
                                href="/client"
                                className="text-[13px]  tracking-wider text-gray-500 hover:text-black transition-colors font-medium"
                            >
                                Trang chủ
                            </Link>

                            {/* Dấu gạch chéo mờ */}
                            <span className="text-gray-300 font-light mx-1 text-[13px]">/</span>

                            {/* Phần trang hiện tại: Viết hoa, Đậm, Màu đen */}
                            <span className="text-[13px]  tracking-wider text-gray-900">
                                Lịch hẹn của tôi
                            </span>
                        </nav>
                    </div>
                </div>


            </div>

            {/* Booking List */}
            <div className=" px-3 space-y-4">
                {/* tab phân loại */}
                <div className="flex px-4 border-b border-gray-200 bg-white">
                    {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => {
                        const isActive = filter === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`relative px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 min-w-[100px] ${isActive ? 'text-[#00b2bd]' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {/* Nội dung Tab: Icon (nếu có) và Chữ */}
                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    {/* Bạn có thể thêm Icon ở đây nếu muốn giống hình mẫu */}
                                    <span>
                                        {tab === 'all' ? 'Tất cả' : tab === 'upcoming' ? 'Sắp tới' : tab === 'completed' ? 'Đã xong' : 'Đã hủy'}
                                    </span>
                                </div>

                                {/* Khối bọc quanh trượt (Active Indicator) */}
                                {/* Hiệu ứng "Cuộn giấy" bao quanh khi Active */}
                {isActive && (
                    <motion.div
                        layoutId="activeTabWrapper"
                        className="absolute inset-0 z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    >
                        {/* Khối nền nhô cao hơn (dùng shadow nhẹ và bo góc trên) */}
                        <div className="absolute inset-x-1 -top-2 bottom-0 bg-[#f0f9fa] rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)] border-x border-t border-gray-100/50" />
                        
                        {/* Thanh Bar đậm dưới chân - đặc trưng như hình mẫu */}
                        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#00b2bd] rounded-t-full" />
                    </motion.div>
                )}
                            </button>
                        );
                    })}
                </div>
                {bookings
                    .filter(b => filter === 'all' || b.status === filter)
                    .map((booking) => {
                        const status = getStatusStyle(booking.status);
                        return (
                            <div key={booking.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden group hover:border-[#00b2bd] transition-all">
                                <div className="p-5 flex flex-col md:flex-row gap-6">
                                    {/* Ảnh máy */}
                                    <div className="w-full md:w-32 h-32 shrink-0 bg-gray-50 rounded-sm overflow-hidden border border-gray-100">
                                        <img src={booking.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                    </div>

                                    {/* Thông tin chính */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mã: {booking.id}</span>
                                                <h3 className="font-bold text-sm uppercase text-gray-900 leading-tight mt-1">{booking.deviceName}</h3>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                                                {status.icon} {status.label}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar size={14} className="text-[#00b2bd]" />
                                                <span className="text-[12px] font-medium">{new Date(booking.startTime).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={14} className="text-[#00b2bd]" />
                                                <span className="text-[12px] font-medium">{new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-gray-600 md:col-span-2">
                                                <MapPin size={14} className="text-[#00b2bd] shrink-0 mt-0.5" />
                                                <span className="text-[12px] font-medium leading-relaxed">{booking.branchName} - {booking.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer action */}
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-[12px] font-bold text-gray-900">
                                        Phí: {booking.price > 0 ? `${booking.price} USD` : <span className="text-[#00b2bd]">MIỄN PHÍ</span>}
                                    </div>
                                    <div className="flex gap-4">
                                        {/* Chỉ hiện nút hủy nếu lịch đang là 'upcoming' */}
                                        {booking.status === 'upcoming' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="text-red-500 font-bold uppercase tracking-widest text-[11px]"
                                            >
                                                Hủy lịch
                                            </button>
                                        )}
                                        <Link
                                            href={`/client/my-bookings/${booking.id}`} // Đường dẫn tới trang chi tiết với ID động
                                            className="flex items-center gap-1 text-[11px] font-bold text-[#00b2bd] uppercase tracking-widest group cursor-pointer"
                                        >
                                            Xem chi tiết
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                {/* Empty State */}
                {bookings.length === 0 && (
                    <div className="py-20 text-center bg-white border-2 border-dashed border-gray-100">
                        <Calendar className="mx-auto w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Bạn chưa có lịch hẹn nào</p>
                        <button className="mt-4 px-8 py-3 bg-[#00b2bd] text-white text-[11px] font-bold uppercase tracking-widest">Đặt lịch ngay</button>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default MyBookings;
