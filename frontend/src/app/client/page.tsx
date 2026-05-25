
import Link from "next/link";
import Container from "@/components/common/Container";
import ProductsList from "@/components/common/products/ProductsList";
import Banner from "@/components/pages/home/Banner";
import CategoriesSection from "@/components/pages/home/CategoriesSection";
import HomeBrand from "@/components/pages/home/HomeBrand";
import BookingExperienceSection from "@/components/pages/home/BookingServiceSection";
import ComfyApparelSection from "@/components/pages/home/SkinConcernSection";
import FeaturedServicesSection from "@/components/pages/home/FeaturedServicesSection";
import { Button } from "@/components/ui/button";
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

          <section className="my-8 overflow-hidden rounded-[28px] border border-slate-200 bg-linear-to-r from-slate-50 via-white to-sky-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Seller onboarding</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Đăng ký bán hàng theo mô hình marketplace đa brand</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Carevia tách rõ vai trò khách mua, brand staff và platform admin. Nếu bạn muốn mở gian hàng, hãy nộp hồ sơ brand để được duyệt trước khi catalog hiển thị cho khách hàng.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/sell-with-carevia">Đăng ký brand</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auth/signup?role=STAFF">Tạo tài khoản seller</Link>
                </Button>
              </div>
            </div>
          </section>

          <BookingExperienceSection />
          <ComfyApparelSection />

          <FeaturedServicesSection />
        </div>
      </Container>
    </div>
  );
}
