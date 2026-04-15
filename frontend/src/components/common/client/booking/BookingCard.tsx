import { Product } from "@/types_enum/devices";
import Image from "next/image";
import React, { memo } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
interface Props {
  device: Product;
  onSelect: (device: Product) => void;
}

const BookingCard = ({ device, onSelect }: Props) => {
  return (
    <Link href={`/client/booking/${device?._id}`} className="border border-gray-100 rounded-xl group overflow-hidden w-full relative bg-white hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Phần hình ảnh tương tự ProductCard */}
      <div className="overflow-hidden relative block aspect-video">
        <Image
          src={device?.image}
          width={500}
          height={500}
          alt={device?.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badge Hot Trial nếu giá bằng 0, style tương tự DiscountBadge */}
        {device?.bookingPrice === 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-sm z-10 animate-pulse">
            HOT TRIAL
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-2">
        {/* Category mờ phía trên */}
        <p className="uppercase text-[10px] tracking-wider font-semibold text-gray-400">
          {device?.category?.name || "Clinic Tech"}
        </p>
        
        {/* Tên thiết bị - Style tương tự ProductCard */}
        <h3 className="line-clamp-2 text-sm h-10 font-bold text-gray-800 group-hover:text-primary transition-colors uppercase leading-tight">
          {device?.name}
        </h3>

        {/* Mô tả ngắn (Thay cho phần giá của ProductCard) */}
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed italic">
          {device?.description}
        </p>

        <hr className="border-gray-100 my-2" />

        {/* Phần giá trải nghiệm và Nút đặt lịch */}
        <div className="mt-auto pt-2 flex flex-col space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Giá trải nghiệm</p>
              <p className="text-base font-black text-primary">
                {device?.bookingPrice > 0 ? `${device?.bookingPrice} USD` : 'MIỄN PHÍ'}
              </p>
            </div>
            
            {/* Icon phụ trợ */}
            <div className="text-gray-300 group-hover:text-primary transition-colors">
                <CalendarCheck size={18} />
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(device);
            }}
            className="w-full bg-black text-white py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-md shadow-black/5"
          >
            Đặt lịch trải nghiệm
          </button>
        </div>
      </div>
    </Link>
  );
};

export default memo(BookingCard);
