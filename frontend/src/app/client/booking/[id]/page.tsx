"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ChevronLeft, ShieldCheck, Zap, Sparkles, 
  Clock, MapPin, CheckCircle2, MessageSquare 
} from "lucide-react";
import { deviceApi } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";
import { Product } from "@/types_enum/devices";

const ServiceDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [device, setDevice] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const data = await deviceApi.getById(id);
        setDevice(mapDeviceToProduct(data));
      } catch (error) {
        console.error("Failed to fetch device:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">Đang tải...</div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 font-bold text-sm uppercase">Không tìm thấy dịch vụ</p>
        <Link href="/client/booking" className="text-primary underline text-sm">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. Nút Quay Lại & Breadcrumb */}
      <div className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/client/booking" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
            <Link href="/" className="hover:text-black">Trang chủ</Link>
            <span>/</span>
            <Link href="/client/booking" className="hover:text-black">Đặt lịch</Link>
            <span>/</span>
            <span className="text-black truncate max-w-[150px]">{device.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* 2. CỘT TRÁI: HÌNH ẢNH */}
          <div className="space-y-4">
            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <Image 
                src={device.image} 
                fill 
                className="object-cover" 
                alt={device.name} 
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                <ShieldCheck size={12} className="text-[#00b2bd]" />
                Công nghệ chính hãng
              </div>
            </div>
            
            {/* Cam kết dưới ảnh */}
            <div className="grid grid-cols-3 gap-4">
               {[
                 { icon: <Zap size={16}/>, label: "Hiệu quả nhanh" },
                 { icon: <CheckCircle2 size={16}/>, label: "An toàn tuyệt đối" },
                 { icon: <MessageSquare size={16}/>, label: "Tư vấn 1:1" }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl text-center">
                    <div className="text-[#00b2bd] mb-1">{item.icon}</div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-gray-500">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* 3. CỘT PHẢI: THÔNG TIN DỊCH VỤ */}
          <div className="flex flex-col">
            <div className="mb-6">
                <span className="text-[11px] font-black text-[#00b2bd] uppercase tracking-[0.2em]">
                    {device.category?.name || ''} • {device.brand?.name || ''}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase mt-2 leading-tight">
                    {device.name}
                </h1>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Giá đặt lịch trải nghiệm</span>
                        <span className="text-2xl font-black text-[#00b2bd]">
                            {device.bookingPrice > 0 ? `${device.bookingPrice} USD` : "MIỄN PHÍ"}
                        </span>
                    </div>
                    <div className="h-10 w-[1px] bg-gray-200"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Xuất xứ</span>
                        <span className="text-sm font-bold uppercase">{device.origin || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Mô tả ngắn */}
                <div className="p-4 bg-[#e6f4f1]/50 border-l-4 border-[#00b2bd] rounded-r-xl">
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{device.description}"
                    </p>
                </div>

                {/* Thông số kỹ thuật */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles size={14} className="text-[#00b2bd]" /> Thông số công nghệ
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {device.specifications.map((spec, i) => (
                            <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-[11px] text-gray-400 uppercase font-medium">{spec.label}</span>
                                <span className="text-[11px] text-gray-900 font-bold">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nút Call to Action chính */}
                <div className="pt-6">
                    <Link 
                        href={`/client/booking?deviceId=${device.id}`}
                        className="w-full bg-black text-white py-5 rounded-sm text-[13px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#00b2bd] transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                    >
                        Đặt lịch trải nghiệm ngay
                    </Link>
                    <p className="text-[10px] text-center text-gray-400 mt-4 uppercase font-bold tracking-widest">
                        * Hoàn toàn không mất phí tư vấn ban đầu
                    </p>
                </div>
            </div>
          </div>
        </div>

        {/* 4. PHẦN CHI TIẾT NỘI DUNG (DƯỚI) */}
        <div className="mt-20 max-w-3xl mx-auto">
            <div className="flex justify-center border-b border-gray-100 mb-10">
                <button className="px-8 py-4 border-b-2 border-[#00b2bd] text-xs font-black uppercase tracking-widest">
                    Chi tiết công nghệ
                </button>
            </div>
            
            <article 
                className="prose prose-sm max-w-none prose-headings:uppercase prose-headings:font-black prose-p:leading-relaxed text-gray-600"
                dangerouslySetInnerHTML={{ __html: device.content }}
            />

            {/* Lưu ý thêm */}
            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Clock size={14} /> Quy trình trải nghiệm
                </h4>
                <div className="space-y-4 text-xs font-medium text-gray-500">
                    <div className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center shrink-0 font-bold">1</span>
                        <p>Thăm khám và soi da kỹ thuật số để xác định tình trạng hiện tại.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center shrink-0 font-bold">2</span>
                        <p>Trải nghiệm trực tiếp thiết bị dưới sự giám sát của kỹ thuật viên chuyên nghiệp.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center shrink-0 font-bold">3</span>
                        <p>Nhận phác đồ chăm sóc cá nhân hóa sau khi sử dụng thiết bị.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
