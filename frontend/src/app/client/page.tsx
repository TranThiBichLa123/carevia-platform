
import Container from "@/components/common/Container";
import ProductsList from "@/components/common/products/ProductsList";
import Banner from "@/components/pages/home/Banner";
import CategoriesSection from "@/components/pages/home/CategoriesSection";
import HomeBrand from "@/components/pages/home/HomeBrand";
import BookingExperienceSection from "@/components/pages/home/BookingServiceSection";
import ComfyApparelSection from "@/components/pages/home/SkinConcernSection";
import FeaturedServicesSection from "@/components/pages/home/FeaturedServicesSection";
import { fetchData } from "@/lib/api";
import { BrandData } from "@/lib/deviceApi";

export default async function Home() {
  let brands: BrandData[] = [];
  try {
    const result = await fetchData<BrandData[]>("/api/v1/devices/brands");
    if (Array.isArray(result)) brands = result;
  } catch {
    // brands stays empty, HomeBrand will return null
  }
  return (
    <div className="bg-white min-h-screen">
      <Container className="min-h-screen flex py-3 gap-3">
        {/* py-7 = padding trên + dưới là 1.75rem (28px)
pt-X = chỉ padding trên
Tăng số (vd: py-10, pt-8) = khoảng cách lớn hơn */}
        {/* <CategoriesSection /> */}
        <div className="flex-1">
          <Banner />
          <ProductsList />
          <HomeBrand brands={brands} />

          <BookingExperienceSection />
          <ComfyApparelSection />

          <FeaturedServicesSection />
        </div>
      </Container>
    </div>
  );
}
