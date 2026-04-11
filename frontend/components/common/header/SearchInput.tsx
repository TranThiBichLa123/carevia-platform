"use client";

import { Product } from "@/types_enum/devices";
import { mockProducts } from "../../../constants/data";
import { Input } from "../../../components/ui/input";
import { fetchData, hasExplicitApiEndpoint } from "../../../lib/api";
import { Loader2, Search, X, Camera, Mic } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import AddToCartButton from "../products/AddToCartButton";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ProductsResponse {
  products: Product[];
  total: number;
}

const placeholders = [
  "DEAL HOT hôm nay",
  "Sản phẩm bán chạy",
  "Tìm kiếm tại đây",
];

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const filterMockProducts = useCallback((searchTerm: string) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return [];
    }

    return mockProducts.filter((product: Product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category?.name,
        product.brand?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedTerm);
    });
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    if (!hasExplicitApiEndpoint()) {
      setFeaturedProducts(mockProducts.slice(0, 6));
      return;
    }

    try {
      const response = await fetchData<ProductsResponse>("/products?page=1&limit=6");
      setFeaturedProducts(response.products);
    } catch {
      setFeaturedProducts(mockProducts.slice(0, 6));
    }
  }, []);

  const fetchProducts = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setProducts([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      if (!hasExplicitApiEndpoint()) {
        setProducts(filterMockProducts(searchTerm).slice(0, 10));
        setLoading(false);
        return;
      }

      try {
        const response = await fetchData<ProductsResponse>(
          `/products?page=1&limit=10&search=${encodeURIComponent(searchTerm)}`
        );
        setProducts(response.products);
      } catch {
        setProducts(filterMockProducts(searchTerm).slice(0, 10));
        setError("Dang hien thi ket qua tu du lieu mau");
      } finally {
        setLoading(false);
      }
    },
    [filterMockProducts]
  );

  useEffect(() => {
    // Xác định thời gian chờ: nếu là bước cuối (Lottie) thì 5s, còn lại 3s
    const delay = placeholderIndex === placeholders.length ? 5000 : 3000;

    const timer = setTimeout(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % (placeholders.length + 1));
    }, delay);

    return () => clearTimeout(timer); // Xóa timer cũ khi index thay đổi
  }, [placeholderIndex]); // Chạy lại mỗi khi placeholderIndex thay đổi


  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, fetchProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showSearch]);

  const toggleMobileSearch = () => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
      setSearch("");
      setShowResults(true);
    }
  };

  const closeSearch = () => {
    setShowResults(false);
    setShowSearch(false);
    setSearch("");
  };

  const [charFrame, setCharFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCharFrame((prev) => (prev === 0 ? 1 : 0));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const [welcomeAnimData, setWelcomeAnimData] = useState<any>(null);

  useEffect(() => {
    // Tải file từ thư mục public
    fetch("/assets/animation/welcome.json")
      .then((res) => res.json())
      .then((data) => setWelcomeAnimData(data))
      .catch((err) => console.error("Lỗi tải animation:", err));
  }, []);

  return (
    <div ref={searchRef} className="relative lg:w-full">
      <button onClick={toggleMobileSearch} className="lg:hidden mt-1.5">
        {showSearch ? (
          <X className="w-5 h-5 text-white hover:text-babyshopRed hoverEffect" />
        ) : (
          <Search className="w-5 h-5 text-white hover:text-babyshopRed hoverEffect" />
        )}
      </button>

      <form
        className="relative hidden lg:flex items-center"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative w-full">
          <Input
            className="flex-1 rounded-md py-5 bg-gray-50 border border-gray-200 text-babyshopText pl-4 pr-28 text-sm focus-visible:ring-0"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />

          {search === "" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden h-12 flex items-center z-20">
              <AnimatePresence mode="wait">
                {placeholderIndex < placeholders.length ? (
                  <motion.span
                    key={placeholderIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="text-gray-400 font-medium text-sm block"
                  >
                    {placeholders[placeholderIndex]}
                  </motion.span>
                ) : (
                  /* Thay thế nhân vật bằng Lottie Welcome */
                  <motion.div
                    key="welcome-lottie"
                    initial={{ y: 10, opacity: 0 }} // Giảm độ nảy (y) xuống cho mượt
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.8 }} // Tăng thời gian hiệu ứng xuất hiện (0.5 -> 0.8)
                    className="flex items-center"
                  >
                    {/* Giảm w-24 xuống w-16 hoặc w-20 để nhỏ lại */}
                    <div className="w-16 md:w-20 h-auto overflow-hidden">
                      <DotLottieReact
                        src="https://lottie.host/a36bed6a-641b-45d6-a0b3-64ed1909782d/xzsU5YqqxW.lottie"
                        loop
                        autoplay
                        // Thêm style để đảm bảo nó nằm gọn trong khung
                        style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}


          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <button
              type="button"
              className="text-babyshopText opacity-90 hover:opacity-100"
              aria-label="Camera search"
            >
              <Camera className="w-5 h-5" />
            </button>

            <button
              type="button"
              className="text-babyshopText opacity-90 hover:opacity-100"
              aria-label="Voice search"
            >
              <Mic className="w-5 h-5" />
            </button>

            {search ? (
              <X
                onClick={() => setSearch("")}
                className="w-5 h-5 text-babyshopText hover:text-babyshopRed hoverEffect cursor-pointer"
              />
            ) : (
              <Search className="w-5 h-5 text-babyshopText" />
            )}
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed lg:hidden left-0 top-16 w-full px-1 py-1 md:px-5 md:py-2 bg-white"
          >
            <div className="bg-white p-4 shadow-lg rounded-md">
              <div className="relative flex items-center">
                <Input
                  ref={mobileInputRef}
                  placeholder="Search Products..."
                  className="w-full pr-16 py-5 rounded-md focus-visible:ring-0 focus-visible:border-babyshopRed bg-white text-babyshopText placeholder:font-semibold"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowResults(true)}
                />
                {search ? (
                  <X
                    onClick={() => setSearch("")}
                    className="absolute right-4 w-5 h-5 text-babyshopText hover:text-babyshopRed hoverEffect cursor-pointer"
                  />
                ) : (
                  <Search className="absolute right-4 w-5 h-5 text-babyshopText" />
                )}
              </div>

              {showResults && (
                <div className="mt-2 bg-white rounded-md shadow-lg overflow-y-auto border border-gray-200 max-h-[50vh]">
                  {loading ? (
                    <div className="flex items-center justify-center px-6 gap-2 py-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-babyshopRed" />
                      <span className="font-medium text-gray-600">Searching...</span>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                          Search Results ({products.length})
                        </p>
                      </div>
                      {products.map((product) => (
                        <div
                          key={product._id}
                          onClick={closeSearch}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-4 py-3 cursor-pointer"
                        >
                          <Link
                            href={`/client/devices/${product._id}`}
                            className="flex items-center gap-3"
                          >
                            {product.image && (
                              <div className="w-12 h-12 bg-gray-50 rounded shrink-0 overflow-hidden">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-sm font-semibold text-babyshopSky mt-0.5">
                                ${product.price}
                              </p>
                              <p className="text-sm text-babyshopTextLight">
                                {product.category?.name || "No Category"} - {product.brand?.name || "No Brand"}
                              </p>
                            </div>
                          </Link>
                        </div>
                      ))}
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <Link
                          href={`/client/devices?search=${encodeURIComponent(search)}`}
                          onClick={closeSearch}
                          className="text-sm text-babyshopSky font-medium hover:underline"
                        >
                          View all results
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        {!search ? (
                          <p className="text-sm font-medium text-gray-700">Popular Products</p>
                        ) : (
                          <p className="text-sm font-medium text-gray-700">
                            No results for &quot;<span className="text-babyshopRed">{search}</span>&quot;
                          </p>
                        )}
                      </div>
                      <div>
                        {featuredProducts.map((item) => (
                          <div
                            key={item._id}
                            className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <button
                              onClick={() => {
                                setSearch(item.name);
                                setShowResults(true);
                              }}
                              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:cursor-pointer"
                            >
                              <Search className="text-babyshopText w-5 h-5" />
                              <div>
                                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                  {item.name}
                                </h3>
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && !showSearch && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-md shadow-lg z-50 max-h-[70vh] overflow-y-auto border border-gray-200 lg:block hidden">
          {loading ? (
            <div className="flex items-center justify-center px-6 gap-2 py-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-babyshopRed" />
              <span className="font-medium text-gray-600">Searching...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="py-0">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  Search Results ({products.length})
                </p>
                {error && <p className="text-sm font-medium text-babyshopRed">{error}</p>}
              </div>
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-4 py-3 flex items-center gap-5 justify-between"
                >
                  <div
                    className="flex-1"
                    onClick={() => {
                      setShowResults(false);
                      setSearch("");
                    }}
                  >
                    <Link
                      href={`/client/devices/${product._id}`}
                      className="flex items-center gap-3"
                    >
                      {product.image && (
                        <div className="w-12 h-12 bg-gray-50 rounded shrink-0 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm font-semibold text-babyshopSky mt-0.5">
                          ${product.price}
                        </p>
                        <p className="text-sm text-babyshopTextLight">
                          {product.category?.name || "No Category"} - {product.brand?.name || "No Brand"}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <AddToCartButton product={product} />
                </div>
              ))}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <Link
                  href={`/client/devices?search=${encodeURIComponent(search)}`}
                  onClick={() => {
                    setShowResults(false);
                  }}
                  className="text-sm text-babyshopSky font-medium hover:underline"
                >
                  View all results
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                {!search ? (
                  <p className="text-sm font-medium text-gray-700">Popular Products</p>
                ) : (
                  <p className="text-sm font-medium text-gray-700">
                    No results for &quot;<span className="text-babyshopRed">{search}</span>&quot;
                  </p>
                )}
              </div>
              <div>
                {featuredProducts.map((item) => (
                  <div
                    key={item._id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <button
                      onClick={() => {
                        setSearch(item.name);
                        setShowResults(true);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:cursor-pointer"
                    >
                      <Search className="text-babyshopText w-5 h-5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </h3>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
