"use client";
import { Product } from '@/types_enum/devices';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import BookingCard from '@/components/common/client/booking/BookingCard';
import { deviceApi } from '@/lib/deviceApi';
import { mapDeviceToProduct } from '@/lib/mappers';
import PageBreadcrumb from '@/components/common/PageBreadcrumb';

const BookingPage = () => {
    const router = useRouter();

    const [bookingDevices, setBookingDevices] = useState<Product[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(true);

    // Fetch booking-available devices from API
    useEffect(() => {
        const fetchDevices = async () => {
            setLoadingDevices(true);
            try {
                const data = await deviceApi.getAll({ size: 50 });
                const mapped = data.items
                    .map(mapDeviceToProduct)
                    .filter(p => p.isBookingAvailable);
                setBookingDevices(mapped);
            } catch (error) {
                console.error("Failed to fetch booking devices:", error);
            } finally {
                setLoadingDevices(false);
            }
        };
        fetchDevices();
    }, []);





    return (
        <Container className="bg-white text-gray-900 pb-10 py-3 font-vietnam">
            <PageBreadcrumb items={[]} currentPage="Đặt lịch trải nghiệm" />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar filter */}
                <aside className="lg:w-72 shrink-0 animate-in fade-in duration-500">
                    <div className="bg-white border border-gray-200 sticky top-24 rounded-2xl">
                        <div className="p-4 border-b border-gray-100 rounded-t-2xl flex justify-between items-center bg-gray-50">
                            <h3 className="font-vietnam font-bold text-[13px] uppercase tracking-tight">Bộ lọc tìm kiếm</h3>
                            <button className="text-[13px] text-primary underline font-bold">Xóa tất cả</button>
                        </div>

                        <div className="p-4 space-y-8">
                            <div>
                                <h4 className="font-vietnam font-bold text-[13px] mb-4 flex items-center uppercase">
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
                                                    className="peer appearance-none w-4 h-4 border border-gray-300 checked:bg-black checked:border-black transition-all mr-3 rounded-sm"
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
                                            <span className="text-[13px] font-medium text-gray-600 group-hover:text-black transition-colors">
                                                {category}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-vietnam font-bold text-[13px] mb-4">KHOẢNG GIÁ</h4>
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
                            <button className="w-full py-3 bg-primary text-white font-bold text-xs font-vietnam uppercase tracking-widest hover:bg-primary-dark rounded-lg transition-all">
                                Áp dụng bộ lọc
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Device grid */}
                <main className="flex-1 bg-white">
                    <div className="flex flex-wrap justify-between items-end mb-6 pb-4 border-b border-gray-200 gap-4">
                        <p className="text-[13px] text-gray-500 font-medium">
                            Tìm thấy <span className="text-gray-900 font-bold">{bookingDevices.length}</span> sản phẩm
                        </p>

                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-vietnam font-bold text-gray-900 uppercase tracking-tighter">Sắp xếp:</span>
                            <div className="relative group min-w-35">
                                <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-gray-300 transition-all">
                                    <span className="text-[13px] font-vietnam font-medium text-gray-700">Mới nhất</span>
                                    <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="flex flex-col whitespace-nowrap">
                                        <div className="px-3 py-2.5 text-[13px] font-vietnam text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">Giá: Thấp đến cao</div>
                                        <div className="px-3 py-2.5 text-[13px] font-vietnam text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">Giá: Cao đến thấp</div>
                                        <div className="px-3 py-2.5 text-[13px] font-vietnam text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">Bán chạy nhất</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loadingDevices ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="bg-gray-200 aspect-video" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                    </div>
                                </div>
                            ))
                        ) : bookingDevices.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                <p className="text-gray-400 text-sm uppercase tracking-widest italic font-vietnam">
                                    Không tìm thấy thiết bị phù hợp.
                                </p>
                            </div>
                        ) : (
                            bookingDevices.map((device) => (
                                <BookingCard
                                    key={device.id}
                                    device={device}
                                    onSelect={(selected) => {
                                        router.push(`/client/booking/${selected.id}/schedule`);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </Container>
    );
};

export default BookingPage;
