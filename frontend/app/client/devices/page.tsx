import React from "react";
import ProductCard from "@/components/common/products/ProductCard";
import { Product } from "@/types_enum/devices";
import Link from "next/dist/client/link";
import Container from "@/components/common/Container";

const createMockProduct = (
    index: number,
    overrides: Partial<Product> & {
        _id: string;
        name: string;
        price: number;
        image: string;
        category: Product["category"];
        brand: Product["brand"];
    }
): Product => ({
    _id: overrides._id,
    name: overrides.name,
    slug: overrides.slug ?? `san-pham-${overrides._id}`,
    description: overrides.description ?? "Mô tả sản phẩm",
    content: overrides.content ?? "Nội dung chi tiết sản phẩm đang được cập nhật.",
    price: overrides.price,
    originalPrice: overrides.originalPrice ?? overrides.price,
    discountPercentage: overrides.discountPercentage ?? 0,
    stock: overrides.stock ?? 10,
    averageRating: overrides.averageRating ?? 5,
    image: overrides.image,
    images: overrides.images ?? [overrides.image],
    category: overrides.category,
    brand: overrides.brand,
    ratings: overrides.ratings ?? [],
    sku: overrides.sku ?? `SKU-${overrides._id}`,
    warranty: overrides.warranty ?? {
        period: 12,
        policy: "Bảo hành 12 tháng",
    },
    origin: overrides.origin ?? "Hàn Quốc",
    condition: overrides.condition ?? "new",
    specifications: overrides.specifications ?? [
        { label: "Dung tích", value: "Chuẩn hãng" },
        { label: "Loại da", value: "Phù hợp nhiều loại da" },
    ],
    sold: overrides.sold ?? 100 + index * 25,
    reviewCount: overrides.reviewCount ?? 20 + index * 5,
    isBookingAvailable: overrides.isBookingAvailable ?? false,
    bookingPrice: overrides.bookingPrice ?? 0,
    sessionIds: overrides.sessionIds ?? [],
    tags: overrides.tags ?? ["Best Seller"],
    videoUrl: overrides.videoUrl,
    quantity: overrides.quantity ?? 1,
    createdAt: overrides.createdAt ?? "2026-04-01T00:00:00.000Z",
});

const MOCK_PRODUCTS: Product[] = [
    createMockProduct(1, {
        _id: "1",
        name: "Nước Tẩy Trang La Roche-Posay Làm Sạch Sâu Cho Da Dầu 400ml",
        slug: "nuoc-tay-trang-la-roche-posay-400ml",
        image: "https://picsum.photos/seed/product-1/600/600",
        price: 355000,
        originalPrice: 445000,
        discountPercentage: 20,
        category: {
            _id: "cat1",
            name: "CHĂM SÓC DA",
            slug: "cham-soc-da",
            image: "https://picsum.photos/seed/category-1/300/300",
            categoryType: "featured",
        },
        brand: {
            _id: "brand1",
            name: "La Roche-Posay",
            slug: "la-roche-posay",
            image: "https://picsum.photos/seed/brand-1/300/300",
        },
    }),
    createMockProduct(2, {
        _id: "2",
        name: "Sữa Rửa Mặt Cerave Foaming Facial Cleanser Cho Da Dầu",
        slug: "cerave-foaming-facial-cleanser",
        image: "https://picsum.photos/seed/product-2/600/600",
        price: 420000,
        originalPrice: 470000,
        discountPercentage: 10,
        category: {
            _id: "cat1",
            name: "CHĂM SÓC DA",
            slug: "cham-soc-da",
            image: "https://picsum.photos/seed/category-1/300/300",
            categoryType: "featured",
        },
        brand: {
            _id: "brand2",
            name: "CeraVe",
            slug: "cerave",
            image: "https://picsum.photos/seed/brand-2/300/300",
        },
    }),
    createMockProduct(3, {
        _id: "3",
        name: "Son Kem Lì Black Rouge Air Fit Velvet Tint",
        slug: "black-rouge-air-fit-velvet-tint",
        image: "https://picsum.photos/seed/product-3/600/600",
        price: 150000,
        originalPrice: 150000,
        discountPercentage: 0,
        category: {
            _id: "cat2",
            name: "TRANG ĐIỂM",
            slug: "trang-diem",
            image: "https://picsum.photos/seed/category-2/300/300",
            categoryType: "featured",
        },
        brand: {
            _id: "brand3",
            name: "Black Rouge",
            slug: "black-rouge",
            image: "https://picsum.photos/seed/brand-3/300/300",
        },
    }),
    createMockProduct(4, {
        _id: "4",
        name: "Kem Chống Nắng Anessa Perfect UV Sunscreen Skincare Milk",
        slug: "anessa-perfect-uv-sunscreen-skincare-milk",
        image: "https://picsum.photos/seed/product-4/600/600",
        price: 685000,
        originalPrice: 805000,
        discountPercentage: 15,
        category: {
            _id: "cat1",
            name: "CHĂM SÓC DA",
            slug: "cham-soc-da",
            image: "https://picsum.photos/seed/category-1/300/300",
            categoryType: "featured",
        },
        brand: {
            _id: "brand4",
            name: "Anessa",
            slug: "anessa",
            image: "https://picsum.photos/seed/brand-4/300/300",
        },
    }),
];

const AllProductsPage = () => {
    // 2. Tạm thời dùng Mock Data thay vì gọi fetch
    const products: Product[] = MOCK_PRODUCTS;

    return (
        <Container className="bg-[#f4f4f4] min-h-screen pb-20 font-sans">
            {/* Breadcrumb - Style Watsons tối giản */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3">
                    <nav className="text-[11px] uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Link href="/client" className="hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-bold">Tất cả sản phẩm</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto  mt-4">
                {/* Tiêu đề trang */}
                {/* <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase italic">
                    Tất cả sản phẩm
                </h1> */}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* SIDEBAR - BỘ LỌC */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-sm border border-gray-200 sticky top-24">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-sm uppercase tracking-tight">Bộ lọc tìm kiếm</h3>
                                <button className="text-[11px] text-primary underline font-bold">Xóa tất cả</button>
                            </div>

                            <div className="p-4 space-y-8">
                                {/* Danh mục
                                <div>
                                    <h4 className="font-bold text-[13px] mb-4 flex justify-between items-center">
                                        DANH MỤC <span className="text-gray-400">+</span>
                                    </h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {["Chăm sóc da", "Trang điểm", "Chăm sóc tóc", "Thực phẩm chức năng"].map((item) => (
                                            <label key={item} className="flex items-center group cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 checked:bg-primary checked:border-primary transition-all mr-3" />
                                                    <svg className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-[13px] text-gray-700 group-hover:text-primary transition-colors">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div> */}

                                {/* Thương hiệu */}
                                <div>
                                    <h4 className="font-bold text-[13px] mb-4 flex justify-between items-center">
                                        THƯƠNG HIỆU <span className="text-gray-400">+</span>
                                    </h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {["La Roche-Posay", "L'Oreal", "Vichy", "Cocoon", "Innisfree"].map((brand) => (
                                            <label key={brand} className="flex items-center group cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 checked:bg-primary checked:border-primary transition-all mr-3" />
                                                    <svg className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-[13px] text-gray-700 group-hover:text-primary">{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Khoảng giá */}
                                <div>
                                    <h4 className="font-bold text-[13px] mb-4">KHOẢNG GIÁ</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Dưới 200.000đ", id: "p1" },
                                            { label: "200.000đ - 500.000đ", id: "p2" },
                                            { label: "Trên 500.000đ", id: "p3" }
                                        ].map((price) => (
                                            <label key={price.id} className="flex items-center cursor-pointer group">
                                                <input type="radio" name="price" id={price.id} className="w-4 h-4 text-primary border-gray-300 focus:ring-0" />
                                                <span className="ml-3 text-[13px] text-gray-700 group-hover:text-primary">{price.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <button className="w-full py-3 bg-[#00b2bd] text-white text-xs font-black uppercase tracking-widest hover:bg-[#008e96] transition-all">
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="flex-1">
                        {/* Toolbar tối giản kiểu Watsons */}
                        <div className="flex flex-wrap justify-between items-end mb-6 pb-4 border-b border-gray-200 gap-4">
                            <div>
                                <p className="text-[13px] text-gray-500 font-medium">
                                    Tìm thấy <span className="text-gray-900 font-bold">{products.length}</span> sản phẩm
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tighter">Sắp xếp:</span>
                                <div className="relative">
                                    <select className="appearance-none bg-transparent border-none text-[13px] font-medium pr-8 focus:ring-0 cursor-pointer text-primary">
                                        <option>Mới nhất</option>
                                        <option>Giá: Thấp đến Cao</option>
                                        <option>Giá: Cao đến Thấp</option>
                                        <option>Bán chạy nhất</option>
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                            {products.map((item: Product) => (
                                <ProductCard key={item._id} product={item} />
                            ))}
                        </div>

                        {/* Nút Xem Thêm thay vì Phân trang */}
                        <div className="mt-16 flex flex-col items-center">
                            <div className="w-64 h-1 bg-gray-200 rounded-full mb-4">
                                <div className="w-1/3 h-full bg-primary rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-500 mb-6">Bạn đang xem 12 trên {products.length} sản phẩm</p>
                            <button className="px-12 py-3 border-2 border-gray-900 text-gray-900 font-black text-sm uppercase hover:bg-gray-900 hover:text-white transition-all tracking-widest">
                                Xem thêm sản phẩm
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </Container>
    );

};

export default AllProductsPage;
