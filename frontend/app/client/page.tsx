
import Container from "@/components/common/Container";
import ProductsList from "@/components/common/products/ProductsList";
import Banner from "@/components/pages/home/Banner";
import CategoriesSection from "@/components/pages/home/CategoriesSection";
import HomeBrand from "@/components/pages/home/HomeBrand";
import BabyTravelSection from "@/components/pages/home/BabyTravelSection";
import ComfyApparelSection from "@/components/pages/home/ComfyApparelSection";
import FeaturedServicesSection from "@/components/pages/home/FeaturedServicesSection";
import { fetchData } from "@/lib/api";
import { Brand } from "@/type";

export default async function Home() {
  // const brands = await fetchData<Brand[]>("/brands");
  // Mock data for brands
  const brands = [
    { _id: "1", name: "Test Brand 1", image: "/logo1.png" },
    { _id: "2", name: "Demo Brand 2", image: "/logo2.png" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Container className="min-h-screen flex py-3 gap-3">
        {/* py-7 = padding trên + dưới là 1.75rem (28px)
pt-X = chỉ padding trên
Tăng số (vd: py-10, pt-8) = khoảng cách lớn hơn */}
        <CategoriesSection />
        <div className="flex-1">
          <Banner />
          <ProductsList />
          <HomeBrand brands={brands} />

          <BabyTravelSection />
          <ComfyApparelSection />

          <FeaturedServicesSection />
        </div>
      </Container>
    </div>
  );
}
