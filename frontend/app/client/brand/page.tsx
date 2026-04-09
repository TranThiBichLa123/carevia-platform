import ShopPage from "@/components/pages/shop/ShopPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category } from "@/type";
import React from "react";

interface CategoriesResponse {
  categories: Category[];
}

const getFetchErrorMessage = (error: unknown, resource: string) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  return `Unable to load ${resource}: ${message}`;
};

const ShopPageServer = async () => {
  let brands: Brand[] = [];
  let categories: Category[] = [];
  let error: string | null = null;

  const [brandsResult, categoriesResult] = await Promise.allSettled([
    fetchData<Brand[]>("/brands"),
    fetchData<CategoriesResponse>("/categories"),
  ]);

  if (brandsResult.status === "fulfilled") {
    brands = brandsResult.value;
  } else {
    error = getFetchErrorMessage(brandsResult.reason, "brands");
    console.error(error);
  }

  if (categoriesResult.status === "fulfilled") {
    categories = categoriesResult.value.categories;
  } else {
    const categoriesError = getFetchErrorMessage(
      categoriesResult.reason,
      "categories"
    );
    error = error ? `${error}. ${categoriesError}` : categoriesError;
    console.error(categoriesError);
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}
      <ShopPage categories={categories} brands={brands} />
    </div>
  );
};

export default ShopPageServer;
