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

  return (
    <div className="hidden md:flex flex-col bg-white h-full rounded-xl shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Featured Categories Section */}
        <div className="p-5 pb-3">
          <p className="font-semibold mb-3 text-foreground">Featured</p>
          <div className="space-y-1.5">
            {featuredCategories.map((item) => (
              <a
                href={item.path}
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className="text-sm text-foreground group-hover:text-[#20afb2] transition-colors">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Hot Categories Section */}
        <div className="px-5 py-3">
          <p className="font-semibold mb-3 text-foreground">Hot Categories</p>
          <div className="space-y-1.5">
            {hotCategories.map((item) => (
              <a
                href={item.path}
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className="text-sm text-foreground group-hover:text-[#20afb2] transition-colors">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="px-5 py-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]" // Tăng độ dày lên 1.5px để sắc nét hơn
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)"
              // Đã tăng từ 0.1 lên 0.15 để màu xám đậm và rõ hơn
            }}
          />
          <p className="font-semibold mb-3 text-foreground">Quick Links</p>
          <div className="space-y-1.5">
            {quickLinks.map((item) => (
              <a
                href={item.path}
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className="text-sm text-foreground group-hover:text-[#20afb2] transition-colors">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Customer Support Section */}
        <div className="px-5 py-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]" // Tăng độ dày lên 1.5px để sắc nét hơn
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.17) 50%, transparent 100%)"
              // Đã tăng từ 0.1 lên 0.17 để màu xám đậm và rõ hơn
            }}
          />          <p className="font-semibold mb-3 text-foreground">Customer Support</p>
          <div className="space-y-1.5">
            {supportLinks.map((item) => (
              <a
                href={item.path}
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className="text-sm text-foreground group-hover:text-[#20afb2] transition-colors">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Booking Section */}
        <div className="px-5 py-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]" // Tăng độ dày lên 1.5px để sắc nét hơn
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)"
              // Đã tăng từ 0.1 lên 0.15 để màu xám đậm và rõ hơn
            }}
          />          <p className="font-semibold mb-3 text-foreground">Đặt lịch trải nghiệm</p>
          <div className="space-y-1.5">
            <a
              href="/booking"
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
            >
              <span className="text-xl flex-shrink-0">📅</span>
              <span className="text-sm text-foreground group-hover:text-[#20afb2] transition-colors">
                Đặt lịch ngay
              </span>
            </a>
            <a
              href="/my-bookings"
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
            >
              <span className="text-xl flex-shrink-0">⏰</span>
              <span className="text-sm text-foreground group-hover:text-[#20afb2] transition-colors">
                Lịch của tôi
              </span>
            </a>
          </div>
        </div>

        {/* Special Offer Banner */}
        <div className="px-5 py-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]" // Tăng độ dày lên 1.5px để sắc nét hơn
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)"
              // Đã tăng từ 0.1 lên 0.15 để màu xám đậm và rõ hơn
            }}
          />             <p className="font-semibold mb-3 text-foreground">Ưu đãi đặc biệt</p>
          <div className="bg-gradient-to-br from-[#ecf8f9] via-[#ecf8f9] to-[#f6fcfc] p-4 rounded-xl border border-transparent">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground mb-1">Miễn phí vận chuyển</p>
                <p className="text-xs text-muted-foreground mb-2">Cho đơn hàng trên 1 triệu</p>
                <a href="/devices" className="text-xs text-[#20afb2] font-medium hover:underline">
                  Mua sắm ngay →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Skin Type Section */}
        <div className="px-5 py-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]" // Tăng độ dày lên 1.5px để sắc nét hơn
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)"
              // Đã tăng từ 0.1 lên 0.15 để màu xám đậm và rõ hơn
            }}
          />          <p className="font-semibold mb-3 text-foreground">Shop by Skin Type</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/devices?skinType=dry"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
            >
              <span className="text-2xl">🌸</span>
              <span className="text-xs text-foreground text-center group-hover:text-[#20afb2] transition-colors duration-200">
                Da khô</span>
            </a>
            <a
              href="/devices?skinType=oily"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
            >
              <span className="text-2xl">☀️</span>
              <span className="text-xs text-foreground text-center group-hover:text-[#20afb2] transition-colors duration-200">
                Da dầu</span>
            </a>
            <a
              href="/devices?skinType=sensitive"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
            >
              <span className="text-2xl">💗</span>
              <span className="text-xs text-foreground text-center group-hover:text-[#20afb2] transition-colors duration-200">
                Da nhạy cảm</span>
            </a>
            <a
              href="/devices?skinType=combination"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#ecf8f9] transition-all duration-200 group"
            >
              <span className="text-2xl">✨</span>
              <span className="text-xs text-foreground text-center group-hover:text-[#20afb2] transition-colors duration-200">
                Da hỗn hợp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
