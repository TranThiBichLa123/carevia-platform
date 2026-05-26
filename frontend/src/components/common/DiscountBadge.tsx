import { cn, formatDiscountPercentage } from "../../lib/utils";

interface Props {
  discountPercentage: number;
  className?: string;
}

const DiscountBadge = ({ discountPercentage, className }: Props) => {
  // Kiểm tra nếu không có discount thì không hiển thị
  if (!discountPercentage || discountPercentage <= 0) return null;

  const displayDiscountPercentage = formatDiscountPercentage(discountPercentage);

  return (
    <div
      className={cn(
        "absolute top-0 right-0 bg-[red] text-white font-bold px-3 py-2.5 rounded-bl-2xl z-10 flex flex-col items-center leading-none",
        className
      )}
    >
      <span className="text-lg">{displayDiscountPercentage}%</span>
      <span className="text-xs mt-0.5">OFF</span>
    </div>
  );
};

export default DiscountBadge;