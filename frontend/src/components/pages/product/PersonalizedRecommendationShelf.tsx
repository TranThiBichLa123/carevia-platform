"use client";

import ProductCard from "@/components/common/products/ProductCard";
import { deviceApi, DeviceData } from "@/lib/deviceApi";
import {
  DEVICE_RECOMMENDATION_REVIEW_EVENT,
  createUpdatedPreferences,
  loadDeviceRecommendationPreferences,
  rankDevicesByPreferences,
} from "@/lib/recommendationPreferences";
import { useUserStore } from "@/lib/store";
import { Product } from "@/types_enum/devices";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { mapDeviceToProduct } from "@/lib/mappers";

type DisplayProduct = Product & {
  fuzzyRank?: number;
  closenessCoefficient?: number;
  isBest?: boolean;
};

type PersonalizedRecommendationShelfProps = {
  currentDeviceId: string;
  currentDeviceName: string;
};

function matchesSelectedSkinType(deviceSkinType: string | undefined, selectedSkinType: string) {
  const normalizedSelectedSkinType = selectedSkinType.trim().toLowerCase();
  if (!normalizedSelectedSkinType) {
    return true;
  }

  const normalizedDeviceSkinType = deviceSkinType?.trim().toLowerCase();
  if (!normalizedDeviceSkinType) {
    return false;
  }

  return normalizedDeviceSkinType.includes(normalizedSelectedSkinType)
    || normalizedSelectedSkinType.includes(normalizedDeviceSkinType);
}

export default function PersonalizedRecommendationShelf({
  currentDeviceId,
  currentDeviceName,
}: PersonalizedRecommendationShelfProps) {
  const authUser = useUserStore((state) => state.authUser);
  const [loading, setLoading] = useState(true);
  const [selectedSkinType, setSelectedSkinType] = useState("");
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setLoading(true);

      let candidateDevices: DeviceData[] = [];
      try {
        const similarData = await deviceApi.getSimilar(currentDeviceId, 8);
        candidateDevices = similarData.filter((device) => String(device.id) !== String(currentDeviceId));
      } catch {
        candidateDevices = [];
      }

      if (candidateDevices.length < 2) {
        try {
          const popularData = await deviceApi.getPopular(8);
          const existingIds = new Set(candidateDevices.map((device) => String(device.id)));
          for (const device of popularData) {
            const deviceId = String(device.id);
            if (deviceId !== String(currentDeviceId) && !existingIds.has(deviceId)) {
              candidateDevices.push(device);
            }
          }
        } catch {
          // ignore fallback errors
        }
      }

      const storedPreferences = loadDeviceRecommendationPreferences();
      const mergedPreferences = createUpdatedPreferences({
        skinType: storedPreferences.skinType || authUser?.skin_type || "",
      });

      const filteredCandidateDevices = mergedPreferences.skinType
        ? candidateDevices.filter((device) => matchesSelectedSkinType(device.skinType, mergedPreferences.skinType))
        : candidateDevices;

      candidateDevices = filteredCandidateDevices.slice(0, 6);

      const { rankedDevices, rankings } = await rankDevicesByPreferences(
        candidateDevices,
        mergedPreferences,
        `Gợi ý sản phẩm cho ${currentDeviceName}`
      );

      if (!active) {
        return;
      }

      const rankingMap = new Map(rankings.map((ranking) => [ranking.deviceId, ranking]));
      setSelectedSkinType(mergedPreferences.skinType);
      setDisplayProducts(
        rankedDevices.map((device) => {
          const ranking = rankingMap.get(String(device.id));
          return {
            ...mapDeviceToProduct(device),
            fuzzyRank: ranking?.rank,
            closenessCoefficient: ranking?.closenessCoefficient,
            isBest: ranking?.recommended,
          };
        })
      );
      setLoading(false);
    };

    void loadRecommendations();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "carevia.deviceRecommendationPreferences") {
        void loadRecommendations();
      }
    };

    const handleReviewUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ deviceId?: string | null }>).detail;
      if (!detail?.deviceId || detail.deviceId === String(currentDeviceId)) {
        void loadRecommendations();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(DEVICE_RECOMMENDATION_REVIEW_EVENT, handleReviewUpdated as EventListener);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DEVICE_RECOMMENDATION_REVIEW_EVENT, handleReviewUpdated as EventListener);
    };
  }, [authUser?.skin_type, currentDeviceId, currentDeviceName]);

  if (!loading && displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto mt-10">
      <div className="mb-6 flex items-center justify-between px-2">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
            <span className="h-7 w-1.5 rounded-full bg-primary"></span>
            GỢI Ý DÀNH CHO BẠN
          </h2>
          <div className="ml-4 mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Fuzzy TOPSIS
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedSkinType
                ? `Đang cá nhân hoá theo loại da ${selectedSkinType.toLowerCase()}, bộ tiêu chí bạn đã chọn và tín hiệu từ review thực tế.`
                : "Đang dùng bộ tiêu chí mặc định của hệ thống và tín hiệu từ review thực tế."}
            </span>
          </div>
        </div>
        <a href="/client/recommendations/devices" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Tùy chỉnh <ChevronRight size={16} />
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayProducts.map((item) => (
            <div key={item.id} className="relative h-full">
              {item.fuzzyRank === 1 && (
                <div className="absolute left-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                  ⭐ #1
                </div>
              )}
              {item.fuzzyRank === 2 && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-slate-400 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                  #2
                </div>
              )}
              {item.fuzzyRank === 3 && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                  #3
                </div>
              )}
              {item.closenessCoefficient != null && item.closenessCoefficient > 0 && (
                <div className="absolute bottom-2 right-2 z-10 rounded-full bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium text-white shadow">
                  CC {(item.closenessCoefficient * 100).toFixed(0)}%
                </div>
              )}
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}