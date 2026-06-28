"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/common/Container';
import { motion } from 'framer-motion';
import { bookingService } from '@/services/bookings/bookingService';
import PageBreadcrumb from '@/components/common/PageBreadcrumb';

function mapBookingStatus(status: string): string {
    switch (status?.toUpperCase()) {
        case 'PENDING_CONFIRM':
        case 'PENDING':
            return 'pending';
        case 'CONFIRMED':
        case 'CHECKED_IN':
            return 'upcoming';
        case 'COMPLETED':
            return 'completed';
        case 'CANCELLED':
        case 'NO_SHOW':
        case 'EXPIRED':
            return 'cancelled';
        default:
            return 'pending';
    }
}

const MyBookings = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAll();
            const normalized = (Array.isArray(data) ? data : []).map((b: any) => ({
                id: b.id || b.bookingCode,
                bookingCode: b.bookingCode,
                deviceName: b.device?.name || b.deviceName || '',
                branchName: b.session?.branchName || b.branchName || '',
                address: b.session?.locationDetail || b.address || '',
                startTime: b.session?.startTime
                    ? (b.appointmentDate ? `${b.appointmentDate}T${b.session.startTime}` : b.session.startTime)
                    : b.startTime || b.createdAt,
                endTime: b.session?.endTime
                    ? (b.appointmentDate ? `${b.appointmentDate}T${b.session.endTime}` : b.session.endTime)
                    : b.endTime || '',
                status: mapBookingStatus(b.status),
                price: b.totalPrice || b.price || 0,
                image: b.device?.image || b.image || '',
                customerNote: b.customerNote || '',
                createdAt: b.createdAt,
            }));
            setBookings(normalized);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
            try {
                await bookingService.updateStatus(id, 'CANCELLED');
                // Refresh list from API
                await fetchBookings();
            } catch (error) {
                console.error("Failed to cancel booking:", error);
                alert("Hủy lịch thất bại. Vui lòng thử lại.");
            }
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

    if (loading) return <div className="text-center py-20 font-vietnam text-gray-300">Đang tải lịch hẹn...</div>;
    return (
        <Container className="min-h-screen bg-white font-vietnam ">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white ">
                {/* Breadcrumb - Hiển thị đúng chữ TRANG CHỦ thay vì Icon */}
                <div className='py-4'>
                    <PageBreadcrumb
                        items={[
                            // { label: "Dịch vụ", href: "/client/services" },
                        ]}
                        currentPage="Lịch hẹn của tôi"
                    />
                </div>


                {/* tab phân loại */}
                <div className="flex flex-wrap border-b border-gray-200">
                    {[
                        { key: 'all', label: 'Tất cả', icon: Calendar },
                        { key: 'upcoming', label: 'Sắp tới', icon: Clock },
                        { key: 'completed', label: 'Đã hoàn thành', icon: CheckCircle2 },
                        { key: 'cancelled', label: 'Đã hủy', icon: XCircle },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = filter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all ${isActive
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="font-vietnam">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Booking List */}
            <div className="mt-4 space-y-4">
                {/* Kiểm tra mảng đã lọc */}
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                        const status = getStatusStyle(booking.status);
                        return (
                            <div key={booking.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden group hover:border-primary transition-all">
                                {/* ... Giữ nguyên nội dung bên trong card như cũ ... */}
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
                                                <Calendar size={14} className="text-primary" />
                                                <span className="text-[12px] font-medium">{new Date(booking.startTime).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={14} className="text-primary" />
                                                <span className="text-[12px] font-medium">{new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-gray-600 md:col-span-2">
                                                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                                                <span className="text-[12px] font-medium leading-relaxed">{booking.branchName} - {booking.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Footer action */}
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-[12px] font-bold text-gray-900">
                                        Phí: {booking.price > 0 ? (
                                            <span>
                                                {Number(booking.price).toLocaleString('vi-VN')}
                                                <span className="text-[10px] ml-0.5 font-medium underline">đ</span>
                                            </span>
                                        ) : (
                                            <span className="text-primary">MIỄN PHÍ</span>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        {booking.status === 'upcoming' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="text-red-500 font-bold uppercase tracking-widest text-[11px]"
                                            >
                                                Hủy lịch
                                            </button>
                                        )}
                                        <Link
                                            href={`/client/my-bookings/${booking.id}`}
                                            className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-widest group cursor-pointer"
                                        >
                                            Xem chi tiết
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* Empty State tùy chỉnh theo filter */
                    <div className="py-20 text-center bg-white border-2 border-dashed border-gray-100">
                        <Calendar className="mx-auto w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                            {filter === 'all' && "Bạn chưa có lịch hẹn nào"}
                            {filter === 'upcoming' && "Bạn không có lịch hẹn sắp tới nào"}
                            {filter === 'completed' && "Bạn chưa có lịch hẹn nào đã hoàn thành"}
                            {filter === 'cancelled' && "Bạn không có lịch hẹn nào đã hủy"}
                        </p>
                        {filter === 'all' && (
                            <Link href="/client/booking" passHref>
                                <button className="mt-4 px-8 py-3 bg-primary text-white text-[11px] font-bold uppercase tracking-widest active:scale-95 rounded-lg transition-transform">
                                    Đặt lịch ngay
                                </button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Container>
    );
};

export default MyBookings;
