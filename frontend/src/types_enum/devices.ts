export interface Category {
  id: string;
  name: string;
  slug: string; // Thêm để làm URL: /category/may-rua-mat
  image: string;
  categoryType: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string; // Thêm để làm URL: /brand/halio
  image?: string;
  isFeatured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;               // CỰC KỲ QUAN TRỌNG: Để làm link /product/may-day-tinh-chat-rf
  description: string;        // Mô tả ngắn (hiển thị ở card hoặc dưới tên SP)
  content: string;            // Bài viết chi tiết (đổ dữ liệu vào vùng nội dung chính)
  price: number;              // Giá bán hiện tại
  originalPrice: number;      // Giá gốc (để gạch đi khi có sale)
  discountPercentage: number;
  stock: number;
  averageRating: number;
  image: string;              // Ảnh đại diện chính
  images: string[];           // Array các ảnh chi tiết để làm slider
  category: Category;
  brand: Brand;
  ratings: any[]; 
  
  // --- ĐẶC THÙ THIẾT BỊ ĐIỆN TỬ ---
  sku: string;                // Mã quản lý kho (VD: HALIO-001)
  warranty: {
    period: number;           // Thời gian bảo hành (tháng)
    policy: string;           // Chính sách (VD: "1 đổi 1 trong 1 năm")
  };
  origin: string;             // Xuất xứ (VD: Nhật Bản, Hàn Quốc)
  condition: "new" | "used" | "refurbished"; // Tình trạng máy

  // --- THÔNG SỐ KỸ THUẬT (Dạng cấu trúc) ---
  specifications: {          
    label: string;            // VD: "Chống nước", "Dung lượng pin"
    value: string;            // VD: "IPX7", "1000mAh"
  }[];

  // --- DỮ LIỆU KINH DOANH ---
  sold: number;               
  reviewCount: number;       
  isBookingAvailable: boolean; 
  bookingPrice: number;       // Gia trai nghiem/booking neu khac gia mua san pham
  sessionIds: string[];       // Danh sach cac phien trai nghiem lien ket voi san pham
  tags: string[];             // VD: ["Best Seller", "New Arrival", "Trending"]
  videoUrl?: string;          // Link Youtube/Video review hướng dẫn sử dụng
  
  // --- DÙNG CHO FRONTEND ---
  quantity?: number;          // Phục vụ logic giỏ hàng
  createdAt: string;          // Để lọc sản phẩm mới nhất
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface AddressInput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export type Banners = {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
};
