import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { deviceApi, type CategoryData } from "@/lib/deviceApi";

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: 'featured' | 'hot';
  path: string;
}

const CategoriesSection = () => {
  const [apiCategories, setApiCategories] = useState<CategoryData[]>([]);
  const [apiSkinTypes, setApiSkinTypes] = useState<string[]>([]);

  useEffect(() => {
    deviceApi.getCategories()
      .then(setApiCategories)
      .catch(console.error);
    deviceApi.getSkinTypes()
      .then(setApiSkinTypes)
      .catch(console.error);
  }, []);

  const categoryEmojis: Record<string, string> = {
    'da mặt': '💆', 'chăm sóc da': '🧴', 'làm sạch': '🫧',
    'nâng cơ': '✨', 'trẻ hóa': '🌟', 'giảm béo': '⚡',
    'triệt lông': '🔆', 'sắc tố': '🎯', 'trị nám': '☀️',
    'massage': '💆', 'mắt': '👁️', 'tóc': '💇', 'body': '🧖',
    'công nghệ': '🔬', 'laser': '💡', 'sẹo': '🩹',
  };
  const categoryFallbacks = ['🌸', '💜', '🌿', '💫', '🎀', '🌺', '💎', '🦋'];

  const hotCategories = apiCategories.map((cat, index) => {
    const lower = cat.name.toLowerCase();
    const matchedKey = Object.keys(categoryEmojis).find(key => lower.includes(key));
    const emoji = matchedKey ? categoryEmojis[matchedKey] : categoryFallbacks[index % categoryFallbacks.length];
    return {
      id: String(cat.id),
      name: cat.name,
      emoji,
      path: `/client/devices?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`,
    };
  });

  // Gợi ý dành cho bạn — xếp hạng bởi thuật toán Fuzzy TOPSIS
  // Tiêu chí: phù hợp loại da (BENEFIT), đánh giá (BENEFIT), lượt bán (BENEFIT), giá (COST)
  const recommendationItems: Category[] = [
    { id: 'r1', name: 'Phổ biến nhất', emoji: '🔥', color: '#FF8A65', type: 'featured', path: `/client/devices?categoryName=${encodeURIComponent('Phổ biến nhất')}&sortBy=best_selling` },
    { id: 'r2', name: 'Đánh giá cao nhất', emoji: '⭐', color: '#FFD54F', type: 'featured', path: `/client/devices?categoryName=${encodeURIComponent('Đánh giá cao nhất')}&sortBy=rating_desc` },
    { id: 'r3', name: 'Giá thấp nhất', emoji: '💰', color: '#2196F3', type: 'featured', path: `/client/devices?categoryName=${encodeURIComponent('Giá thấp nhất')}&sortBy=price_asc` },
    { id: 'r4', name: 'Sản phẩm phù hợp nhất', emoji: '🌟', color: '#4CAF50', type: 'featured', path: '/client/recommendations/devices' },
    { id: 'r5', name: 'Đặt lịch phù hợp nhất', emoji: '📅', color: '#9C27B0', type: 'featured', path: '/client/booking' },
  ];

  // Danh mục hot - loaded from API (see apiCategories above)
  // Quick Links
  const quickLinks = [
    { id: 'q1', name: 'Tất cả sản phẩm', emoji: '🛍️', color: '#4FC3F7', path: '/devices' },
    { id: 'q2', name: 'Sản phẩm mới', emoji: '🆕', color: '#66BB6A', path: '/new-arrivals' },
    { id: 'q3', name: 'Dưới 1 triệu', emoji: '💰', color: '#FFA726', path: '/under-1m' },
    { id: 'q4', name: 'Đơn hàng của tôi', emoji: '📦', color: '#AB47BC', path: '/account?tab=orders' },
  ];

  // Customer Support
  const supportLinks = [
    { id: 's1', name: 'Trung tâm hỗ trợ', emoji: '❓', color: '#42A5F5', path: '/help' },
    { id: 's2', name: 'Thông tin giao hàng', emoji: '🚚', color: '#66BB6A', path: '/shipping' },
    { id: 's3', name: 'Đổi trả & hoàn tiền', emoji: '↩️', color: '#FFA726', path: '/returns' },
    { id: 's4', name: 'Liên hệ', emoji: '📞', color: '#EC407A', path: '/contact' },
  ];

  // Skin Types - loaded from API
  const skinTypeEmojis: Record<string, string> = {
    'da dầu': '💧', 'da khô': '🌵', 'da hỗn hợp': '⚖️',
    'da nhạy cảm': '🛡️', 'da thường': '✨', 'mọi loại da': '🌟',
  };

  const skinTypes = apiSkinTypes.map((st, index) => {
    const lower = st.toLowerCase();
    const matchedKey = Object.keys(skinTypeEmojis).find(key => lower.includes(key));
    const emoji = matchedKey ? skinTypeEmojis[matchedKey] : '🌿';
    return {
      id: `st${index}`,
      name: st,
      emoji,
      path: `/client/devices?skinType=${encodeURIComponent(st)}&skinTypeName=${encodeURIComponent(st)}`,
    };
  });


  // Helper component cho từng Menu Item có Dropdown
  const NavItem = ({ title, items, path }: { title: string, items?: any[], path?: string }) => (
    <div className="relative group h-full flex items-center">
      <a
        href={path || "#"}
        className="flex items-center gap-1 px-4 h-full text-[13px]  font-vietnam font-bold uppercase text-gray-800 hover:text-primary transition-colors whitespace-nowrap"
      >
        {title}
        {items && <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />}
      </a>

      {/* Dropdown Menu */}
      {items && (
        <div className="absolute top-full left-0 z-60 w-64 rounded-b-md border border-gray-100 bg-white py-2 shadow-xl opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
          {items.map((sub, index) => (
            <a
              key={index}
              href={sub.path}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-600 hover:bg-[#f5fbfc] hover:text-primary transition-colors group/item"
            >
              {sub.emoji && <span>{sub.emoji}</span>}
              <span className="flex-1">{sub.name}</span>
              <ChevronRight size={13} className="text-gray-300 group-hover/item:text-primary transition-colors" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <nav className="hidden md:flex items-center bg-white h-12 border-t border-gray-100">
      {/* 1. DANH MỤC SẢN PHẨM */}
      {/* 1. DANH MỤC SẢN PHẨM */}
      <div className="flex items-center gap-2 py-3 pr-2 cursor-pointer hover:text-primary transition-colors border-r border-gray-100">
        <Menu size={18} />
        <span className="text-[13px] font-vietnam font-semibold uppercase whitespace-nowrap">
          Danh mục sản phẩm
        </span>
      </div>


      {/* 2. DANH MỤC NỔI BẬT */}
      <NavItem title="Danh mục nổi bật" items={hotCategories} />

      {/* 3. GỢI Ý CHO BẠN — Fuzzy TOPSIS */}
      <NavItem title="Gợi ý cho bạn" items={recommendationItems} />

      {/* 4. TRUY CẬP NHANH */}
      <NavItem title="Truy cập nhanh" items={[
        { name: 'Tất cả sản phẩm', emoji: '🛍️', path: '/client/devices' },
        { name: 'Sản phẩm mới', emoji: '🆕', path: '/client/new-arrivals' },
        { name: 'Dưới 1 triệu', emoji: '💰', path: '/client/under-1m' },
        { name: 'Đơn hàng của tôi', emoji: '📦', path: '/client/account?tab=orders' }
      ]} />

      {/* 5. ĐẶT LỊCH TRẢI NGHIỆM (Đã thêm Dropdown) */}
      <NavItem
        title="Đặt lịch trải nghiệm"
        items={[
          { name: 'Đặt lịch ngay', emoji: '📅', path: '/client/booking' },
          { name: 'Lịch hẹn của tôi', emoji: '📋', path: '/client/my-bookings' }
        ]}
      />
      {/* 6. MUA THEO LOẠI DA */}
      <NavItem title="Mua theo loại da" items={skinTypes} />
      {/* 7. HỖ TRỢ KHÁCH HÀNG */}
      <NavItem
        title="Hỗ trợ khách hàng"
        items={[
          { name: 'Trung tâm hỗ trợ', emoji: '❓', path: '/help-center' },
          { name: 'Thông tin giao hàng', emoji: '🚚', path: '/shipping-policy' },
          { name: 'Đổi trả & Hoàn tiền', emoji: '🔄', path: '/returns' },
          { name: 'Liên hệ', emoji: '📞', path: '/contact' }
        ]}
      />

    </nav>
  );
};

export default CategoriesSection;
