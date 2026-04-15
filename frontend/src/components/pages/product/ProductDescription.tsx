"use client";
import { Star, MessageSquare, Store, ChevronRight, Package, MapPin, Award } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types_enum/devices';

interface ProductDescriptionProps {
  product?: Product;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'brand' | 'reviews' | 'questions'>('description');

  const tabs = [
    { id: 'description' as const, label: 'MÔ TẢ SẢN PHẨM' },
    { id: 'brand' as const, label: 'THÔNG TIN SHOP' },
    { id: 'reviews' as const, label: 'ĐÁNH GIÁ (128)' },
    { id: 'questions' as const, label: 'HỎI ĐÁP' },
  ];

  const mockReviews = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      rating: 5,
      date: '15/03/2024',
      variant: 'Màu Xanh, Size L',
      comment: 'Sản phẩm rất tốt, chất lượng vượt mong đợi! Đóng gói cẩn thận, giao hàng nhanh. Sẽ ủng hộ shop lần sau.',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=159fd8&color=fff'
    },
    {
      id: 2,
      user: 'Trần Thị B',
      rating: 5,
      date: '14/03/2024',
      variant: 'Màu Đỏ, Size M',
      comment: 'Rất hài lòng với sản phẩm, đúng như mô tả. Shop tư vấn nhiệt tình. Recommend!',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=ef4444&color=fff'
    },
    {
      id: 3,
      user: 'Lê Văn C',
      rating: 4,
      date: '13/03/2024',
      variant: 'Màu Đen, Size XL',
      comment: 'Sản phẩm tốt, giá hợp lý. Chỉ có điều giao hàng hơi lâu một chút.',
      avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=fbbf24&color=000'
    }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b-2 border-border bg-card overflow-x-auto scrollbar-hide ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card">
        
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-6 p-6">
            {/* Product Specifications */}
            <div className="bg-muted/30 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Package size={20} className="text-primary" />
                Chi tiết sản phẩm
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="grid grid-cols-3 py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Danh mục</span>
                  <span className="col-span-2 text-foreground font-medium">
                    Túi xách <ChevronRight size={14} className="inline" /> Túi xách nữ <ChevronRight size={14} className="inline" /> Túi xách cao cấp
                  </span>
                </div>
                <div className="grid grid-cols-3 py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Thương hiệu</span>
                  <span className="col-span-2 text-primary font-bold">{product?.brand?.name || 'Premium Brand'}</span>
                </div>
                <div className="grid grid-cols-3 py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Kho hàng</span>
                  <span className="col-span-2 text-foreground font-medium">1,254 sản phẩm</span>
                </div>
                <div className="grid grid-cols-3 py-3">
                  <span className="text-muted-foreground font-medium">Gửi từ</span>
                  <span className="col-span-2 text-foreground font-medium flex items-center gap-2">
                    <MapPin size={16} className="text-accent" />
                    Quận Tân Bình, TP. Hồ Chí Minh
                  </span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Mô tả sản phẩm</h3>
              <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
                <p>
                  {product?.description || 
                    'Túi xách cao cấp dành cho mẹ và bé được thiết kế với chất liệu da PU cao cấp, bền đẹp và thân thiện với môi trường. Sản phẩm có nhiều ngăn tiện dụng giúp bạn sắp xếp đồ dùng cho bé một cách khoa học và gọn gàng.'}
                </p>
                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                  <h4 className="font-bold text-foreground mb-2">✨ Đặc điểm nổi bật:</h4>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• Chất liệu da PU cao cấp, chống thấm nước</li>
                    <li>• Thiết kế nhiều ngăn tiện dụng</li>
                    <li>• Dây đeo chắc chắn, có thể điều chỉnh độ dài</li>
                    <li>• Phù hợp cho cả mẹ bầu và mẹ sau sinh</li>
                    <li>• Dễ dàng vệ sinh và bảo quản</li>
                  </ul>
                </div>
                <p className="text-foreground">
                  <strong>Kích thước:</strong> 35cm x 28cm x 15cm (Rộng x Cao x Sâu)
                </p>
                <p className="text-foreground">
                  <strong>Trọng lượng:</strong> 650g
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 border-2 border-border p-8 rounded-xl items-center shadow-sm bg-linear-to-br from-muted/20 to-background">
              <div className="relative w-24 h-24 rounded-full border-4 border-primary overflow-hidden bg-muted shrink-0 shadow-lg">
                <img 
                  src={product?.image || 'https://ui-avatars.com/api/?name=BabyShop&background=159fd8&color=fff&size=200'} 
                  alt="brand" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h4 className="font-bold text-2xl text-foreground flex items-center gap-2 justify-center md:justify-start">
                    BabyShop Official Store
                    <Award size={20} className="text-primary" />
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Online 2 giờ trước
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-bold">
                      <Star size={14} fill="currentColor" />
                      4.9 (15k đánh giá)
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center md:justify-start pt-2">
                  <button className="flex items-center gap-2 border-2 border-accent text-accent px-6 py-2.5 rounded-lg bg-accent/5 font-bold hover:bg-accent/10 hoverEffect shadow-sm">
                    <MessageSquare size={18} />
                    Chat ngay
                  </button>
                  <button className="flex items-center gap-2 border-2 border-primary text-primary px-6 py-2.5 rounded-lg font-bold hover:bg-primary/5 hoverEffect shadow-sm">
                    <Store size={18} />
                    Xem Shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="bg-linear-to-r from-accent/5 to-secondary/10 border-2 border-accent/20 p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:border-r-2 md:border-border md:pr-8">
                <div className="text-accent text-5xl font-bold">4.8</div>
                <div className="text-sm text-muted-foreground mt-1">trên 5</div>
                <div className="flex text-secondary mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill="currentColor" size={20} />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-2">128 đánh giá</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Tất Cả', '5 Sao (95)', '4 Sao (25)', '3 Sao (5)', 'Có Hình Ảnh (80)', 'Có Bình Luận (120)'].map((btn, idx) => (
                  <button
                    key={idx}
                    className={`px-5 py-2.5 text-sm font-medium border-2 rounded-lg hoverEffect ${
                      idx === 0
                        ? 'border-primary text-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="divide-y divide-border">
              {mockReviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-muted/30 hoverEffect">
                  <div className="flex gap-4">
                    <img
                      src={review.avatar}
                      alt={review.user}
                      className="w-12 h-12 rounded-full shrink-0 border-2 border-border shadow-sm"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-bold text-foreground">{review.user}</p>
                        <div className="flex text-secondary my-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} fill="currentColor" size={14} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {review.date} | Phân loại: {review.variant}
                        </p>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="p-16 text-center space-y-4">
            <MessageSquare size={64} className="mx-auto text-muted-foreground/30" />
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Chưa có câu hỏi nào</h3>
              <p className="text-muted-foreground">Hãy là người đầu tiên đặt câu hỏi về sản phẩm này!</p>
            </div>
            <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 hoverEffect shadow-md">
              Đặt câu hỏi ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
