"use client";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, fetchData, fetchWithConfig } from "@/lib/api";
import { Product } from "@/types_enum/devices";
import ProductCard from "@/components/common/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ArrowRight, Percent } from "lucide-react";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
  total: number;
}

const BookingServiceSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dùng flag để tránh cập nhật state khi component đã unmount
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);

        // Lấy token nếu API yêu cầu bảo mật
        // const token = localStorage.getItem("token"); 

        // Thêm logic lấy token (ví dụ từ cookie hoặc localStorage)
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];

        const response = await fetchWithConfig<any>(API_ENDPOINTS.PRODUCTS, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!isMounted) return;

        // Trích xuất mảng an toàn
        const deviceArray = response?.content && Array.isArray(response.content)
          ? response.content
          : (Array.isArray(response) ? response : []);

        setProducts(deviceArray.slice(0, 8));
      } catch (error) {
        if (isMounted) {
          console.error("❌ Failed to load products:", error);
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => { isMounted = false; }; // Cleanup function
  }, []);

  // ... rest of component


  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white p-5 mt-5 rounded-md border border-border">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Sử dụng text-primary */}
            <Calendar className="w-5 h-5 text-primary" />
            <Badge
              variant="outline"
              className="text-primary border-primary"
            >
              Đặt lịch ngay
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Trải nghiệm thiết bị chăm sóc da
          </h2>
          <p className="text-muted-foreground">
            Dùng thử trước khi quyết định mua - Hoàn toàn miễn phí
          </p>
        </div>
        <Link href="/client/booking">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 hover:bg-primary text-primary hover:text-white hover:border-primary transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        {products.length > 0 ? (
          products
            .slice(0, 8)
            .map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <>
            {/* Card 1 */}
            <Card className="flex flex-col rounded-lg group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-gray-200 hover:border-primary/50 p-0 h-full">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80"
                  alt="Trải nghiệm thiết bị chăm sóc da"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-2">Trải nghiệm miễn phí</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Đặt lịch để trải nghiệm thiết bị trước khi mua
                </p>
                <div className="mt-auto">
                  <Link href="/client/booking">
                    <Button className="w-full text-white bg-primary rounded-lg hover:bg-primary-hover">
                      Đặt lịch ngay
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="flex flex-col rounded-lg group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-gray-200 hover:border-primary/50 p-0 h-full">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://diva.edu.vn/wp-content/uploads/2024/07/chuyen-vien-tu-van-tham-my-12.jpg"
                  alt="Tư vấn chuyên môn"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-2">Tư vấn chuyên môn</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Chuyên viên da liễu hỗ trợ tư vấn miễn phí
                </p>
                <div className="mt-auto">
                  <Link href="/client/booking">
                    <Button className="w-full text-white bg-primary rounded-lg hover:bg-primary-hover">
                      Đặt lịch ngay
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="flex flex-col rounded-lg group hover:shadow-xl  transition-all duration-300 cursor-pointer overflow-hidden border-gray-200 hover:border-primary/50 p-0 h-full">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://trungmy.com/wp-content/uploads/2023/11/may-phan-tich-da-la-gi.jpg"
                  alt="Phân tích da miễn phí"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-2">Phân tích da miễn phí</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Công nghệ AI phân tích tình trạng làn da của bạn
                </p>
                <div className="mt-auto">
                  <Link href="/client/booking">
                    <Button className="w-full text-white bg-primary rounded-lg hover:bg-primary-hover">
                      Đặt lịch ngay
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="flex flex-col rounded-lg group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-gray-200 hover:border-primary/50 p-0 h-full">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80"
                  alt="Ưu đãi đặc biệt"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-2">Ưu đãi đặc biệt</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Giảm 20% cho lần đặt lịch đầu tiên của khách hàng mới
                </p>
                <div className="mt-auto">
                  <Link href="/client/booking">
                    <Button className="w-full text-white bg-primary rounded-lg hover:bg-primary-hover">
                      Đặt lịch ngay
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>


      {/* Promotional Banner: Màu Primary đặc */}
      <div className="relative overflow-hidden bg-primary rounded-lg  md:p-9  min-h-[260px] md:min-h-[240px] flex items-center text-white shadow-xl">

        {/* ================= BACKGROUND BONG BÓNG RÕ NÉT VÀ NỔI BẬT ================= */}
        {/* Tăng opacity tổng từ 40% lên 75% để nhìn rõ bong bóng hơn */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-75">

          {/* Bong bóng lớn 1 - Góc phải trên (Tăng nền lên bg-white/25 để hiện rõ) */}
          <div
            className="absolute right-[-5%] top-[-10%] bg-white/25 rounded-full blur-[0.5px] animate-[floatAround_20s_infinite_ease-in-out]"
            style={{ width: '280px', height: '280px', animationDelay: '0s' }}
          />

          {/* Bong bóng lớn 2 - Góc trái dưới (bg-white/20 giúp giữ chiều sâu) */}
          <div
            className="absolute left-[25%] bottom-[-30%] bg-white/20 rounded-full blur-[1px] animate-[floatAround_25s_infinite_ease-in-out]"
            style={{ width: '200px', height: '200px', animationDelay: '-5s' }}
          />

          {/* Bong bóng trung tâm - Hiện rõ ở vùng giữa phải (bg-white/25 và viền nhẹ) */}
          <div
            className="absolute right-[22%] top-[20%] bg-white/25 border border-white/10 rounded-full blur-[0.5px] animate-[floatAround_18s_infinite_ease-in-out]"
            style={{ width: '180px', height: '180px', animationDelay: '-2s' }}
          />


          {/* Bong bóng nhỏ tạo điểm nhấn sắc nét */}
          <div
            className="absolute left-[35%] top-[-2%] bg-white/30 rounded-full animate-[floatAround_15s_infinite_ease-in-out]"
            style={{ width: '60px', height: '60px', animationDelay: '-8s' }}
          />

          {/* Bong bóng nhỏ tạo điểm nhấn sắc nét */}
          <div
            className="absolute right-[35%] bottom-[-5%] bg-white/30 rounded-full animate-[floatAround_15s_infinite_ease-in-out]"
            style={{ width: '70px', height: '70px', animationDelay: '-8s' }}
          />

        </div>

        {/* Định nghĩa chuyển động trôi bồng bềnh, lắc lư qua lại không biến mất */}
        <style dangerouslySetInnerHTML={{
          __html: `
    @keyframes floatAround {
      0% {
        transform: translate(0, 0) scale(1) rotate(0deg);
      }
      25% {
        transform: translate(35px, -25px) scale(1.05) rotate(5deg);
      }
      50% {
        transform: translate(-15px, 35px) scale(0.95) rotate(-10deg);
      }
      75% {
        transform: translate(-35px, -15px) scale(1.02) rotate(8deg);
      }
      100% {
        transform: translate(0, 0) scale(1) rotate(0deg);
      }
    }
  `}} />
        {/* ==================================================================== */}

        <div className="relative z-10 w-full">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="max-w-xl mb-4">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                Nâng tầm vẻ đẹp làn da cùng chuyên gia
              </h3>
              <p className="text-white/90 text-base md:text-[14px] leading-relaxed">
                Thấu hiểu làn da qua công nghệ phân tích hiện đại. Đặt lịch tư vấn ngay hôm nay để nhận voucher 20% và bộ quà tặng trải nghiệm miễn phí.
              </p>
            </div>

            <Link href="/client/booking">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary border-white hover:bg-white/90 transition-all duration-300 px-7 py-5 rounded-lg font-bold shadow-lg hover:scale-105"
              >
                Đặt lịch ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>



      <div className="mt-8 text-center md:hidden">
        <Link href="/client/booking">
          <Button className="w-full text-white bg-primary rounded-lg hover:bg-primary-hover">
            Đặt lịch ngay
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingServiceSection;
