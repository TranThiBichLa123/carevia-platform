export interface Category {
  _id: string;
  name: string;
  image: string;
  categoryType: string;
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
}


export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  averageRating: number;
  image: string;
  category: Category;
  brand: Brand;
  ratings: any[]; // Bạn nên định nghĩa rõ interface cho Rating nếu có thể
  
  // --- CÁC TRƯỜNG BỔ SUNG ---
  sold?: number;              // Số lượng đã bán (để hiện: Đã bán 1.2k)
  reviewCount?: number;       // Tổng số lượt đánh giá
  isBookingAvailable?: boolean; // Cho phép đặt lịch trải nghiệm sản phẩm hay không
  images?: string[];          // Danh sách ảnh phụ (để làm slider ảnh nhỏ bên dưới ảnh chính)
  specifications?: {          // Thông số kỹ thuật chi tiết (hiện trong tab Description)
    label: string;
    value: string;
  }[];
  quantity?: number;          // Dùng cho logic Giỏ hàng (Cart)
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
