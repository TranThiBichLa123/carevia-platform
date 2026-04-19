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
       {
        protocol: 'https',
        hostname: 'www.wearebodybeautiful.com',
        pathname: '**',
      },
       {
        protocol: 'https',
        hostname: 'picsum.photos0', // Nếu bạn thực sự dùng domain có số 0 này
      },
       {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com', // Thêm dòng này
      },
       {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com', // Thêm dòng này
      },

    ]
  }
};

export default nextConfig;
