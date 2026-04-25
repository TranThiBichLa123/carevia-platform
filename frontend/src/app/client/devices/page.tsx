"use client";

import React, { useCallback, useEffect, useState } from "react";
import ProductCard from "@/components/common/products/ProductCard";
import { Product } from "@/types_enum/devices";
import Link from "next/link";
import Container from "@/components/common/Container";
import { deviceApi, DevicePageResponse, BrandData } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";

type SortOption = "newest" | "price_asc" | "price_desc" | "best_selling";

const AllProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Filters
    const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    // Filter options from API
    const [brands, setBrands] = useState<BrandData[]>([]);

    useEffect(() => {
        deviceApi.getBrands().then(setBrands).catch(console.error);
    }, []);

    const getSortParam = (sort: SortOption): string => {
        switch (sort) {
            case "newest": return "createdAt,desc";
            case "price_asc": return "price,asc";
            case "price_desc": return "price,desc";
            case "best_selling": return "sold,desc";
            default: return "createdAt,desc";
        }
    };

    const fetchProducts = useCallback(async (pageNum: number, append = false) => {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        try {
            const params: Record<string, any> = {
                page: pageNum,
                size: 12,
                sort: getSortParam(sortBy),
            };
            if (selectedBrandIds.length === 1) params.brandId = selectedBrandIds[0];

            const data: DevicePageResponse = await deviceApi.getAll(params);
            const mapped = data.items.map(mapDeviceToProduct);

            if (append) {
                setProducts(prev => [...prev, ...mapped]);
            } else {
                setProducts(mapped);
            }
            setTotalItems(data.totalItems);
            setHasNext(data.hasNext);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [sortBy, selectedBrandIds]);

    useEffect(() => {
        fetchProducts(0);
    }, [fetchProducts]);

    const handleLoadMore = () => {
        if (hasNext && !loadingMore) {
            fetchProducts(page + 1, true);
        }
    };

    const handleBrandToggle = (brandId: number) => {
        setSelectedBrandIds(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        );
    };

    const handleSortChange = (sort: SortOption) => {
        setSortBy(sort);
    };

    const handleClearFilters = () => {
        setSelectedBrandIds([]);
        setPriceRange(null);
        setSortBy("newest");
    };

    const sortLabel: Record<SortOption, string> = {
        newest: "Mới nhất",
        price_asc: "Giá: Thấp đến Cao",
        price_desc: "Giá: Cao đến Thấp",
        best_selling: "Bán chạy nhất",
    };

    return (
        <Container className="bg-white min-h-screen pb-20 font-vietnam">
            {/* Breadcrumb - Style Watsons tối giản */}
            <div className="">
                <div className="container mx-auto px-4 py-3">
                    <nav className="text-[13px]  tracking-wider text-gray-500 flex items-center gap-2">
                        <Link href="/client" className="hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 ">Tất cả sản phẩm</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto ">

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* SIDEBAR - BỘ LỌC */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-lg border border-gray-200 sticky top-24">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-lg">
                                <h3 className="font-bold text-[13px]  font-vietnam uppercase tracking-tight">Bộ lọc tìm kiếm</h3>
                                <button onClick={handleClearFilters} className="text-[11px] text-primary  font-vietnam underline font-bold">Xóa tất cả</button>
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
                                    <h4 className="font-bold font-vietnam text-[13px] mb-4 flex justify-between items-center">
                                        THƯƠNG HIỆU <span className="text-gray-400">+</span>
                                    </h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {brands.map((brand) => (
                                            <label key={brand.id} className="flex items-center group cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBrandIds.includes(brand.id)}
                                                        onChange={() => handleBrandToggle(brand.id)}
                                                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 checked:bg-primary rounded-sm checked:border-primary transition-all mr-3"
                                                    />
                                                    <svg className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-[13px] text-gray-700 group-hover:text-primary font-vietnam">{brand.name}</span>
                                            </label>
                                        ))}
                                        {brands.length === 0 && (
                                            <p className="text-xs text-gray-400 italic font-vietnam">Đang tải...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Khoảng giá */}
                                <div>
                                    <h4 className="font-bold font-vietnam text-[13px] mb-4">KHOẢNG GIÁ</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Dưới 200.000đ", id: "p1" },
                                            { label: "200.000đ - 500.000đ", id: "p2" },
                                            { label: "Trên 500.000đ", id: "p3" }
                                        ].map((price) => (
                                            <label key={price.id} className="flex items-center cursor-pointer group">
                                                <input type="radio" name="price" id={price.id} className="w-4 h-4 text-primary border-gray-300 focus:ring-0" />
                                                <span className="ml-3 text-[13px] text-gray-700 group-hover:text-primary font-vietnam">{price.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={() => fetchProducts(0)}
                                    className="w-full py-3 bg-primary text-white text-xs font-vietnam font-black uppercase tracking-widest hover:bg-primary-hover rounded-lg transition-all"
                                >
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 bg-white">
                        {/* Toolbar tối giản kiểu Watsons */}
                        <div className="flex flex-wrap justify-between items-end mb-6 pb-4 border-b border-gray-200 gap-4">
                            <div>
                                <p className="text-[13px] text-gray-500 font-medium font-vietnam">
                                    Tìm thấy <span className="text-gray-900 font-bold">{totalItems}</span> sản phẩm
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tighter font-vietnam">Sắp xếp:</span>

                                {/* Khối Dropdown chính */}
                                <div className="relative group min-w-[140px]">
                                    <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-gray-300 transition-all">
                                        <span className="text-[13px] font-medium text-gray-700 font-vietnam whitespace-nowrap">{sortLabel[sortBy]}</span>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="flex flex-col whitespace-nowrap">
                                            {(Object.keys(sortLabel) as SortOption[]).map((key) => (
                                                <div
                                                    key={key}
                                                    onClick={() => handleSortChange(key)}
                                                    className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${sortBy === key ? 'text-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'} font-vietnam`}
                                                >
                                                    {sortLabel[key]}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-gray-200 aspect-square rounded-lg mb-3" />
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                <p className="text-gray-400 text-sm uppercase tracking-widest italic">
                                    Không tìm thấy sản phẩm phù hợp.
                                </p>
                                <button onClick={handleClearFilters} className="mt-4 text-primary underline text-sm font-bold">
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                    {products.map((item: Product) => (
                                        <ProductCard key={item.id} product={item} />
                                    ))}
                                </div>

                                {/* Load More */}
                                {hasNext && (
                                    <div className="mt-16 flex flex-col items-center">
                                        <div className="w-64 h-1 bg-gray-200 rounded-full mb-4">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${Math.min((products.length / totalItems) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mb-6">
                                            Bạn đang xem {products.length} trên {totalItems} sản phẩm
                                        </p>
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="px-12 py-3 border-2 border-gray-900 text-gray-900 font-black text-sm uppercase hover:bg-gray-900 hover:text-white transition-all tracking-widest disabled:opacity-50"
                                        >
                                            {loadingMore ? "Đang tải..." : "Xem thêm sản phẩm"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </Container>
    );

};

export default AllProductsPage;
