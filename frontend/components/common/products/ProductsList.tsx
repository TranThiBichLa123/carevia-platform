import { fetchData } from "../../../lib/api";
import { Product } from "@/type";
import React from "react";
import ProductCard from "./ProductCard";

interface ProductsResponse {
  products: Product[];
}

// Mock data cho products khi API không trả về dữ liệu
const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Baby Onesie Set",
    description: "Comfortable cotton onesie for babies",
    price: 29.99,
    discountPercentage: 10,
    stock: 50,
    averageRating: 4.5,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=300&fit=crop",
    category: { _id: "1", name: "Clothing", image: "", categoryType: "Featured" },
    brand: { _id: "1", name: "BabyBrand", image: "" },
    ratings: [],
  },
  {
    _id: "2",
    name: "Baby Bottle Set",
    description: "BPA-free baby bottle set",
    price: 19.99,
    discountPercentage: 0,
    stock: 100,
    averageRating: 4.8,
    image: "https://images.unsplash.com/photo-1584839404054-62c00e7b5a25?w=300&h=300&fit=crop",
    category: { _id: "2", name: "Feeding", image: "", categoryType: "Hot Categories" },
    brand: { _id: "2", name: "SafeBottle", image: "" },
    ratings: [],
  },
  {
    _id: "3",
    name: "Baby Blanket",
    description: "Soft and warm baby blanket",
    price: 34.99,
    discountPercentage: 15,
    stock: 30,
    averageRating: 4.7,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop",
    category: { _id: "3", name: "Bedding", image: "", categoryType: "Featured" },
    brand: { _id: "3", name: "CozyBaby", image: "" },
    ratings: [],
  },
  {
    _id: "4",
    name: "Baby Toy Set",
    description: "Educational toy set for babies",
    price: 24.99,
    discountPercentage: 20,
    stock: 75,
    averageRating: 4.6,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop",
    category: { _id: "4", name: "Toys", image: "", categoryType: "Hot Categories" },
    brand: { _id: "4", name: "PlayTime", image: "" },
    ratings: [],
  },
  {
    _id: "5",
    name: "Baby Stroller",
    description: "Lightweight and foldable stroller",
    price: 199.99,
    discountPercentage: 5,
    stock: 20,
    averageRating: 4.9,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop",
    category: { _id: "5", name: "Travel", image: "", categoryType: "Featured" },
    brand: { _id: "5", name: "MoveEasy", image: "" },
    ratings: [],
  },
];

const ProductsList = async () => {
  let products: Product[] = [];

  try {
    const data = await fetchData<ProductsResponse>("/products?perPage=10");
    products = data.products;
  } catch (error) {
    console.log("Product fetching Error:", error);
  }

  // Sử dụng mock data nếu API không trả về dữ liệu
  if (products?.length === 0) {
    products = mockProducts;
  }

  return (
    <div className="w-full bg-babyshopWhite border mt-3 rounded-md">
      <div className="w-full p-5 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products?.map((product) => (
          <ProductCard key={product?._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
