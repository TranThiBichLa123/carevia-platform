import { twMerge } from "tailwind-merge";

interface Props {
  amount: number | undefined | null; // Thêm null để an toàn
  className?: string;
}

const PriceFormatter = ({ amount, className }: Props) => {
  // Kiểm tra nếu không có số hoặc không phải là số (vẫn hiển thị nếu là 0)
  if (amount === undefined || amount === null) return null;

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <span className={twMerge("text-sm font-semibold text-tech_dark_color", className)}>
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
