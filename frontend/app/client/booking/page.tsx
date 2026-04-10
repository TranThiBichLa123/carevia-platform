"use client";
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import { mockProducts, mockSessions } from '@/constants/data';
import { getAvailableSessionsByProductId } from '@/lib/booking';
import { Product } from '@/types_enum/devices';
import { ExperienceSession } from '@/types_enum/booking';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/common/Container';
import BookingCard from '@/components/common/client/booking/BookingCard';
import { bookingService } from '@/services/bookings/bookingService';

const BookingPage = () => {
    // Thêm useMemo và useEffect vào import từ 'react'
    const [step, setStep] = useState(1);
    const [selectedDevice, setSelectedDevice] = useState<Product | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSession, setSelectedSession] = useState<ExperienceSession | null>(null);

    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    // Lấy danh sách chi nhánh duy nhất từ mockSessions của thiết bị đó
    const availableBranches = useMemo(() => {
        if (!selectedDevice) return [];
        const branches = mockSessions
            .filter(s => s.serviceId === selectedDevice._id)
            .map(s => s.branchName);
        return Array.from(new Set(branches));
    }, [selectedDevice]);

    // 1. Lấy danh sách các NGÀY duy nhất thực sự có lịch (Unique Dates)
    const availableDates = useMemo(() => {
        if (!selectedDevice) return [];

        // Lọc session theo serviceId (khớp với interface của bạn)
        const deviceSessions = mockSessions.filter(s => s.serviceId === selectedDevice._id);

        // Lấy phần YYYY-MM-DD từ chuỗi ISO startTime
        const dates = deviceSessions.map(s => s.startTime.split('T')[0]);

        // Loại bỏ trùng lặp và sắp xếp ngày tăng dần
        return Array.from(new Set(dates)).sort();
    }, [selectedDevice]);

    // 2. Tự động chọn ngày đầu tiên có lịch khi đổi thiết bị
    useEffect(() => {
        if (availableDates.length > 0) {
            setSelectedDate(availableDates[0]); // Chọn ngày đầu tiên trong mảng
        } else {
            setSelectedDate('');
        }
        setSelectedSession(null);
    }, [availableDates]);

    // 3. Lấy danh sách các phiên (GIỜ) dựa trên Ngày đã chọn
    const availableSessions = useMemo(() => {
        if (!selectedDevice || !selectedDate) return [];

        // Sử dụng hàm helper, đảm bảo hàm này bên trong dùng s.serviceId để lọc
        return getAvailableSessionsByProductId(mockSessions, selectedDevice._id, selectedDate);
    }, [selectedDevice, selectedDate]);

    // --- CÁC HÀM HELPER ĐỊNH DẠNG ---

    const getDayName = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    const formatSessionTime = (isoDate?: string) => {
        if (!isoDate) return '';
        return new Date(isoDate).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Sử dụng định dạng 24h giống ảnh mẫu (09:00)
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const bookingDevices = mockProducts.filter(p => p.isBookingAvailable);

    // Thêm vào bên trong BookingPage component
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const handleCompleteBooking = async () => {
        const newBooking = {
            id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
            deviceName: selectedDevice?.name,
            branchName: selectedBranch,
            address: selectedSession?.locationDetail,
            startTime: selectedSession?.startTime,
            status: "upcoming",
            price: selectedDevice?.bookingPrice || 0,
            image: selectedDevice?.image
        };

        try {
            await bookingService.create(newBooking); // Gọi service
            alert('Đặt lịch thành công!');
            window.location.href = '/my-bookings';
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g; // Regex chuẩn SĐT Việt Nam
        return phoneRegex.test(phone);
    };

    const validateName = (name: string) => {
        return name.trim().length >= 2 && !/[0-9]/.test(name); // Tên ít nhất 2 ký tự và không chứa số
    };

    // Kiểm tra xem toàn bộ form đã hợp lệ chưa
    const isFormValid = useMemo(() => {
        return validatePhone(customerPhone) && validateName(customerName) && selectedBranch && selectedSession;
    }, [customerPhone, customerName, selectedBranch, selectedSession]);



    return (
        <Container className="bg-[#f2f2f2] font-sans text-gray-900  pb-10">
            {/* Breadcrumb - Hiển thị đúng chữ TRANG CHỦ thay vì Icon */}
            <div className="bg-white border-b border-gray-100">
                <div className="container px-4 py-3">
                    <nav className="flex items-center gap-2">
                        {/* Giữ nguyên chữ Trang Chủ */}
                        <Link
                            href="/client"
                            className="text-[11px] uppercase tracking-wider text-gray-400 hover:text-black transition-colors font-medium"
                        >
                            Trang chủ
                        </Link>

                        {/* Dấu gạch chéo mờ */}
                        <span className="text-gray-300 font-light mx-1 text-xs">/</span>

                        {/* Phần trang hiện tại: Viết hoa, Đậm, Màu đen */}
                        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-900">
                            Đặt lịch trải nghiệm
                        </span>
                    </nav>
                </div>
            </div>


            <div className="  mt-6">
                <div className=" flex flex-col lg:flex-row gap-8">
                    {step === 1 && (
                        <aside className=" lg:w-72 shrink-0 animate-in fade-in duration-500">
                            <div className="bg-white rounded-sm border border-gray-200 sticky top-24">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-sm uppercase tracking-tight">Bộ lọc tìm kiếm</h3>
                                    <button className="text-[11px] text-primary underline font-bold">Xóa tất cả</button>
                                </div>

                                <div className="p-4 space-y-8">
                                    <div>
                                        <h4 className="font-bold text-[13px] mb-4 flex justify-between items-center tracking-widest uppercase">
                                            Loại dịch vụ <span className="text-gray-400 font-light">+</span>
                                        </h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {[
                                                "Điều trị da mặt",
                                                "Nâng cơ & Trẻ hóa",
                                                "Giảm béo công nghệ cao",
                                                "Triệt lông Laser",
                                                "Trị sẹo & Sắc tố",
                                                "Thư giãn & Wellness"
                                            ].map((category) => (
                                                <label key={category} className="flex items-center group cursor-pointer">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer appearance-none w-4 h-4 border border-gray-300 checked:bg-black checked:border-black transition-all mr-3"
                                                        />
                                                        <svg
                                                            className="absolute w-2.5 h-2.5 text-white left-0.75 opacity-0 peer-checked:opacity-100 pointer-events-none"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        >
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[12px] font-medium text-gray-600 group-hover:text-black transition-colors">
                                                        {category}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-[13px] mb-4">KHOẢNG GIÁ</h4>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Dưới 200.000đ", id: "p1" },
                                                { label: "200.000đ - 500.000đ", id: "p2" },
                                                { label: "Trên 500.000đ", id: "p3" }
                                            ].map((price) => (
                                                <label key={price.id} className="flex items-center cursor-pointer group">
                                                    <input type="radio" name="price" id={price.id} className="w-4 h-4 text-primary border-gray-300 focus:ring-0" />
                                                    <span className="ml-3 text-[13px] text-gray-700 group-hover:text-primary">{price.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100">
                                    <button className="w-full py-3 bg-[#00b2bd] text-white text-xs font-black uppercase tracking-widest hover:bg-[#008e96] transition-all">
                                        Áp dụng bộ lọc
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}

                    <main className={`flex-1 ${step > 1 ? '' : ''}`}>
                        {step > 1 && (
                            <div className="flex justify-center gap-8 mb-3 border-b border-gray-100">
                                {['Chọn dịch vụ', 'Thông tin đặt lịch', 'Xác nhận'].map((label, i) => (
                                    <div key={i} className={`flex items-center gap-2 transition-all ${step >= i + 1 ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === i + 1 ? 'bg-[#00b2bd] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {i + 1}
                                        </span>
                                        <span className={`uppercase text-[10px] tracking-widest font-bold ${step === i + 1 ? 'text-black' : 'text-gray-400'}`}>
                                            {label}
                                        </span>
                                        {i < 2 && <div className="w-8 h-px bg-gray-200 ml-4 hidden md:block" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 1 && (
                            <>
                                <div className="flex flex-wrap justify-between items-end mb-6 pb-4 border-b border-gray-200 gap-4">
                                    <div>
                                        <p className="text-[13px] text-gray-500 font-medium">
                                            Tìm thấy <span className="text-gray-900 font-bold">{bookingDevices.length}</span> sản phẩm
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tighter">Sắp xếp:</span>
                                        <div className="relative">
                                            <select className="appearance-none bg-transparent border-none text-[13px] font-medium pr-8 focus:ring-0 cursor-pointer text-primary">
                                                <option>Mới nhất</option>
                                                <option>Giá: Thấp đến Cao</option>
                                                <option>Giá: Cao đến Thấp</option>
                                                <option>Bán chạy nhất</option>
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {bookingDevices.map((device) => (
                                        <BookingCard
                                            key={device._id}
                                            device={device}
                                            onSelect={(selected) => {
                                                setSelectedDevice(selected);
                                                nextStep();
                                            }}
                                        />
                                    ))}

                                    {bookingDevices.length === 0 && (
                                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                            <p className="text-gray-400 text-sm uppercase tracking-widest italic">
                                                Không tìm thấy thiết bị phù hợp.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <div className="bg-[#f0f2f5] p-2 space-y-4 animate-in fade-in duration-500">

                                <div className="bg-white p-6 shadow-sm">
                                    <h4 className="text-sm font-bold mb-4 text-gray-800">Thông Tin Đặt Hẹn <span className="text-red-500">*</span></h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="tel"
                                            placeholder="Số điện thoại (10 số)"
                                            className={`w-full p-3 border outline-none text-sm transition-all ${customerPhone && !validatePhone(customerPhone)
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 focus:border-[#00b2bd]'
                                                }`}
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))} // Chỉ cho phép nhập số
                                        />
                                        {customerPhone && !validatePhone(customerPhone) && (
                                            <p className="text-[10px] text-red-500 font-bold uppercase italic">Số điện thoại không hợp lệ</p>
                                        )}
                                        <input
                                            type="text"
                                            placeholder="Họ và tên"
                                            className={`w-full p-3 border outline-none text-sm transition-all ${customerName && !validateName(customerName)
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 focus:border-[#00b2bd]'
                                                }`}
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                        {customerName && !validateName(customerName) && (
                                            <p className="text-[10px] text-red-500 font-bold uppercase italic">Tên không được chứa số hoặc quá ngắn</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-6 shadow-sm">
                                    <h4 className="text-sm font-bold mb-4 text-gray-800">Chọn Chi Nhánh <span className="text-red-500">*</span></h4>
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                        {availableBranches.map((branch, index) => (
                                            <div
                                                key={branch}
                                                onClick={() => setSelectedBranch(branch)}
                                                className={`min-w-50 cursor-pointer group border-2 transition-all ${selectedBranch === branch ? 'border-orange-500' : 'border-transparent'}`}
                                            >
                                                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                                                    <img src={`https://picsum.photos/seed/branch-${index}/300/200`} className="w-full h-full object-cover" alt={branch} />
                                                </div>
                                                <div className="p-3 text-center bg-gray-50 group-hover:bg-white">
                                                    <p className="text-[11px] font-bold uppercase">{branch}</p>
                                                    <div className={`w-4 h-4 mx-auto mt-2 rounded-full border-2 flex items-center justify-center ${selectedBranch === branch ? 'border-orange-500' : 'border-gray-300'}`}>
                                                        {selectedBranch === branch && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 shadow-sm">
                                    <h4 className="text-sm font-bold mb-4 text-gray-800">Dịch vụ bạn muốn làm <span className="text-red-500">*</span></h4>
                                    <div className="w-full p-3 bg-gray-50 border border-gray-100 text-sm font-medium text-gray-600">
                                        {selectedDevice?.name} (1 Buổi)
                                    </div>
                                </div>

                                <div className="bg-white shadow-sm overflow-hidden">
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <h4 className="text-sm font-bold">Chọn Ngày Giờ <span className="text-red-500">*</span></h4>
                                        <div className="flex gap-4 text-[9px] font-bold text-gray-400 uppercase">
                                            <div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-100" /> Hết chỗ</div>
                                            <div className="flex items-center gap-1"><span className="w-2 h-2 bg-[#e6f4f1]" /> Còn chỗ</div>
                                            <div className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500" /> Đang chọn</div>
                                        </div>
                                    </div>

                                    <div className="flex border-b overflow-x-auto bg-gray-50">
                                        {availableDates.map((dateStr) => (
                                            <button
                                                key={dateStr}
                                                onClick={() => { setSelectedDate(dateStr); setSelectedSession(null); }}
                                                className={`flex-1 min-w-30 py-3 px-2 border-r transition-all flex flex-col items-center ${selectedDate === dateStr ? 'bg-orange-500 text-white' : 'bg-white text-gray-500'}`}
                                            >
                                                <span className="text-[10px] uppercase font-bold">{getDayName(dateStr)}</span>
                                                <span className="text-xs font-black">{new Date(dateStr).getDate()}/{new Date(dateStr).getMonth() + 1}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                                            {availableSessions.map((session) => {
                                                const isSelected = selectedSession?.id === session.id;
                                                const isFull = session.availableSlots <= 0;
                                                if (selectedBranch && session.branchName !== selectedBranch) return null;

                                                return (
                                                    <button
                                                        key={session.id}
                                                        disabled={isFull}
                                                        onClick={() => setSelectedSession(session)}
                                                        className={`py-4 text-xs font-bold transition-all ${isSelected ? 'bg-orange-500 text-white' : isFull ? 'bg-gray-100 text-gray-300' : 'bg-[#e6f4f1] text-gray-700 hover:bg-[#d5ebe7]'}`}
                                                    >
                                                        {formatSessionTime(session.startTime)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 mt-8">
                                    {/* Nút quay lại - Dạng Text link có Icon */}
                                    <button
                                        onClick={prevStep}
                                        className="order-2 sm:order-1 flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] hover:text-black transition-colors group"
                                    >
                                        <svg
                                            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Quay lại chọn thiết bị
                                    </button>

                                    {/* Nút tiếp tục - Dạng khối nổi bật */}
                                    <button
                                        disabled={!customerPhone || !selectedBranch || !selectedSession}
                                        onClick={nextStep}
                                        className="order-1 sm:order-2 w-full sm:w-auto min-w-[240px] px-10 py-4 bg-[#00b2bd] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#00b2bd]/20 hover:bg-[#008e96] disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                                    >
                                        Tiếp tục xác nhận
                                    </button>
                                </div>

                            </div>
                        )}

                        {step === 3 && (
                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">Xác nhận thông tin đặt lịch</h2>
                                        <span className="text-[10px] bg-black text-white px-2 py-1 font-bold">MÃ: #TEMP_{Math.floor(Math.random() * 1000)}</span>
                                    </div>

                                    <div className="p-6 md:p-10">
                                        <div className="grid md:grid-cols-3 gap-10">
                                            <div className="md:col-span-1">
                                                <div className="aspect-square bg-gray-100 border border-gray-100 mb-4">
                                                    <img
                                                        src={selectedDevice?.image}
                                                        alt={selectedDevice?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <h3 className="font-bold text-sm uppercase leading-tight">{selectedDevice?.name}</h3>
                                                <p className="text-[11px] text-gray-500 mt-2 italic leading-relaxed">
                                                    {selectedDevice?.description}
                                                </p>
                                            </div>

                                            <div className="md:col-span-2 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Chi nhánh thực hiện</p>
                                                        <p className="text-sm font-bold text-black flex items-center gap-1">
                                                            <MapPin size={14} className="text-red-500" /> {selectedSession?.branchName}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 mt-1">{selectedSession?.locationDetail}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Thời gian hẹn</p>
                                                        <p className="text-sm font-bold text-black flex items-center gap-1">
                                                            <Calendar size={14} /> {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : ''}
                                                        </p>
                                                        <p className="text-sm font-black text-red-600 mt-1">
                                                            {formatSessionTime(selectedSession?.startTime)} - {formatSessionTime(selectedSession?.endTime)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-dashed border-gray-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-gray-600">Phí trải nghiệm dịch vụ:</span>
                                                        <span className="text-lg font-black text-black">
                                                            {selectedDevice && selectedDevice.bookingPrice > 0 ? `${selectedDevice.bookingPrice} USD` : 'MIỄN PHÍ'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 italic font-medium">
                                                        * Lưu ý: Quý khách vui lòng đến trước 10 phút để được hỗ trợ tốt nhất. Lịch hẹn sẽ tự động hủy nếu quý khách đến trễ quá 15 phút.
                                                    </p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                                    <button
                                                        onClick={prevStep}
                                                        className="flex-1 border border-black py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                                    >
                                                        Thay đổi lịch
                                                    </button>
                                                    <button
                                                        onClick={() => alert('Đã gửi yêu cầu đặt lịch đến Carevia Clinic!')}
                                                        className="flex-2 bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-shadow shadow-lg shadow-black/10"
                                                    >
                                                        Xác nhận hoàn tất
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-center gap-10 opacity-50">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={14} /> <span className="text-[9px] font-bold uppercase tracking-tighter">Công nghệ chính hãng</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={14} /> <span className="text-[9px] font-bold uppercase tracking-tighter">Đội ngũ chuyên nghiệp</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

            </div>

        </Container>
    );
};

export default BookingPage;
