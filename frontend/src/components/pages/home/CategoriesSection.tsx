import { ChevronDown, Menu } from "lucide-react";

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: 'featured' | 'hot';
  path: string;
}

const CategoriesSection = () => {
  // Danh mục nổi bật
  const featuredCategories: Category[] = [
    { id: '1', name: 'Ưu đãi Carevia', emoji: '💎', color: '#E91E63', type: 'featured', path: '/deals' },
    { id: '2', name: 'Ưu đãi trong ngày', emoji: '⭐', color: '#4FC3F7', type: 'featured', path: '/daily-deals' },
    { id: '3', name: 'Bán chạy nhất', emoji: '🌟', color: '#FFD54F', type: 'featured', path: '/bestsellers' },
    { id: '4', name: 'Ý tưởng quà tặng', emoji: '🎁', color: '#FF8A65', type: 'featured', path: '/gift-ideas' },
    { id: '5', name: 'Dưới 2 triệu', emoji: '💝', color: '#BA68C8', type: 'featured', path: '/under-2m' },
  ];

  // Danh mục hot
  const hotCategories: Category[] = [
    { id: '6', name: 'Thiết bị làm sạch', emoji: '💧', color: '#4FC3F7', type: 'hot', path: '/devices/cleansing' },
    { id: '7', name: 'Máy massage mặt', emoji: '✨', color: '#BA68C8', type: 'hot', path: '/devices/massage' },
    { id: '8', name: 'Chống lão hóa', emoji: '🌸', color: '#FF6B9D', type: 'hot', path: '/devices/anti-aging' },
    { id: '9', name: 'Công nghệ ánh sáng', emoji: '💡', color: '#FFB74D', type: 'hot', path: '/devices/light-therapy' },
    { id: '10', name: 'Máy đắp mặt nạ', emoji: '🧴', color: '#FF8A65', type: 'hot', path: '/devices/mask' },
    { id: '11', name: 'Dưỡng ẩm da', emoji: '💦', color: '#4DB6AC', type: 'hot', path: '/devices/hydration' },
    { id: '12', name: 'Chăm sóc ban đêm', emoji: '🌙', color: '#7986CB', type: 'hot', path: '/devices/night-care' },
    { id: '13', name: 'Chăm sóc mắt & môi', emoji: '👁️', color: '#F06292', type: 'hot', path: '/devices/eye-lip' },
    { id: '14', name: 'Thiết bị làm mát da', emoji: '❄️', color: '#81D4FA', type: 'hot', path: '/devices/cooling' },
    { id: '15', name: 'Thiết bị làm ấm', emoji: '🔥', color: '#FFAB91', type: 'hot', path: '/devices/warming' },
  ];

  // Quick Links
  const quickLinks = [
    { id: 'q1', name: 'Tất cả sản phẩm', emoji: '🛍️', color: '#4FC3F7', path: '/devices' },
    { id: 'q2', name: 'Sản phẩm mới', emoji: '🆕', color: '#66BB6A', path: '/new-arrivals' },
    { id: 'q3', name: 'Dưới 1 triệu', emoji: '💰', color: '#FFA726', path: '/under-1m' },
    { id: 'q4', name: 'Đơn hàng của tôi', emoji: '📦', color: '#AB47BC', path: '/my-orders' },
  ];

  // Customer Support
  const supportLinks = [
    { id: 's1', name: 'Trung tâm hỗ trợ', emoji: '❓', color: '#42A5F5', path: '/help' },
    { id: 's2', name: 'Thông tin giao hàng', emoji: '🚚', color: '#66BB6A', path: '/shipping' },
    { id: 's3', name: 'Đổi trả & hoàn tiền', emoji: '↩️', color: '#FFA726', path: '/returns' },
    { id: 's4', name: 'Liên hệ', emoji: '📞', color: '#EC407A', path: '/contact' },
  ];

  // Skin Types
  const skinTypes = [
    { id: 'st1', name: 'Da dầu', emoji: '💧', color: '#4FC3F7', path: '/skin-type/oily' },
    { id: 'st2', name: 'Da khô', emoji: '🏜️', color: '#FFAB91', path: '/skin-type/dry' },
    { id: 'st3', name: 'Da hỗn hợp', emoji: '⚖️', color: '#FFD54F', path: '/skin-type/combination' },
    { id: 'st4', name: 'Da nhạy cảm', emoji: '🌸', color: '#F06292', path: '/skin-type/sensitive' },
  ];

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
        <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] py-2 rounded-b-md">
          {items.map((sub, index) => (
            <a
              key={index}
              href={sub.path}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-600 hover:bg-[#f5fbfc] hover:text-primary transition-colors"
            >
              {sub.emoji && <span>{sub.emoji}</span>}
              {sub.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <nav className="hidden md:flex items-center bg-white h-12 border-t border-gray-100">
      {/* 1. DANH MỤC SẢN PHẨM */}
      <div className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:text-primary transition-colors border-r border-gray-100">
        <Menu size={18} />
        <span className="text-[13px]  font-vietnam font-semibold uppercase whitespace-nowrap">
          Danh mục sản phẩm
        </span>
      </div>

      {/* 2. DANH MỤC NỔI BẬT */}
      <NavItem title="Danh mục nổi bật" items={hotCategories} />

      {/* 3. GỢI Ý CHO BẠN */}
      <NavItem title="Gợi ý cho bạn" items={featuredCategories} />

      {/* 4. TRUY CẬP NHANH */}
      <NavItem title="Truy cập nhanh" items={[
        { name: 'Tất cả sản phẩm', emoji: '🛍️', path: '/client/devices' },
        { name: 'Sản phẩm mới', emoji: '🆕', path: '/new-arrivals' },
        { name: 'Dưới 1 triệu', emoji: '💰', path: '/under-1m' },
        { name: 'Đơn hàng của tôi', emoji: '📦', path: '/my-orders' }
      ]} />

      {/* 5. ĐẶT LỊCH TRẢI NGHIỆM (Đã thêm Dropdown) */}
      <NavItem
        title="Đặt lịch trải nghiệm"
        items={[
          { name: 'Đặt lịch ngay', emoji: '📅', path: '/client/booking' },
          { name: 'Lịch của tôi', emoji: '📋', path: '/client/my-bookings' }
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
          { name: 'Đổi trả & Hoàn tiền', emoji: '🔄', path: '/returns-refunds' },
          { name: 'Liên hệ', emoji: '📞', path: '/contact' }
        ]}
      />

    </nav>
  );
};

export default CategoriesSection;
