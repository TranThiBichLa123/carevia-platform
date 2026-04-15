
import Container from "@/components/common/Container";
import ProductsList from "@/components/common/products/ProductsList";
import Banner from "@/components/pages/home/Banner";
import CategoriesSection from "@/components/pages/home/CategoriesSection";
import HomeBrand from "@/components/pages/home/HomeBrand";
import BookingExperienceSection from "@/components/pages/home/BookingServiceSection";
import ComfyApparelSection from "@/components/pages/home/SkinConcernSection";
import FeaturedServicesSection from "@/components/pages/home/FeaturedServicesSection";
import { Brand } from "@/types_enum/devices";

export default async function Home() {
  // TODO: Replace with fetchData<Brand[]>("/brands") when backend is ready
  const brands: Brand[] = [
    {
      _id: "1",
      name: "Foreo",
      slug: "foreo",
      image: "/assets/images/logo1.png",
      isFeatured: true,
    },
    {
      _id: "2",
      name: "Halio",
      slug: "halio",
      image: "/assets/images/logo2.png",
      isFeatured: true,
    },
    {
      _id: "3",
      name: "LumiSkin",
      slug: "lumiskin",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
      isFeatured: false,
    },
    {
      _id: "4",
      name: "DermaGlow",
      slug: "dermaglow",
      image: "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=900&q=80",
      isFeatured: false,
    },
    {
      _id: "5",
      name: "SkinPulse",
      slug: "skinpulse",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      isFeatured: false,
    },
    {
      _id: "6",
      name: "AquaSonic",
      slug: "aquasonic",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
      isFeatured: false,
    },
    {
      _id: "7",
      name: "RejuvaTech",
      slug: "rejuvatech",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      isFeatured: false,
    },
  ];
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
