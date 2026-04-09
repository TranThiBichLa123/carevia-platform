import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"res.cloudinary.com"
        // port:"",
        // pathname:"/**"
      },
      {
        protocol:"https",
        hostname:"images.unsplash.com"
      },
       {
        protocol: "https",
        hostname: "picsum.photos", // Thêm dòng này để sửa lỗi bạn đang gặp
      },
    ]
  }
};

export default nextConfig;
