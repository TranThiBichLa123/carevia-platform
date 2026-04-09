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

const createMockProduct = (
  index: number,
  overrides: Partial<Product> & {
    _id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    image: string;
    category: Product["category"];
    brand: Product["brand"];
  }
): Product => ({
  _id: overrides._id,
  name: overrides.name,
  slug: overrides.slug,
  description: overrides.description ?? "Thiết bị chăm sóc da chính hãng với hiệu quả ổn định và dễ sử dụng tại nhà.",
  content: overrides.content ?? "Nội dung chi tiết sản phẩm đang được cập nhật để phục vụ giao diện frontend trong giai đoạn dùng mock data.",
  price: overrides.price,
  originalPrice: overrides.originalPrice,
  discountPercentage: overrides.discountPercentage ?? 0,
  stock: overrides.stock ?? 0,
  averageRating: overrides.averageRating ?? 5,
  image: overrides.image,
  images: overrides.images ?? [overrides.image],
  category: overrides.category,
  brand: overrides.brand,
  ratings: overrides.ratings ?? [],
  sku: overrides.sku ?? `CAREVIA-${String(index).padStart(3, "0")}`,
  warranty: overrides.warranty ?? {
    period: 12,
    policy: "Bao hanh 1 doi 1 trong 12 thang",
  },
  origin: overrides.origin ?? "Han Quoc",
  condition: overrides.condition ?? "new",
  specifications: overrides.specifications ?? [
    { label: "Cong nghe", value: "Sieu am" },
    { label: "Chat lieu", value: "ABS cao cap" },
  ],
  sold: overrides.sold ?? 0,
  reviewCount: overrides.reviewCount ?? 0,
  isBookingAvailable: overrides.isBookingAvailable ?? false,
  tags: overrides.tags ?? ["Best Seller"],
  videoUrl: overrides.videoUrl,
  quantity: overrides.quantity,
  createdAt: overrides.createdAt ?? "2026-04-01T00:00:00.000Z",
});

const mockProducts: Product[] = [
  createMockProduct(1, {
    _id: "1",
    name: "May Rua Mat Cong Nghe Song Sieu Am SkinPro Gen 2",
    slug: "may-rua-mat-skinpro-gen-2",
    description: "Cong nghe song rung sieu am giup lam sach sau lo chan long va loai bo ba nhon hieu qua.",
    content: "SkinPro Gen 2 phu hop cho quy trinh cham soc da tai nha, ho tro lam sach, massage va tang kha nang hap thu duong chat.",
    price: 45,
    originalPrice: 67,
    discountPercentage: 33,
    stock: 50,
    averageRating: 4.5,
    sold: 1200,
    reviewCount: 248,
    isBookingAvailable: false,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    ],
    category: {
      _id: "1",
      name: "Thiet Bi Lam Sach",
      slug: "thiet-bi-lam-sach",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      categoryType: "Featured",
    },
    brand: {
      _id: "1",
      name: "SkinPro",
      slug: "skinpro",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
      isFeatured: true,
    },
    specifications: [
      { label: "Chong nuoc", value: "IPX7" },
      { label: "Thoi luong pin", value: "120 phut" },
    ],
    tags: ["Best Seller", "Home Care"],
  }),
  createMockProduct(2, {
    _id: "2",
    name: "Cay Lan Massage Nang Co Mat 3D GlowLift",
    slug: "cay-lan-massage-glowlift-3d",
    description: "Thiet ke xoay 360 do giup thu gon guong mat va tang cuong tuan hoan mau.",
    content: "GlowLift 3D ho tro massage mat, co va vung jawline, phu hop su dung cung serum va kem duong.",
    price: 25,
    originalPrice: 31.25,
    discountPercentage: 20,
    stock: 100,
    averageRating: 4.8,
    sold: 850,
    reviewCount: 173,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=900&q=80",
    ],
    category: {
      _id: "2",
      name: "Massage va Nang Co",
      slug: "massage-va-nang-co",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80",
      categoryType: "Hot Categories",
    },
    brand: {
      _id: "2",
      name: "GlowLift",
      slug: "glowlift",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=300&q=80",
      isFeatured: true,
    },
    specifications: [
      { label: "Chat lieu", value: "Hop kim kem" },
      { label: "Kieu massage", value: "Con lan 3D" },
    ],
    tags: ["Trending", "Lift Care"],
  }),
  createMockProduct(3, {
    _id: "3",
    name: "May Sui Da Tay Te Bao Chet Chuyen Sau PureSkin Pro",
    slug: "may-sui-da-pureskin-pro",
    description: "Cong nghe ion am ho tro tay te bao chet va day duong chat vao sau ben trong da.",
    content: "PureSkin Pro phu hop voi routine cham soc da chuyen sau, giup lam sach be mat da va ho tro hap thu essence.",
    price: 34.99,
    originalPrice: 41.16,
    discountPercentage: 15,
    stock: 30,
    averageRating: 4.7,
    sold: 450,
    reviewCount: 96,
    isBookingAvailable: true,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    ],
    category: {
      _id: "3",
      name: "Thiet Bi Dac Tri",
      slug: "thiet-bi-dac-tri",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      categoryType: "Featured",
    },
    brand: {
      _id: "3",
      name: "PureSkin",
      slug: "pureskin",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    },
    specifications: [
      { label: "Che do", value: "Ion am va rung nhe" },
      { label: "Cong suat", value: "5W" },
    ],
    tags: ["New Arrival", "Spa Homecare"],
  }),
  createMockProduct(4, {
    _id: "4",
    name: "May Xong Mat Cap Am Nano AquaSteam Luxury",
    slug: "may-xong-mat-aquasteam-luxury",
    description: "Hat suong nano giup mo lo chan long va cap am tuc thi cho lan da kho.",
    content: "AquaSteam Luxury mang lai trai nghiem xong mat tai nha voi hat suong min, van hanh on dinh va de su dung.",
    price: 50,
    originalPrice: 100,
    discountPercentage: 50,
    stock: 75,
    averageRating: 4.6,
    sold: 3200,
    reviewCount: 410,
    isBookingAvailable: true,
    image: "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    ],
    category: {
      _id: "4",
      name: "Cap Am va Xong Mat",
      slug: "cap-am-va-xong-mat",
      image: "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=600&q=80",
      categoryType: "Hot Categories",
    },
    brand: {
      _id: "4",
      name: "AquaSteam",
      slug: "aquasteam",
      image: "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=300&q=80",
    },
    specifications: [
      { label: "Kich thuoc hat suong", value: "Nano" },
      { label: "Dung tich binh", value: "120ml" },
    ],
    tags: ["Hydration", "Hot Deal"],
  }),
  createMockProduct(5, {
    _id: "5",
    name: "He Thong Day Tinh Chat Tre Hoa Da LumiBeauty High-End",
    slug: "lumi-beauty-high-end",
    description: "Dong may cao cap tich hop anh sang sinh hoc giup cai thien nep nhan va sac to da.",
    content: "LumiBeauty High-End la dong thiet bi premium danh cho nguoi dung muon cham soc da nang cao tai nha ket hop lieu trinh booking tai cua hang.",
    price: 199.99,
    originalPrice: 222.21,
    discountPercentage: 10,
    stock: 20,
    averageRating: 4.9,
    sold: 95,
    reviewCount: 58,
    isBookingAvailable: true,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    category: {
      _id: "5",
      name: "Thiet Bi Cao Cap",
      slug: "thiet-bi-cao-cap",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
      categoryType: "Featured",
    },
    brand: {
      _id: "5",
      name: "LumiBeauty",
      slug: "lumibeauty",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=300&q=80",
      isFeatured: true,
    },
    specifications: [
      { label: "Cong nghe", value: "RF va LED" },
      { label: "Che do", value: "Tre hoa da" },
    ],
    tags: ["Premium", "Anti Aging"],
  }),
];
