import { footerFour, footerOne, footerThree, footerTwo } from "@/assets/image";
import { Product } from "@/type";

const topHelpCenter = [
  { title: "Help Center", href: "/help" },
  { title: "Wishlist", href: "/user/wishlist" },
  { title: "Order Tracking", href: "/user/orders" },
];

const footerTopData = [
  {
    title: "High Quality Selection",
    subTitle: "Total product quality control for peace of mind",
    image: footerOne,
  },
  {
    title: "Affordable Prices",
    subTitle: "Factory direct prices for maximum savings",
    image: footerTwo,
  },
  {
    title: "Express Shipping",
    subTitle: "Fast, reliable delivery from global warehouse",
    image: footerThree,
  },
  {
    title: "Worry free",
    subTitle: "Instant access to professional support",
    image: footerFour,
  },
];

export { topHelpCenter, footerTopData, mockProducts };
// Mock data nâng cấp cho phong cách Hasaki / Shopee
const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Máy Rửa Mặt Công Nghệ Sóng Siêu Âm SkinPro Gen 2",
    description: "Công nghệ sóng rung siêu âm giúp làm sạch sâu lỗ chân lông và loại bỏ bã nhờn. Thiết kế chống nước IPX7 an toàn tuyệt đối.",
    price: 45.00, // Giá gốc cao hơn để thấy được giảm giá
    discountPercentage: 33,
    stock: 50,
    averageRating: 4.5,
    sold: 1200, // Thêm số lượng đã bán
    isBookingAvailable: false, // Máy rửa mặt không cần booking
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    category: { _id: "1", name: "Thiết Bị Làm Sạch", image: "", categoryType: "Featured" },
    brand: { _id: "1", name: "SkinPro", image: "" },
    ratings: [],
  },
  {
    _id: "2",
    name: "Cây Lăn Massage Nâng Cơ Mặt 3D GlowLift",
    description: "Thiết kế xoay 360 độ giúp thon gọn gương mặt và tăng cường tuần hoàn máu. Phù hợp cho việc đẩy tinh chất serum.",
    price: 25.00,
    discountPercentage: 20,
    stock: 100,
    averageRating: 4.8,
    sold: 850,
    isBookingAvailable: false,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    category: { _id: "2", name: "Massage & Nâng Cơ", image: "", categoryType: "Hot Categories" },
    brand: { _id: "2", name: "GlowLift", image: "" },
    ratings: [],
  },
  {
    _id: "3",
    name: "Máy Sủi Da Tẩy Tế Bào Chết Chuyên Sâu PureSkin Pro",
    description: "Sử dụng công nghệ ion âm giúp tẩy tế bào chết và đẩy dưỡng chất vào sâu bên trong da một cách chuyên nghiệp.",
    price: 34.99,
    discountPercentage: 15,
    stock: 30,
    averageRating: 4.7,
    sold: 450,
    isBookingAvailable: true, // Cho phép trải nghiệm thử lực sủi
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    category: { _id: "3", name: "Thiết Bị Đặc Trị", image: "", categoryType: "Featured" },
    brand: { _id: "3", name: "PureSkin", image: "" },
    ratings: [],
  },
  {
    _id: "4",
    name: "Máy Xông Mặt Cấp Ẩm Nano AquaSteam Luxury",
    description: "Hạt sương siêu nhỏ giúp mở lỗ chân lông và cấp ẩm tức thì cho làn da khô, đặc biệt hiệu quả trong mùa đông.",
    price: 50.00,
    discountPercentage: 50,
    stock: 75,
    averageRating: 4.6,
    sold: 3200,
    isBookingAvailable: true, // Khách thường muốn xem độ mạnh của hơi sương
    image: "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=900&q=80",
    category: { _id: "4", name: "Cấp Ẩm & Xông Mặt", image: "", categoryType: "Hot Categories" },
    brand: { _id: "4", name: "AquaSteam", image: "" },
    ratings: [],
  },
  {
    _id: "5",
    name: "Hệ Thống Đẩy Tinh Chất Trẻ Hóa Da LumiBeauty High-End",
    description: "Dòng máy cao cấp tích hợp ánh sáng sinh học giúp làm mờ nếp nhăn và cải thiện sắc tố da rõ rệt sau 2 tuần.",
    price: 199.99,
    discountPercentage: 10,
    stock: 20,
    averageRating: 4.9,
    sold: 95,
    isBookingAvailable: true, // Sản phẩm cao cấp, rất cần booking trải nghiệm
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    category: { _id: "5", name: "Thiết Bị Cao Cấp", image: "", categoryType: "Featured" },
    brand: { _id: "5", name: "LumiBeauty", image: "" },
    ratings: [],
  },
];
