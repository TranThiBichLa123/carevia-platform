
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
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
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
