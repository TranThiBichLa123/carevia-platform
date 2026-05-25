"use client";

import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import authApi from "@/lib/authApi";
import { deviceApi } from "@/lib/deviceApi";
import {
  createUpdatedPreferences,
  DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES,
  DEVICE_RECOMMENDATION_CRITERIA,
  getWeightOption,
  loadDeviceRecommendationPreferences,
  saveDeviceRecommendationPreferences,
} from "@/lib/recommendationPreferencesShared";
import { useIsHydrated } from "@/hooks/useHydration";
import { useUserStore } from "@/lib/store";
import { CheckCircle2, SlidersHorizontal, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const title = "Sản phẩm phù hợp nhất";

export default function DeviceRecommendationConfiguratorPage() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const authUser = useUserStore((state) => state.authUser);
  const refreshProfile = useUserStore((state) => state.refreshProfile);

  const [availableSkinTypes, setAvailableSkinTypes] = useState<string[]>([]);
  const [selectedSkinType, setSelectedSkinType] = useState("");
  const [criteriaWeights, setCriteriaWeights] = useState(
    DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES.criteriaWeights
  );
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  const profileSkinType = authUser?.skin_type?.trim() || "";
  const hydratedProfileSkinType = isHydrated ? profileSkinType : "";
  const effectiveSkinType = isHydrated ? (selectedSkinType || hydratedProfileSkinType) : "";

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    queueMicrotask(() => {
      const preferences = loadDeviceRecommendationPreferences();
      setCriteriaWeights(preferences.criteriaWeights);
      setSelectedSkinType(preferences.skinType || profileSkinType);
    });
  }, [isHydrated, profileSkinType]);

  useEffect(() => {
    deviceApi.getSkinTypes()
      .then((data) => setAvailableSkinTypes(data))
      .catch(() => setAvailableSkinTypes([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedWeightSummary = useMemo(
    () => DEVICE_RECOMMENDATION_CRITERIA
      .filter((criterion) => criteriaWeights[criterion.key] >= 5)
      .map((criterion) => criterion.title),
    [criteriaWeights]
  );

  const handleApply = async () => {
    if (!selectedSkinType.trim()) {
      if (!hydratedProfileSkinType.trim()) {
        setError("Hãy chọn loại da trước khi áp dụng gợi ý.");
        return;
      }

      setSelectedSkinType(hydratedProfileSkinType);
    }

    const nextSkinType = (selectedSkinType || hydratedProfileSkinType).trim();
    if (!nextSkinType) {
      setError("Hãy chọn loại da trước khi áp dụng gợi ý.");
      return;
    }

    setApplying(true);
    setError("");

    const preferences = createUpdatedPreferences({
      skinType: nextSkinType,
      criteriaWeights,
    });
    saveDeviceRecommendationPreferences(preferences);

    if (authUser && !hydratedProfileSkinType) {
      const response = await authApi.put("/accounts/me", { skinType: nextSkinType });
      if (!response.success) {
        setApplying(false);
        setError(response.error?.message || "Không thể lưu loại da vào hồ sơ.");
        return;
      }
      await refreshProfile();
    }

    const searchParams = new URLSearchParams({
      categoryName: title,
      sortBy: "best_match",
      skinType: nextSkinType,
      skinTypeName: nextSkinType,
    });
    router.push(`/client/devices?${searchParams.toString()}`);
  };

  return (
    <Container className="min-h-screen bg-white py-4 font-vietnam">
      <div className="mb-4">
        <PageBreadcrumb
          items={[{ label: "Tất cả sản phẩm", href: "/client/devices" }]}
          currentPage={title}
        />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)] shadow-[0_24px_90px_rgba(14,165,233,0.12)]">
        <div className="border-b border-sky-100 px-6 py-8 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                <Sparkles size={14} /> Fuzzy TOPSIS tuỳ chỉnh
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 md:text-4xl">
                Cấu hình bộ lọc thông minh cho riêng bạn
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
                Chọn loại da và kéo mức ưu tiên cho từng tiêu chí. Sau khi áp dụng, danh sách “Sản phẩm phù hợp nhất” và khối gợi ý trong trang chi tiết thiết bị sẽ dùng đúng bộ tiêu chí này.
              </p>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white/90 p-4 text-sm shadow-sm md:w-[320px]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Trạng thái hồ sơ</p>
              <div className="mt-3 space-y-2 text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Loại da đang dùng</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                    {effectiveSkinType || "Chưa chọn"}
                  </span>
                </div>
                <p className="text-xs leading-5 text-slate-500">
                  {hydratedProfileSkinType
                    ? "Hồ sơ client đã có loại da. Bộ lọc này sẽ dùng giá trị đó làm mặc định."
                    : "Nếu tài khoản của bạn chưa có loại da, hệ thống sẽ lưu lựa chọn này vào hồ sơ khi bạn bấm áp dụng."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 md:px-10 xl:grid-cols-[1.1fr,1.4fr]">
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">1. Khảo sát người dùng</p>
              <h2 className="text-2xl font-black uppercase text-slate-900">Loại da của bạn</h2>
              <p className="text-sm leading-6 text-slate-600">
                Hệ thống sẽ cộng điểm tương thích cho các thiết bị có mô tả loại da phù hợp với lựa chọn này.
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Đang tải danh sách loại da...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {availableSkinTypes.map((skinType) => {
                  const active = selectedSkinType === skinType;
                  return (
                    <button
                      key={skinType}
                      type="button"
                      onClick={() => setSelectedSkinType(skinType)}
                      className={`rounded-2xl border px-4 py-4 text-left transition-all ${active
                        ? "border-sky-500 bg-sky-50 shadow-[0_12px_30px_rgba(14,165,233,0.15)]"
                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black uppercase tracking-wide text-slate-900">{skinType}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">Dùng để lọc mức tương thích trong gợi ý sản phẩm.</p>
                        </div>
                        {active && <CheckCircle2 className="mt-0.5 text-sky-600" size={18} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                <SlidersHorizontal size={14} /> 2. Trọng số tiêu chí
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900">Bạn ưu tiên điều gì nhất?</h2>
              <p className="text-sm leading-6 text-slate-600">
                Mỗi thanh trượt tương ứng với một trọng số mờ. Mức càng cao thì tiêu chí đó càng được thuật toán ưu tiên khi tính closeness coefficient.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {DEVICE_RECOMMENDATION_CRITERIA.map((criterion) => {
                const level = criteriaWeights[criterion.key];
                const option = getWeightOption(level);

                return (
                  <div key={criterion.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wide text-slate-900">{criterion.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{criterion.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700 shadow-sm">
                        {option.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <input
                        type="range"
                        min={1}
                        max={6}
                        step={1}
                        value={level}
                        onChange={(event) => setCriteriaWeights((current) => ({
                          ...current,
                          [criterion.key]: Number(event.target.value),
                        }))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-linear-to-r from-slate-200 via-sky-100 to-sky-500"
                      />
                      <div className="flex justify-between text-[11px] font-medium text-slate-400">
                        <span>Thấp</span>
                        <span>Vừa</span>
                        <span>Cao</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="border-t border-sky-100 bg-slate-950 px-6 py-6 text-white md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Bộ tiêu chí nổi bật</p>
              <p className="text-sm text-slate-200">
                {selectedWeightSummary.length
                  ? selectedWeightSummary.join(" · ")
                  : "Đang dùng bộ tiêu chí mặc định của hệ thống."}
              </p>
              {error && <p className="text-sm text-rose-300">{error}</p>}
            </div>

            <button
              type="button"
              onClick={() => void handleApply()}
              disabled={applying || loading}
              className="rounded-2xl bg-sky-500 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_36px_rgba(14,165,233,0.28)] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applying ? "Đang áp dụng..." : "Áp dụng & tìm sản phẩm tối ưu nhất"}
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}