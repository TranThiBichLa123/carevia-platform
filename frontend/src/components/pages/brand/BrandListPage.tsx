"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/common/Container";
import { BrandData } from "@/lib/deviceApi";
import { Search } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

interface Props {
    brands: BrandData[];
}

const BrandListPage = ({ brands }: Props) => {
    const [search, setSearch] = useState("");

    const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container className="bg-white font-vietnam min-h-screen pb-20 ">
            {/* Breadcrum */}
            <div className="my-4 mb-2.5">
                <PageBreadcrumb

                    items={[]}
                    currentPage="Tất cả thương hiệu"
                />
            </div>
            {/* Header */}
            <div >
                
                <p className="text-sm text-gray-500">
                    {brands.length} thương hiệu đang có mặt tại Carevia
                </p>

                {/* Search */}
                <div className="relative mt-4 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm thương hiệu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:border-primary rounded-lg shadow-sm transition-colors"
                    />
                </div>
            </div>

            {/* Brand grid */}
            <div className="container mx-auto mt-6">
                {filtered.length === 0 ? (
                    <p className="text-center text-gray-400 py-16 text-sm">Không tìm thấy thương hiệu nào.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filtered.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/client/brand/${brand.id}`}
                                className="bg-white border border-white hover:border-primary rounded-lg hover:shadow-md transition-all group overflow-hidden flex flex-col relative"
                            >
                                {/* Logo */}
                                <div className="aspect-square bg-gray-50 flex items-center justify-center p-6 overflow-hidden relative">
                                    {brand.image ? (
                                        <Image
                                            src={brand.image}
                                            alt={brand.name}
                                            width={120}
                                            height={120}
                                            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-gray-300">{brand.name[0]}</span>
                                    )}

                                    {/* Discount Badge ôm vào góc */}
                                    {brand.maxDiscountPercentage != null && brand.maxDiscountPercentage > 0 && (
                                        <span className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg shadow-sm">
                                            -{Math.round(brand.maxDiscountPercentage)}%
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="px-3 py-2 border-t border-gray-100">
                                    <p className="text-[13px] font-bold text-gray-800 text-center truncate">
                                        {brand.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                )}
            </div>
        </Container>
    );
};

export default BrandListPage;
