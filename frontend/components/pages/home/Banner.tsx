import { fetchData, hasExplicitApiEndpoint } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Banners } from "@/type";



// Mock data cho banner khi API không trả về dữ liệu
const mockBanners: Banners[] = [
  {
    _id: "1",
    name: "Thử ngay",
    title: "Trải nghiệm miễn phí tại showroom",
    image: "https://images.unsplash.com/photo-1635752499637-91f2d64a41a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHVzaW5nJTIwc2tpbmNhcmUlMjBkZXZpY2V8ZW58MXx8fHwxNzc1NjY3MTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    startFrom: new Date().getTime(),
    bannerType: "featured",
  },
  {
    _id: "2",
    name: "Special Offer",
    title: "Up To 50% Off",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop",
    startFrom: new Date().getTime(),
    bannerType: "featured",
  },
];

const Banner = async () => {
  let banners: Banners[] = [];

  if (hasExplicitApiEndpoint()) {
    try {
      const data = await fetchData<Banners[]>("/banners");
      banners = data;
    } catch {
      banners = [];
    }
  }

  // Sử dụng mock data nếu API không trả về dữ liệu
  if (banners?.length === 0) {
    banners = mockBanners;
  }

  const imageOne = banners[0];
  const imageTwo = banners[1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="md:col-span-3 relative group overflow-hidden rounded-md">
        <Image
          src={imageOne?.image}
          alt="bannerImage"
          width={800}
          height={500}
          priority
          className="w-full h-72 md:min-h-100 object-cover group-hover:scale-110 hoverEffect"
        />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col gap-3 items-center justify-center">
          <p className="text-amber-400 font-semibold text-sm italic">{imageOne?.name}</p>
          <h2 className="text-3xl md:text-4xl font-medium max-w-md text-center capitalize text-gray-900">
            {imageOne?.title}
          </h2>
          <Link
            href={"/shop"}
            className="bg-white rounded-full font-medium text-gray-900 px-6 py-2.5 text-base hover:bg-transparent hover:text-white hover:border-white border border-gray-200 hoverEffect"
          >
            Book Now
          </Link>
        </div>
      </div>
      <div className="relative group overflow-hidden rounded-md">
        <Image
          src={imageTwo?.image}
          alt="bannerImage"
          width={400}
          height={500}
          className="w-full h-72 md:min-h-100 object-cover group-hover:scale-110 hoverEffect"
        />
        <div className="absolute top-8 left-0 w-full h-full flex flex-col gap-2 items-center justify-start text-white">
          <p className="font-semibold text-sm">{imageTwo?.name}</p>
          <h2 className="text-2xl md:text-3xl font-medium max-w-48 text-center capitalize">
            {imageTwo?.title}
          </h2>
          <Link
            href={"/shop"}
            className="bg-white rounded-full font-medium text-gray-900 px-6 py-2.5 text-base hover:bg-transparent hover:text-white hover:border-white border border-gray-300 hoverEffect"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
