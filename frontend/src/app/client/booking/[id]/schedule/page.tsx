"use client";
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import { getAvailableSessionsByProductId } from '@/lib/booking';
import { Product } from '@/types_enum/devices';
import { ExperienceSession } from '@/types_enum/booking';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '@/components/common/Container';
import { bookingService } from '@/services/bookings/bookingService';
import { deviceApi } from '@/lib/deviceApi';
import { mapDeviceToProduct, mapApiSession } from '@/lib/mappers';
import { useUserStore } from '@/lib/store';
import { toast } from 'sonner';
import PageBreadcrumb from '@/components/common/PageBreadcrumb';
import { Loader2 } from 'lucide-react';

const BookingSchedulePage = () => {
    const params = useParams();
    const deviceId = params.id as string;
    const router = useRouter();
    const { isAuthenticated } = useUserStore();

    // 1 = booking form, 2 = confirmation
    const [step, setStep] = useState(1);
    const [device, setDevice] = useState<Product | null>(null);
    const [loadingDevice, setLoadingDevice] = useState(true);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSession, setSelectedSession] = useState<ExperienceSession | null>(null);
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

    const [apiSessions, setApiSessions] = useState<ExperienceSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch device
    useEffect(() => {
        const fetchDevice = async () => {
            setLoadingDevice(true);
            try {
                const data = await deviceApi.getById(deviceId);
                setDevice(mapDeviceToProduct(data));
            } catch (error) {
                console.error("Failed to fetch device:", error);
            } finally {
                setLoadingDevice(false);
            }
        };
        if (deviceId) fetchDevice();
    }, [deviceId]);

    // Fetch available sessions
    const fetchSessions = useCallback(async (id: string) => {
        setLoadingSessions(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const sessions = await bookingService.getAvailableSessions(Number(id), today);
            const mapped = Array.isArray(sessions) ? sessions.map(mapApiSession) : [];
            setApiSessions(mapped);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            setApiSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    }, []);

    useEffect(() => {
        if (deviceId) fetchSessions(deviceId);
    }, [deviceId, fetchSessions]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const availableBranches = useMemo(() => {
        if (!device) return [];
        const branches = apiSessions
            .filter(s => s.serviceId === device.id)
            .map(s => s.branchName);
        return Array.from(new Set(branches));
    }, [device, apiSessions]);

    const availableDates = useMemo(() => {
        if (!device) return [];
        const deviceSessions = apiSessions.filter(s => s.serviceId === device.id);
        const dates = deviceSessions.map(s => s.startTime.split('T')[0]);
        return Array.from(new Set(dates)).sort();
    }, [device, apiSessions]);

    useEffect(() => {
        if (availableDates.length > 0) {
            setSelectedDate(availableDates[0]);
        } else {
            setSelectedDate('');
        }
        setSelectedSession(null);
    }, [availableDates]);

    const availableSessions = useMemo(() => {
        if (!device || !selectedDate) return [];
        return getAvailableSessionsByProductId(apiSessions, device.id, selectedDate);
    }, [device, selectedDate, apiSessions]);

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
            hour12: false,
        });
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
        return phoneRegex.test(phone);
    };

    const validateName = (name: string) => {
        return name.trim().length >= 2 && !/[0-9]/.test(name);
    };

    const handleCompleteBooking = async () => {
        if (submitting) return;

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đặt lịch');
            router.push('/auth/signin');
            return;
        }

        if (!device || !selectedSession?.id) {
            toast.error('Vui lòng chọn sản phẩm và khung giờ hợp lệ');
            return;
        }

        setSubmitting(true);
        try {
            await bookingService.create({
                sessionId: Number(selectedSession.id),
                deviceId: Number(device.id),
                customerNote: `Khách: ${customerName}, SĐT: ${customerPhone}`,
            });
            window.location.href = '/client/my-bookings';
        } catch (error) {
            console.error("Booking failed:", error);
            toast.error('Đặt lịch thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingDevice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-vietnam">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-sm text-gray-400 tracking-wide">Đang tải...</span>
            </div>
        );
    }

    // actualStep for the visual indicator: step 1 here = step 2 overall, step 2 here = step 3 overall
    const visualStep = step + 1;

    return (
        <Container className="bg-white text-gray-900 pb-10 py-3 font-vietnam">
            <PageBreadcrumb
                items={[
                    { label: "Đặt lịch trải nghiệm", href: "/client/booking" },
                    { label: "Chi tiết đặt lịch", href: `/client/booking/${deviceId}` },
                ]}
                currentPage="Thông tin đặt lịch"
            />

            <main className="flex-1 bg-white">
                {/* Step indicator */}
                <div className="flex justify-center gap-8 mb-3 border-b border-gray-100">
                    {['Chọn thiết bị trải nghiệm', 'Thông tin đặt lịch', 'Xác nhận'].map((label, i) => (
                        <div key={i} className={`flex items-center gap-2 transition-all ${visualStep >= i + 1 ? 'opacity-100' : 'opacity-40'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-vietnam ${visualStep === i + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {i + 1}
                            </span>
                            <span className={`uppercase text-[10px] tracking-widest font-vietnam ${visualStep === i + 1 ? 'text-black' : 'text-gray-400'}`}>
                                {label}
                            </span>
                            {i < 2 && <div className="w-8 h-px bg-gray-200 ml-4 hidden md:block" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Booking form */}
                {step === 1 && (
                    <div className="bg-[#f0f2f5] p-2 space-y-4 animate-in fade-in duration-500">

                        <div className="bg-white p-6 shadow-sm">
                            <h4 className="text-sm font-vietnam font-bold mb-4 text-gray-800">Thông Tin Đặt Hẹn <span className="text-red-500">*</span></h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="tel"
                                    placeholder="Số điện thoại (10 số)"
                                    className={`w-full p-3 border outline-none text-sm font-vietnam transition-all ${customerPhone && !validatePhone(customerPhone)
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 focus:border-primary'
                                        }`}
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                                />
                                {customerPhone && !validatePhone(customerPhone) && (
                                    <p className="text-[10px] text-red-500 font-vietnam font-bold uppercase italic">Số điện thoại không hợp lệ</p>
                                )}
                                <input
                                    type="text"
                                    placeholder="Họ và tên"
                                    className={`w-full p-3 border outline-none text-sm font-vietnam transition-all ${customerName && !validateName(customerName)
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 focus:border-primary'
                                        }`}
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                {customerName && !validateName(customerName) && (
                                    <p className="text-[10px] text-red-500 font-vietnam font-bold uppercase italic">Tên không được chứa số hoặc quá ngắn</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow-sm">
                            <h4 className="text-sm font-vietnam font-bold mb-4 text-gray-800">Chọn Chi Nhánh <span className="text-red-500">*</span></h4>
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
                                            <p className="text-[11px] font-vietnam font-bold uppercase">{branch}</p>
                                            <div className={`w-4 h-4 mx-auto mt-2 rounded-full border-2 flex items-center justify-center ${selectedBranch === branch ? 'border-orange-500' : 'border-gray-300'}`}>
                                                {selectedBranch === branch && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow-sm">
                            <h4 className="text-sm font-vietnam font-bold mb-4 text-gray-800">Dịch vụ bạn muốn làm <span className="text-red-500">*</span></h4>
                            <div className="w-full p-3 bg-gray-50 border border-gray-100 text-sm font-vietnam font-medium text-gray-600">
                                {device?.name} (1 Buổi)
                            </div>
                        </div>

                        <div className="bg-white shadow-sm overflow-hidden">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h4 className="text-sm font-vietnam font-bold">Chọn Ngày Giờ <span className="text-red-500">*</span></h4>
                                <div className="flex gap-4 text-[9px] font-vietnam font-bold text-gray-400 uppercase">
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
                                        <span className="text-[10px] uppercase font-vietnam font-bold">{getDayName(dateStr)}</span>
                                        <span className="text-xs font-vietnam font-black">{new Date(dateStr).getDate()}/{new Date(dateStr).getMonth() + 1}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="p-4">
                                {loadingSessions ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="animate-spin text-primary" size={24} />
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 mt-8">
                            <button
                                onClick={() => router.push(`/client/booking/${deviceId}`)}
                                className="order-2 sm:order-1 flex items-center gap-2 text-[11px] font-vietnam font-bold text-gray-400 uppercase tracking-[0.15em] hover:text-black transition-colors group"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Quay lại chọn thiết bị
                            </button>

                            <button
                                disabled={!customerPhone || !selectedBranch || !selectedSession}
                                onClick={() => setStep(2)}
                                className="order-1 sm:order-2 w-full sm:w-auto min-w-60 px-10 py-4 bg-primary text-white text-[11px] font-vietnam font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                            >
                                Tiếp tục xác nhận
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Confirmation */}
                {step === 2 && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-sm font-vietnam font-bold uppercase tracking-widest text-gray-700">Xác nhận thông tin đặt lịch</h2>
                            </div>

                            <div className="p-6 md:p-10">
                                <div className="grid md:grid-cols-3 gap-10">
                                    <div className="md:col-span-1">
                                        <div className="aspect-square bg-gray-100 border border-gray-100 mb-4">
                                            <img
                                                src={device?.image}
                                                alt={device?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="font-bold text-sm uppercase leading-tight">{device?.name}</h3>
                                        <p className="text-[11px] text-gray-500 mt-2 italic leading-relaxed">
                                            {device?.description}
                                        </p>
                                    </div>

                                    <div className="md:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Chi nhánh thực hiện</p>
                                                <p className="text-sm font-vietnam font-bold text-black flex items-center gap-1">
                                                    <MapPin size={14} className="text-red-500" /> {selectedSession?.branchName}
                                                </p>
                                                <p className="text-[11px] font-vietnam text-gray-500 mt-1">{selectedSession?.locationDetail}</p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-vietnam uppercase font-bold text-gray-400 mb-1">Thời gian hẹn</p>
                                                <p className="text-sm font-vietnam font-bold text-black flex items-center gap-1">
                                                    <Calendar size={14} /> {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : ''}
                                                </p>
                                                <p className="text-sm font-vietnam font-black text-red-600 mt-1">
                                                    {formatSessionTime(selectedSession?.startTime)} - {formatSessionTime(selectedSession?.endTime)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-dashed border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-vietnam text-gray-600">Phí trải nghiệm dịch vụ:</span>
                                                <span className="text-lg font-vietnam font-black text-black">
                                                    {device && device.bookingPrice > 0
                                                        ? `${Number(device.bookingPrice).toLocaleString('vi-VN')} đ`
                                                        : 'MIỄN PHÍ'}
                                                </span>
                                            </div>

                                            <p className="text-[10px] font-vietnam text-gray-400 italic font-medium">
                                                * Lưu ý: Quý khách vui lòng đến trước 10 phút để được hỗ trợ tốt nhất. Lịch hẹn sẽ tự động hủy nếu quý khách đến trễ quá 15 phút.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 border border-black py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                            >
                                                Thay đổi lịch
                                            </button>
                                            <button
                                                onClick={handleCompleteBooking}
                                                disabled={submitting}
                                                className="flex-2 bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-shadow shadow-lg shadow-black/10 disabled:opacity-50"
                                            >
                                                {submitting ? 'Đang xử lý...' : 'Xác nhận hoàn tất'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center gap-10 opacity-50">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={14} /> <span className="text-[9px] font-vietnam font-bold uppercase tracking-tighter">Công nghệ chính hãng</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={14} /> <span className="text-[9px] font-vietnam font-bold uppercase tracking-tighter">Đội ngũ chuyên nghiệp</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </Container>
    );
};

export default BookingSchedulePage;
