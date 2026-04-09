
import Container from "@/components/common/Container";
import ProductsList from "@/components/common/products/ProductsList";
import Banner from "@/components/pages/home/Banner";
import CategoriesSection from "@/components/pages/home/CategoriesSection";
import HomeBrand from "@/components/pages/home/HomeBrand";
import BookingExperienceSection from "@/components/pages/home/BookingServiceSection";
import ComfyApparelSection from "@/components/pages/home/SkinConcernSection";
import FeaturedServicesSection from "@/components/pages/home/FeaturedServicesSection";
import { Brand } from "@/type";

export default async function Home() {
  // TODO: Replace with fetchData<Brand[]>("/brands") when backend is ready
 const brands: Brand[] = [
  { 
    _id: "1", 
    name: "Foreo", 
    image: "https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
  { 
    _id: "2", 
    name: "Halio", 
    image: "https://images.unsplash.com/photo-1761718209794-e0588aafbcc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
  { 
    _id: "3", 
    name: "LumiSkin", 
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
  { 
    _id: "4", 
    name: "DermaGlow", 
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
  { 
    _id: "5", 
    name: "SkinPulse", 
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
  { 
    _id: "6", 
    name: "AquaSonic", 
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
  { 
    _id: "7", 
    name: "RejuvaTech", 
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
  },
];
  return (
    <div className="bg-white min-h-screen">
      <Container className="min-h-screen flex py-3 gap-3">
        {/* py-7 = padding trên + dưới là 1.75rem (28px)
pt-X = chỉ padding trên
Tăng số (vd: py-10, pt-8) = khoảng cách lớn hơn */}
        <CategoriesSection />
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
