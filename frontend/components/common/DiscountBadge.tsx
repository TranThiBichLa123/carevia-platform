import { cn } from "../../lib/utils";

interface Props {
  discountPercentage: number;
  className?: string;
}

const DiscountBadge = ({ discountPercentage, className }: Props) => {
  return (
    <span
      className={cn(
        "block bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold",
        className
      )}
    >
      -{discountPercentage}%
    </span>
  );
};

export default DiscountBadge;
