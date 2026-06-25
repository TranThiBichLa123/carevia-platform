"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { AddressSelection } from "@/components/common/AddressSelection";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input"; // Thêm Input từ UI component của bạn
import PriceFormatter from "@/components/common/PriceFormatter";
import { CreditCard, Lock, CheckCircle, AlertCircle, Ticket } from "lucide-react";
import Image from "next/image";
import { getOrderById, type Order, createOrderFromCart, OrderStatus, PaymentStatus } from "@/lib/orderApi";
import { createZaloPayOrder } from "@/lib/zaloPayApi";
import { useUserStore, useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { Address } from "@/types_enum/devices";
import { deviceApi } from "@/lib/deviceApi";

const getProductId = (product: { id?: string; _id?: string }) =>
  product.id || product._id || "";

const CheckoutPageContent = () => {
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [vouchersList, setVouchersList] = useState<any[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { auth_token, authUser, isAuthenticated, verifyAuth } = useUserStore();
  const { cartItemsWithQuantities, clearCart } = useCartStore();

  const orderId = searchParams.get("orderId");
  const isBuyNow = searchParams.get("buyNow") === "true";

  // Verify authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) {
        await verifyAuth();
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !authUser || !auth_token) {
      toast.error("Đăng nhập để tiếp tục thanh toán");
      router.push("/auth/signin");
      return;
    }

    // Load user addresses
    if (authUser.addresses && authUser.addresses.length > 0) {
      setAddresses(authUser.addresses);
      if (authUser.addresses.length === 1) {
        setSelectedAddress(authUser.addresses[0]);
      } else {
        const defaultAddress = authUser.addresses.find((addr) => addr.isDefault);
        setSelectedAddress(defaultAddress || authUser.addresses[0]);
      }
    }

    const initializeCheckout = async () => {
      setLoading(true);
      try {
        let currentOrder: Order | null = null;

        if (orderId) {
          const orderData = await getOrderById(orderId, auth_token);
          if (orderData) {
            currentOrder = orderData;
          } else {
            toast.error("Không tìm thấy đơn hàng");
            router.push("/client/user/cart");
            return;
          }
        } else if (isBuyNow) {
          const raw = sessionStorage.getItem("buyNowItem");
          if (!raw) {
            toast.error("Không tìm thấy sản phẩm. Vui lòng thử lại.");
            router.push("/client/devices");
            return;
          }
          const { product, quantity } = JSON.parse(raw) as {
            product: { id?: string; _id?: string; name: string; image: string; price: number };
            quantity: number;
          };
          const rawId = getProductId(product);
          currentOrder = {
            _id: "temp",
            id: 0,
            orderCode: `TEMP-${Date.now()}`,
            accountId: 0,
            userId: Number(authUser._id),
            items: [{
              id: 0,
              deviceId: Number(rawId),
              deviceName: product.name,
              deviceImage: product.image,
              productId: String(rawId),
              name: product.name,
              image: product.image,
              price: product.price,
              unitPrice: product.price,
              quantity,
              subtotal: product.price * quantity,
            }],
            shippingAddress: "",
            shippingCity: "",
            shippingCountry: "",
            shippingPostalCode: "",
            subtotal: product.price * quantity,
            total: product.price * quantity,
            totalAmount: product.price * quantity,
            discountAmount: 0,
            shippingFee: 0,
            taxAmount: 0,
            status: "PENDING_PAYMENT" as OrderStatus,
            paymentStatus: "PENDING" as PaymentStatus,
            paymentMethod: "STRIPE",
            paymentTransactionId: "",
            voucherCode: "",
            customerNote: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          if (cartItemsWithQuantities.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống");
            router.push("/client/user/cart");
            return;
          }

          currentOrder = {
            _id: "temp",
            id: 0,
            orderCode: `TEMP-${Date.now()}`,
            accountId: 0,
            userId: Number(authUser._id),
            items: cartItemsWithQuantities.map((item) => {
              const price = item.product.price;
              const quantity = item.quantity;
              const rawId = getProductId(item.product);

              return {
                id: 0,
                deviceId: Number(rawId),
                deviceName: item.product.name,
                deviceImage: item.product.image,
                productId: String(rawId),
                name: item.product.name,
                image: item.product.image,
                price: price,
                unitPrice: price,
                quantity: quantity,
                subtotal: price * quantity,
              };
            }),
            shippingAddress: "",
            shippingCity: "",
            shippingCountry: "",
            shippingPostalCode: "",
            subtotal: cartItemsWithQuantities.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            total: cartItemsWithQuantities.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            totalAmount: cartItemsWithQuantities.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            discountAmount: 0,
            shippingFee: 0,
            taxAmount: 0,
            status: "PENDING_PAYMENT" as OrderStatus,
            paymentStatus: "PENDING" as PaymentStatus,
            paymentMethod: "STRIPE",
            paymentTransactionId: "",
            voucherCode: "",
            customerNote: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        setOrder(currentOrder);

        // 🌟 LẤY DANH SÁCH VOUCHER HỆ THỐNG DỰA TRÊN THIẾT BỊ ĐẦU TIÊN
        if (currentOrder && currentOrder.items.length > 0) {
          const firstDeviceId = currentOrder.items[0].deviceId || currentOrder.items[0].productId;
          if (firstDeviceId) {
            const voucherData = await deviceApi.getVouchersByDeviceId(String(firstDeviceId));
            setVouchersList(voucherData || []);
          }
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
        toast.error("Không thể tải thông tin thanh toán");
        router.push("/client/user/cart");
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [orderId, isBuyNow, auth_token, router, isAuthenticated, authUser, authLoading, cartItemsWithQuantities]);

  const handleAddressesUpdate = (updatedAddresses: Address[]) => {
    setAddresses(updatedAddresses);
    if (updatedAddresses.length === 1) {
      setSelectedAddress(updatedAddresses[0]);
    } else if (updatedAddresses.length > 1) {
      const defaultAddress = updatedAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (!selectedAddress || !updatedAddresses.find((addr) => addr._id === selectedAddress._id)) {
        setSelectedAddress(updatedAddresses[0]);
      }
    } else {
      setSelectedAddress(null);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      const voucher = await deviceApi.getVoucherByCode(voucherCode.trim());

      if (!voucher) {
        toast.error("Mã giảm giá không tồn tại hoặc đã hết hạn");
        return;
      }

      const subtotal = calculateSubtotal();

      if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
        toast.error(`Mã này chỉ áp dụng cho đơn hàng từ ${voucher.minOrderValue.toLocaleString()} đ trở lên`);
        return;
      }

      let discount = 0;
      if (voucher.voucherType === "PERCENTAGE") {
        discount = (subtotal * voucher.discountValue) / 100;
      } else {
        discount = voucher.discountValue;
      }

      setDiscountAmount(discount);
      setAppliedVoucher(voucher);
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      console.error("Lỗi áp dụng voucher:", error);
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    // Đơn hàng trên 500.000 đ được miễn phí ship, ngược lại tính phí 30.000 đ
    return subtotal > 500000 ? 0 : 30000;
  };

  const calculateTotal = () => {
    const finalTotal = calculateSubtotal() + calculateShipping() - discountAmount;
    return finalTotal < 0 ? 0 : finalTotal;
  };

  const handleStripeCheckout = async () => {
    if (!order) return;

    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setProcessing(true);
    try {
      let finalOrder = order;

      if (order._id === "temp") {
        setIsCreatingOrder(true);

        let orderItems;
        if (isBuyNow) {
          const raw = sessionStorage.getItem("buyNowItem");
          if (!raw) throw new Error("Không tìm thấy thông tin mua ngay");
          const { product, quantity } = JSON.parse(raw) as { product: { id?: string; _id?: string; name: string; price: number; image: string }; quantity: number };
          orderItems = [{
            _id: getProductId(product),
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
          }];
        } else {
          orderItems = cartItemsWithQuantities.map((item) => ({
            _id: getProductId(item.product),
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          }));
        }

        const response = await createOrderFromCart(
          auth_token!,
          orderItems,
          {
            street: selectedAddress.street,
            ward: selectedAddress.ward,
            district: selectedAddress.district,
            city: selectedAddress.city,
            voucherCode: appliedVoucher ? appliedVoucher.code : undefined
          }
        );
        if (!response.success || !response.order) {
          throw new Error(response.message || "Tạo đơn hàng thất bại");
        }

        finalOrder = response.order;
        setOrder(finalOrder);

        if (isBuyNow) {
          sessionStorage.removeItem("buyNowItem");
        } else {
          await clearCart();
        }
        setIsCreatingOrder(false);
      }

      const successUrl = `${window.location.origin}/client/success?orderId=${finalOrder._id}`;
      const result = await createZaloPayOrder(finalOrder._id, auth_token!, successUrl);

      window.location.href = result.orderUrl;
    } catch (error) {
      console.error("Error processing payment:", error);
      const msg = error instanceof Error ? error.message : "Không thể tạo thanh toán. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setProcessing(false);
      setIsCreatingOrder(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container className="py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <span>/</span>
              <Skeleton className="h-4 w-8" />
              <span>/</span>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-6 w-24 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h1>
            <p className="text-gray-600 mb-6">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa bỏ.</p>
            <Button onClick={() => router.push("/client/user/cart")}>Quay lại giỏ hàng</Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="">
      <div className="my-4">
        <PageBreadcrumb
          items={[
            { label: "Tất cả sản phẩm", href: "/client/devices" },
            { label: order.items[0]?.name ?? "Sản phẩm", href: `/client/devices/${order.items[0]?.productId}` },
          ]}
          currentPage="Thanh toán"
          showSocialShare={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AddressSelection
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
            addresses={addresses}
            onAddressesUpdate={handleAddressesUpdate}
          />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết đơn hàng</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index.toString()} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity} × <PriceFormatter amount={item.price} />
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceFormatter amount={item.price * item.quantity} className="text-base font-semibold text-gray-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin thanh toán</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border-2 border-primary-light bg-primary-light/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Zalopay Checkout</h3>
                  <p className="text-sm text-gray-600">Thanh toán an toàn với ZaloPay (ví điện tử, thẻ ATM, thẻ quốc tế)</p>
                </div>
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Thông tin thanh toán của bạn được bảo mật và mã hóa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl font-vietnam border border-gray-100 shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tạm tính</span>
                <PriceFormatter amount={calculateSubtotal()} className="text-base font-medium text-gray-900" />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Vận chuyển</span>
                <span className="text-base font-medium">
                  {calculateShipping() === 0 ? (
                    <span className="text-green-600">Miễn phí vận chuyển</span>
                  ) : (
                    <PriceFormatter amount={calculateShipping()} className="text-base font-medium text-gray-900" />
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center py-2 text-red-500 font-semibold">
                  <span>Giảm giá (Voucher)</span>
                  <span>-<PriceFormatter amount={discountAmount} /></span>
                </div>
              )}

              <Separator className="my-2" />

              {/* 🌟 Ô NHẬP MÃ VOUCHER THỦ CÔNG */}
              <div className="space-y-2 py-2 font-vietnam">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-red-500" /> Nhập mã giảm giá thủ công:
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ví dụ: CAREVIA2026"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="h-9 font-vietnam text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300 border-gray-200"
                  />
                  <Button type="button" size="sm" onClick={handleApplyVoucher} className="bg-gray-900 hover:bg-black text-white h-9 px-4 text-xs">
                    Áp dụng
                  </Button>
                </div>
              </div>

              {/* KHỐI HIỂN THỊ DANH SÁCH VOUCHER KHẢ DỤNG */}
              <div className="pt-2">
                <label className="text-gray-600 text-sm font-medium block mb-2">
                  Voucher của hệ thống khả dụng:
                </label>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                  {vouchersList.length === 0 ? (
                    <p className="text-sm text-gray-400 italic pl-1">Không có mã giảm giá nào khả dụng cho đơn hàng này.</p>
                  ) : (
                    vouchersList.map((v) => {
                      const isSelected = appliedVoucher?.code === v.code;
                      const subtotal = calculateSubtotal();
                      const isNotEnoughCondition = v.minOrderValue && subtotal < v.minOrderValue;

                      return (
                        <div
                          key={v.code}
                          className={`p-2.5 border rounded-xl flex items-center justify-between transition-all ${isSelected ? "border-red-300 bg-red-100/70" : "border-red-100 bg-red-50/60 hover:bg-red-50"
                            } ${isNotEnoughCondition ? "opacity-60" : ""}`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-vietnam text-xs font-bold text-red-700 bg-white border border-red-200 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
                                {v.code}
                              </span>
                              {isSelected && <span className="text-[10px] text-red-600 font-bold">✓ Đang chọn</span>}
                            </div>
                            <p className="text-[11px] text-gray-600 mt-1 truncate">
                              {v.description || `Giảm ${v.discountValue.toLocaleString()}${v.voucherType === 'PERCENTAGE' ? '%' : 'đ'}`}
                            </p>
                          </div>

                          <Button
                            type="button"
                            disabled={!!(v.minOrderValue && subtotal < v.minOrderValue) && !isSelected}
                            onClick={() => {
                              if (isSelected) {
                                setAppliedVoucher(null);
                                setDiscountAmount(0);
                                setVoucherCode("");
                              } else {
                                let discount = 0;
                                if (v.voucherType === "PERCENTAGE") {
                                  discount = (subtotal * v.discountValue) / 100;
                                } else {
                                  discount = v.discountValue;
                                }
                                setDiscountAmount(discount);
                                setAppliedVoucher(v);
                                setVoucherCode(v.code);
                                toast.success(`Đã áp dụng mã ${v.code}`);
                              }
                            }}
                            className={`h-7 px-3 text-[11px] font-medium rounded-lg shrink-0 transition-colors ${isSelected ? "bg-gray-800 hover:bg-gray-900 text-white" : "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-200 disabled:text-gray-400"
                              }`}
                          >
                            {isSelected ? "Hủy" : "Chọn"}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {calculateShipping() === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-medium">🎉 Bạn đủ điều kiện để được miễn phí vận chuyển!</p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                <PriceFormatter amount={calculateTotal()} className="text-xl font-bold text-gray-900" />
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleStripeCheckout}
              disabled={processing || isCreatingOrder || !selectedAddress}
              className="w-full mt-6 bg-primary hover:bg-primary-dark text-white rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : isCreatingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang tạo đơn hàng...
                </>
              ) : !selectedAddress ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Vui lòng chọn địa chỉ để tiếp tục
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Thanh toán với Zalopay
                </>
              )}
            </Button>

            {!selectedAddress && (
              <div className="mt-2 text-center">
                <p className="text-sm text-amber-600">Vui lòng chọn địa chỉ giao hàng để tiếp tục</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Thanh toán an toàn • Mã hóa SSL • Hỗ trợ bởi ZaloPay</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </Container>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
};

export default CheckoutPage;