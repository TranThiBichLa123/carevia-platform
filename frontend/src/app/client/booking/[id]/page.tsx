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

interface SessionData {
  id: number;
  branchName: string;
  locationDetail: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
  pricePerSlot: number | null;
  staffId: number | null;
}

interface RankedBookingOption {
  rank: number;
  optionId: string;
  sessionId: string;
  branchName: string;
  locationDetail: string;
  startTime: string;
  endTime: string;
  closenessCoefficient: number;
  distanceToPositiveIdeal: number;
  distanceToNegativeIdeal: number;
  isBestOption: boolean;
}

interface FuzzyRecommendationResponse {
  algorithm: string;
  scenarioName: string;
  rankings: RankedBookingOption[];
}

const ServiceDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [device, setDevice] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [experienceSteps, setExperienceSteps] = useState<ExperienceStepData[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationData[]>([]);
  const [fuzzyRecommendations, setFuzzyRecommendations] = useState<FuzzyRecommendationResponse | null>(null);

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

  useEffect(() => {
    if (!device) return;
    const fetchFuzzyRecommendations = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

        // 1. Lấy danh sách buổi trải nghiệm còn trống từ API
        const sessionsRes = await fetch(`${baseUrl}/api/v1/bookings/sessions/available?deviceId=${id}`);
        if (!sessionsRes.ok) return;
        const sessions: SessionData[] = await sessionsRes.json();
        if (sessions.length < 2) return; // Fuzzy TOPSIS cần ít nhất 2 phương án

        // 2. Xây dựng tiêu chí Fuzzy TOPSIS từ dữ liệu thực
        const hasPrice = sessions.some(s => s.pricePerSlot != null && s.pricePerSlot > 0);
        const criteria: object[] = [
          { id: "availableSlots", name: "Slot còn trống", preference: "BENEFIT", weight: { linguisticTerm: "HIGH" } },
          { id: "staffAssigned",  name: "Có nhân viên phụ trách", preference: "BENEFIT", weight: { linguisticTerm: "MEDIUM_HIGH" } },
        ];
        if (hasPrice) {
          criteria.unshift({ id: "bookingPrice", name: "Giá đặt lịch", preference: "COST", weight: { linguisticTerm: "VERY_HIGH" } });
        }

        // 3. Ánh xạ từng buổi thành alternative với điểm số từ dữ liệu thực
        const alternatives = sessions.map(s => {
          const scores: Record<string, object> = {
            availableSlots: { value: s.availableSlots },
            staffAssigned:  s.staffId != null ? { linguisticTerm: "HIGH" } : { linguisticTerm: "MEDIUM_LOW" },
          };
          if (hasPrice) {
            scores.bookingPrice = { value: s.pricePerSlot != null && s.pricePerSlot > 0 ? s.pricePerSlot : 1 };
          }
          return {
            optionId: `session-${s.id}`,
            sessionId: String(s.id),
            branchName: s.branchName,
            locationDetail: s.locationDetail || "",
            startTime: `${s.sessionDate}T${s.startTime}`,
            endTime:   `${s.sessionDate}T${s.endTime}`,
            criteriaScores: scores,
          };
        });

        // 4. Gọi endpoint xếp hạng với dữ liệu thực
        const rankRes = await fetch(`${baseUrl}/api/v1/recommendations/bookings/fuzzy-topsis/rank`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioName: `Gợi ý buổi trải nghiệm cho ${device.name}`,
            serviceId: id,
            criteria,
            alternatives,
          }),
        });
        if (rankRes.ok) {
          const data: FuzzyRecommendationResponse = await rankRes.json();
          setFuzzyRecommendations(data);
        }
      } catch {
        // silent fail — recommendation is non-critical
      }
    };
    fetchFuzzyRecommendations();
  }, [device, id]);

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
      <Container className="">
        <div className="my-4">
          <PageBreadcrumb
            items={[
              { label: "Đặt lịch trải nghiệm", href: "/client/booking" },
            ]}
            currentPage={device?.name || "Thiết bị"}
          />
        </div>


        <div className="grid lg:grid-cols-2 gap-10">

          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="space-y-4">
            <div className="aspect-4/3 relative rounded-2xl overflow-hidden shadow-md">
              <Image src={device.image} fill className="object-cover" alt={device.name} />

              {/* Badge ôm sát border góc trên bên trái */}
              <div className="absolute top-0 left-0 bg-white/95 backdrop-blur px-3 py-2 rounded-br-2xl text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 border-r border-b border-gray-100/50">
                <ShieldCheck size={14} className="text-primary" />
                <span>Công nghệ chính hãng</span>
              </div>

              {/* Badge MIỄN PHÍ ôm sát border góc trên bên phải */}
              {device.bookingPrice === 0 && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-4 py-2 rounded-bl-2xl font-bold shadow-sm animate-pulse">
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

        {/* BUỔI TRẢI NGHIỆM PHÙ HỢP NHẤT — Fuzzy TOPSIS */}
        {fuzzyRecommendations && fuzzyRecommendations.rankings.length > 0 && (
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">
                Buổi trải nghiệm phù hợp nhất
              </h3>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                Fuzzy TOPSIS
              </span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-4 mb-5">
              Xếp hạng dựa trên: khoảng cách chi nhánh · giá · slot trống · chất lượng dịch vụ · độ phản hồi
            </p>
            <div className="space-y-3">
              {fuzzyRecommendations.rankings.slice(0, 3).map((option) => (
                <div
                  key={option.optionId}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    option.isBestOption
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      option.isBestOption ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    #{option.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{option.branchName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{option.locationDetail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-primary">
                      {(option.closenessCoefficient * 100).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Phù hợp</p>
                  </div>
                  {option.isBestOption && (
                    <span className="text-[10px] font-black bg-primary text-white px-2 py-1 rounded-lg shrink-0">
                      Tốt nhất
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ServiceDetailPage;

