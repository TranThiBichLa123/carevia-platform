import ShopPage from "@/components/pages/shop/ShopPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category } from "@/type";
import React from "react";

interface CategoriesResponse {
  categories: Category[];
}

const ShopPageServer = async () => {
  const brands = await fetchData<Brand[]>("/brands");
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const data = await fetchData<CategoriesResponse>("/categories");
    categories = data.categories;
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
    console.log("error", error);
  }
  return (
    <div>
      <ShopPage categories={categories} brands={brands} />
    </div>
  );
};

export default ShopPageServer;
