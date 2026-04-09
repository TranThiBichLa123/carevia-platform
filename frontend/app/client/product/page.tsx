import React from "react";
import ProductCard from "@/components/common/products/ProductCard";
import { Product } from "@/type";
import Link from "next/dist/client/link";

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
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Banner nhỏ phía trên - Style Watsons/Sammi */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <nav className="text-xs text-gray-500 mb-2">
                        {/* Thay <span> bằng <Link> và thêm href="/" */}
                        <Link href="/" className="hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-primary font-medium">Tất cả sản phẩm</span>
                    </nav>
                    {/* <h1 className="text-2xl font-bold text-gray-800 uppercase">Tất cả sản phẩm</h1> */}
                </div>
            </div>

            <div className="container mx-auto px-4 mt-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR - BỘ LỌC (Filter) */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 border-b pb-3 mb-4 uppercase text-sm tracking-wider">Danh mục</h3>
                            <ul className="space-y-3">
                                {["Chăm sóc da", "Trang điểm", "Chăm sóc tóc", "Thực phẩm chức năng"].map((item) => (
                                    <li key={item} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors text-sm text-gray-600">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <h3 className="font-bold text-gray-900 border-b pb-3 mb-4 mt-8 uppercase text-sm tracking-wider">Thương hiệu</h3>
                            <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {["La Roche-Posay", "L'Oreal", "Vichy", "Cocoon", "Innisfree"].map((brand) => (
                                    <li key={brand} className="flex items-center gap-2 list-none cursor-pointer hover:text-primary transition-colors text-sm text-gray-600">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                                        {brand}
                                    </li>
                                ))}
                            </div>

                            <h3 className="font-bold text-gray-900 border-b pb-3 mb-4 mt-8 uppercase text-sm tracking-wider">Khoảng giá</h3>
                            <ul className="space-y-3">
                                {[
                                    { label: "Dưới 200.000đ", id: "p1" },
                                    { label: "200.000đ - 500.000đ", id: "p2" },
                                    { label: "Trên 500.000đ", id: "p3" }
                                ].map((price) => (
                                    <li key={price.id} className="flex items-center gap-2 text-sm text-gray-600">
                                        <input type="radio" name="price" id={price.id} className="text-primary focus:ring-primary w-4 h-4" />
                                        <label htmlFor={price.id} className="cursor-pointer">{price.label}</label>
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full mt-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors">
                                ÁP DỤNG LỌC
                            </button>
                        </div>
                    </aside>

                    {/* MAIN CONTENT - DANH SÁCH SẢN PHẨM */}
                    <main className="flex-1">
                        {/* Toolbar: Sắp xếp */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center mb-6 gap-4">
                            <p className="text-sm text-gray-600">
                                Hiển thị <span className="font-semibold text-gray-900">{products.length}</span> sản phẩm
                            </p>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-500">Sắp xếp theo:</label>
                                <select className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary px-3 py-2 outline-none cursor-pointer">
                                    <option>Mới nhất</option>
                                    <option>Giá: Thấp đến Cao</option>
                                    <option>Giá: Cao đến Thấp</option>
                                    <option>Bán chạy nhất</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid - Sử dụng component ProductCard của bạn */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {products.map((item: Product) => (
                                <ProductCard key={item._id} product={item} />
                            ))}
                        </div>

                        {/* Pagination mẫu */}
                        <div className="mt-12 flex justify-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm bg-white">1</button>
                            <button className="w-10 h-10 flex items-center justify-center border rounded-lg bg-primary text-white shadow-sm">2</button>
                            <button className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm bg-white">3</button>
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
};

export default AllProductsPage;
