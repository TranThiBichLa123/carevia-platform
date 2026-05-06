"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck, Zap, Sparkles,
  Clock, CheckCircle2, MessageSquare, Loader2
} from "lucide-react";
import { deviceApi, ExperienceStepData, SpecificationData } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";
import { Product } from "@/types_enum/devices";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import Container from "@/components/common/Container";

const ServiceDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [device, setDevice] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [experienceSteps, setExperienceSteps] = useState<ExperienceStepData[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationData[]>([]);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const data = await deviceApi.getById(id);
        setDevice(mapDeviceToProduct(data));
        const [steps, specs] = await Promise.all([
          deviceApi.getExperienceSteps(id),
          deviceApi.getSpecifications(id),
        ]);
        setExperienceSteps(steps);
        setSpecifications(specs);
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-vietnam">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-sm text-gray-400 tracking-wide">Đang tải...</span>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-vietnam">
        <p className="text-gray-500 font-bold text-sm uppercase">Không tìm thấy dịch vụ</p>
        <Link href="/client/booking" className="text-primary underline text-sm">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 font-vietnam">
      <Container className="py-6">
        <PageBreadcrumb
          items={[
            { label: "Đặt lịch trải nghiệm", href: "/client/booking" },
          ]}
          currentPage="Chi tiết đặt lịch"
        />

        <div className="grid lg:grid-cols-2 gap-10 mt-4">

          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="space-y-4">
            <div className="aspect-4/3 relative rounded-2xl overflow-hidden shadow-md">
              <Image
                src={device.image}
                fill
                className="object-cover"
                alt={device.name}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" />
                Công nghệ chính hãng
              </div>
              {device.bookingPrice === 0 && (
                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm animate-pulse">
                  MIỄN PHÍ
                </div>
              )}
            </div>

            {/* Cam kết */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Zap size={16} />, label: "Hiệu quả nhanh" },
                { icon: <CheckCircle2 size={16} />, label: "An toàn tuyệt đối" },
                { icon: <MessageSquare size={16} />, label: "Tư vấn 1:1" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-4 bg-white rounded-2xl text-center border border-gray-100 shadow-sm">
                  <div className="text-primary mb-2">{item.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                {device.category?.name || ""} • {device.brand?.name || ""}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase mt-2 leading-tight">
                {device.name}
              </h1>

              <div className="flex items-center gap-6 mt-5 p-4 bg-primary-light rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                    Giá đặt lịch
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {device.bookingPrice > 0
                      ? `${device.bookingPrice.toLocaleString('vi-VN')} đ`
                      : "MIỄN PHÍ"}
                  </span>
                </div>

                <div className="h-10 w-px bg-primary/20" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary/70 uppercase">Xuất xứ</span>
                  <span className="text-sm font-bold uppercase text-gray-800">{device.origin || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {/* Mô tả */}
              <div className="p-4 bg-primary-light/50 border-l-4 border-primary rounded-r-xl">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{device.description}"
                </p>
              </div>

              {/* Thông số kỹ thuật */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-gray-700">
                  <Sparkles size={14} className="text-primary" /> Thông số công nghệ
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {(specifications.length > 0 ? specifications : device.specifications).map((spec, i) => (
                    <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-[11px] text-gray-400 uppercase font-medium">{spec.label}</span>
                      <span className="text-[11px] text-gray-900 font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 mt-auto">
                <Link
                  href={`/client/booking/${device.id}/schedule`}
                  className="w-full bg-primary text-white py-4 rounded-xl text-[13px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Đặt lịch trải nghiệm ngay
                </Link>
                <p className="text-[10px] text-center text-gray-400 mt-3 uppercase font-bold tracking-widest">
                  * Hoàn toàn không mất phí tư vấn ban đầu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN CHI TIẾT NỘI DUNG */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto">
          <div className="flex justify-center border-b border-gray-100 mb-10">
            <button className="px-8 py-4 border-b-2 border-primary text-xs font-black uppercase tracking-widest text-primary">
              Chi tiết công nghệ
            </button>
          </div>

          <article
            className="prose prose-sm max-w-none prose-headings:uppercase prose-headings:font-black prose-p:leading-relaxed text-gray-600"
            dangerouslySetInnerHTML={{ __html: device.content }}
          />

          {/* Quy trình */}
          <div className="mt-12 p-6 bg-primary-light/40 rounded-2xl border border-primary/10">
            <h4 className="text-xs font-black uppercase mb-5 tracking-widest flex items-center gap-2 text-primary">
              <Clock size={14} /> Quy trình trải nghiệm
            </h4>
            <div className="space-y-4 text-xs font-medium text-gray-600">
              {experienceSteps.length > 0 ? (
                experienceSteps.map((step) => (
                  <div key={step.id} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 mb-0.5">{step.stepTitle}</p>
                      <p className="leading-relaxed">{step.stepContent}</p>
                      {step.durationMinutes && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-primary font-semibold">
                          <Clock size={10} /> {step.durationMinutes} phút
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                [
                  "Thăm khám và soi da kỹ thuật số để xác định tình trạng hiện tại.",
                  "Trải nghiệm trực tiếp thiết bị dưới sự giám sát của kỹ thuật viên chuyên nghiệp.",
                  "Nhận phác đồ chăm sóc cá nhân hóa sau khi sử dụng thiết bị.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ServiceDetailPage;

