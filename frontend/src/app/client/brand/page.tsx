import { deviceApi, BrandData } from "@/lib/deviceApi";
import BrandListPage from "@/components/pages/brand/BrandListPage";
import React from "react";

const BrandPageServer = async () => {
  let brands: BrandData[] = [];
  try {
    brands = await deviceApi.getBrands();
  } catch (e) {
    console.error("Error loading brands:", e);
  }
  return <BrandListPage brands={brands} />;
};

export default BrandPageServer;
