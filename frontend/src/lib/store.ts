import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { Product } from "@/types_enum/devices";
import { Order } from "./orderApi";
import authApi from "./authApi";
import type { CartItemInfo } from "./cartApi";

// Helper function to map server cart item to local format
interface CartServerItem {
    productId: {
        id: string;
        name: string;
        slug?: string;
        description: string;
        content?: string;
        price: number;
        originalPrice?: number;
        discountPercentage?: number;
        stock: number;
        averageRating?: number;
        image?: string;
        images?: string[];
        category:
        | string
        | {
            id: string;
            name: string;
            image: string;
            categoryType: string;
            slug?: string;
        };
        brand:
        | string
        | {
            id: string;
            name: string;
            slug?: string;
            image?: string;
        };
        ratings?: any[];
        sku?: string;
        warranty?: {
            period?: number;
            policy?: string;
        };
        origin?: string;
        condition?: Product["condition"];
        specifications?: Product["specifications"];
        sold?: number;
        reviewCount?: number;
        isBookingAvailable?: boolean;
        bookingPrice?: number;
        sessionIds?: string[];
        tags?: string[];
        videoUrl?: string;
        createdAt?: string;
    };
    quantity: number;
}

interface CartProductWithQuantity {
    product: Product;
    quantity: number;
}

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const mapCartItemToProduct = (
    item: CartServerItem
): CartProductWithQuantity => ({
    product: {
        id: item.productId.id,
        name: item.productId.name,
        slug: item.productId.slug || toSlug(item.productId.name || item.productId.id),
        description: item.productId.description,
        content: item.productId.content || item.productId.description,
        price: item.productId.price,
        originalPrice: item.productId.originalPrice || item.productId.price,
        discountPercentage: item.productId.discountPercentage || 0,
        stock: item.productId.stock,
        averageRating: item.productId.averageRating || 0,
        image: item.productId.image || item.productId.images?.[0] || "",
        images:
            item.productId.images?.length
                ? item.productId.images
                : item.productId.image
                    ? [item.productId.image]
                    : [],
        category:
            typeof item.productId.category === "string"
                ? {
                    id: item.productId.category,
                    name: "",
                    image: "",
                    categoryType: "",
                    slug: ""
                }
                : {
                    ...item.productId.category,
                    slug: item.productId.category.slug || ""
                },
        brand:
            typeof item.productId.brand === "string"
                ? { id: item.productId.brand, name: "", slug: "" }
                : { ...item.productId.brand, slug: item.productId.brand.slug || "" },
        ratings: item.productId.ratings || [],
        sku: item.productId.sku || item.productId.id,
        warranty: {
            period: item.productId.warranty?.period || 0,
            policy: item.productId.warranty?.policy || "",
        },
        origin: item.productId.origin || "",
        condition: item.productId.condition || "new",
        specifications: item.productId.specifications || [],
        sold: item.productId.sold || 0,
        reviewCount: item.productId.reviewCount || item.productId.ratings?.length || 0,
        isBookingAvailable: item.productId.isBookingAvailable || false,
        bookingPrice: item.productId.bookingPrice || 0,
        sessionIds: item.productId.sessionIds || [],
        tags: item.productId.tags || [],
        videoUrl: item.productId.videoUrl,
        createdAt: item.productId.createdAt || new Date(0).toISOString(),
    },
    quantity: item.quantity,
});

const mapCartInfoToProduct = (
    item: CartItemInfo
): CartProductWithQuantity => ({
    product: {
        id: String(item.deviceId),
        name: item.deviceName,
        slug: toSlug(item.deviceName),
        description: "",
        content: "",
        price: item.devicePrice,
        originalPrice: item.originalPrice || item.devicePrice,
        discountPercentage: item.discountPercentage || 0,
        stock: item.stock || 0,
        averageRating: 0,
        image: item.deviceImage || "",
        images: item.deviceImage ? [item.deviceImage] : [],
        category: { id: "", name: "", image: "", categoryType: "", slug: "" },
        brand: { id: "", name: "", slug: "" },
        ratings: [],
        sku: String(item.deviceId),
        warranty: { period: 0, policy: "" },
        origin: "",
        condition: "new",
        specifications: [],
        sold: 0,
        reviewCount: 0,
        isBookingAvailable: false,
        bookingPrice: 0,
        sessionIds: [],
        tags: [],
        videoUrl: undefined,
        createdAt: new Date().toISOString(),
    },
    quantity: item.quantity,
});

interface User {
    _id: string;
    username: string;
    email: string;
    avatar_url?: string;
    role: string;
    addresses?: Array<{
        _id: string;
        street: string;
        city: string;
        country: string;
        postalCode: string;
        isDefault: boolean;
    }>;
    full_name?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    skin_type?: string;
    loyalty_points?: number;
    client_code?: string;
    membership_level?: string;
    auth_provider?: string;
}

interface UserState {
    authUser: User | null;
    auth_token: string | null;
    isAuthenticated: boolean;
    updateUser: (user: User) => void;
    setAuthToken: (token: string | null) => void;
    logoutUser: () => void;
    verifyAuth: () => Promise<void>;
    loadUserData: (token: string) => Promise<void>;
    register: (data: {
        name: string;
        email: string;
        password: string;
        role: string;
    }) => Promise<void>;
}

interface CartState {
    cartItems: Product[];
    cartItemsWithQuantities: Array<{ product: Product; quantity: number }>;
    isLoading: boolean;
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateCartItemQuantity: (
        productId: string,
        quantity: number
    ) => Promise<void>;
    clearCart: () => Promise<void>;
    setCartItems: (items: Array<{ product: Product; quantity: number }>) => void;
    getCartItemQuantity: (productId: string) => number;
    isInCart: (productId: string) => boolean;
    syncCartFromServer: () => Promise<void>;
}

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    addOrder: (order: Order) => void;
    updateOrder: (order: Order) => void;
    loadOrders: (token: string) => Promise<void>;
    getOrdersCount: () => number;
    clearOrders: () => void;
}

interface WishlistState {
    wishlistItems: Product[];
    wishlistIds: string[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    setWishlistItems: (products: Product[]) => void;
    setWishlistIds: (ids: string[]) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            authUser: null,
            authLoading: false,
            auth_token: Cookies.get("auth_token") || null,
            isAuthenticated: !!Cookies.get("auth_token"),
            updateUser: (user) => {
                set({ authUser: user, isAuthenticated: true });
            },
            setAuthToken: (token) => {
                if (token) {
                    Cookies.set("auth_token", token, {
                        expires: 7,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                    });
                    set({ auth_token: token, isAuthenticated: true });

                    setTimeout(() => {
                        loadAllUserData(token);
                    }, 150);
                } else {
                    Cookies.remove("auth_token");
                    set({ auth_token: null, isAuthenticated: false, authUser: null });
                }
            },

            loadUserData: async (token: string) => {
                try {
                    const promises = [
                        (async () => {
                            try {
                                const { getUserWishlist } = await import("./wishlistApi");
                                const { useWishlistStore } = await import("./store");
                                const wishlistResponse = await getUserWishlist(token);
                                if (wishlistResponse.success) {
                                    useWishlistStore
                                        .getState()
                                        .setWishlistIds(wishlistResponse.wishlist);
                                }
                            } catch (error) {
                                console.warn("Failed to load wishlist on login:", error);
                            }
                        })(),
                        (async () => {
                            try {
                                const { useCartStore } = await import("./store");
                                await useCartStore.getState().syncCartFromServer();
                            } catch (error) {
                                console.warn("Failed to load cart on login:", error);
                            }
                        })(),
                        (async () => {
                            try {
                                const { useOrderStore } = await import("./store");
                                await useOrderStore.getState().loadOrders(token);
                            } catch (error) {
                                console.warn("Failed to load orders on login:", error);
                            }
                        })(),
                    ];

                    await Promise.allSettled(promises);
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            },
            logoutUser: async () => {
                Cookies.remove("auth_token");
                set({ authUser: null, auth_token: null, isAuthenticated: false });

                // Clear wishlist, cart, and orders on logout using dynamic imports
                try {
                    const { useWishlistStore } = await import("./store");
                    useWishlistStore.getState().clearWishlist();
                } catch (error) {
                    console.warn("Store: Failed to clear wishlist on logout:", error);
                }

                try {
                    const { useCartStore } = await import("./store");
                    useCartStore.getState().setCartItems([]);
                } catch (error) {
                    console.warn("Store: Failed to clear cart on logout:", error);
                }

                try {
                    const { useOrderStore } = await import("./store");
                    useOrderStore.getState().clearOrders();
                } catch (error) {
                    console.warn("Store: Failed to clear orders on logout:", error);
                }
            },
            verifyAuth: async () => {
                const token = Cookies.get("auth_token");

                if (!token) {
                    set({ isAuthenticated: false, authUser: null, auth_token: null });
                    return;
                }

                const currentState = get();
                if (currentState.authUser && currentState.isAuthenticated) {
                    return;
                }

                try {
                    const response = await authApi.get("/auth/profile");

                    if (response.data) {
                        set({
                            authUser: response.data as User,
                            isAuthenticated: true,
                            auth_token: token,
                        });

                        try {
                            const { getUserWishlist } = await import("./wishlistApi");
                            const { useWishlistStore } = await import("./store");

                            const wishlistResponse = await getUserWishlist(token);
                            if (wishlistResponse.success) {
                                useWishlistStore
                                    .getState()
                                    .setWishlistIds(wishlistResponse.wishlist);
                            }
                        } catch (wishlistError) {
                            console.warn("Store: Failed to load wishlist:", wishlistError);
                        }

                        try {
                            const { useCartStore } = await import("./store");
                            await useCartStore.getState().syncCartFromServer();
                        } catch (cartError) {
                            console.warn("Store: Failed to load cart:", cartError);
                        }

                        try {
                            const { useOrderStore } = await import("./store");
                            await useOrderStore.getState().loadOrders(token);
                        } catch (orderError) {
                            console.warn("Store: Failed to load orders:", orderError);
                        }
                    } else {
                        throw new Error("Invalid token");
                    }
                } catch (error) {
                    console.error("Store: Verify auth error:", error);
                    Cookies.remove("auth_token");
                    set({ authUser: null, auth_token: null, isAuthenticated: false });
                }
            },
            register: async (data) => {
                try {
                    const response = await authApi.post("/auth/signup", data);

                    if (!response.data) {
                        throw new Error(response.error?.message || "Registration failed");
                    }
                } catch (error) {
                    console.error("Store: Register error:", error);
                    throw error;
                }
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// ... (rest of the file remains unchanged: useCartStore, useOrderStore, useWishlistStore, and loadAllUserData)

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            cartItemsWithQuantities: [],
            isLoading: false,

            addToCart: async (product, quantity = 1) => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { addToCart } = await import("./cartApi");
                    const response = await addToCart(auth_token, product.id, quantity);

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartInfoToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Add to cart error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            removeFromCart: async (productId) => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { removeFromCart } = await import("./cartApi");
                    const response = await removeFromCart(auth_token, productId);

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartInfoToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Remove from cart error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateCartItemQuantity: async (productId, quantity) => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { updateCartItem } = await import("./cartApi");
                    const response = await updateCartItem(
                        auth_token,
                        productId,
                        quantity
                    );

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartInfoToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Update cart item error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            clearCart: async () => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { clearCart } = await import("./cartApi");
                    const response = await clearCart();

                    if (response.success) {
                        set({
                            cartItemsWithQuantities: [],
                            cartItems: [],
                        });
                    }
                } catch (error) {
                    console.error("Clear cart error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            setCartItems: (items) => {
                set({
                    cartItemsWithQuantities: items,
                    cartItems: items.map((item) => item.product),
                });
            },

            getCartItemQuantity: (productId) => {
                const state = get();
                const item = state.cartItemsWithQuantities.find(
                    (item) => item.product.id === productId
                );
                return item ? item.quantity : 0;
            },

            isInCart: (productId) => {
                const state = get();
                return state.cartItems.some((item) => item.id === productId);
            },

            syncCartFromServer: async () => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    set({ cartItems: [], cartItemsWithQuantities: [] });
                    return;
                }

                set({ isLoading: true });
                try {
                    const { getUserCart } = await import("./cartApi");
                    const response = await getUserCart();

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartInfoToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Sync cart from server error:", error);
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            isLoading: false,
            addOrder: (order) =>
                set((state) => ({ orders: [...state.orders, order] })),
            updateOrder: (order) =>
                set((state) => ({
                    orders: state.orders.map((o) => (o._id === order._id ? order : o)),
                })),
            loadOrders: async (token: string) => {
                set({ isLoading: true });
                try {
                    const { getUserOrders } = await import("./orderApi");
                    const orders = await getUserOrders(token);
                    set({ orders, isLoading: false });
                } catch (error) {
                    console.error("Failed to load orders:", error);
                    set({ isLoading: false });
                }
            },
            getOrdersCount: () => get().orders.length,
            clearOrders: () => set({ orders: [] }),
        }),
        {
            name: "order-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlistItems: [],
            wishlistIds: [],
            addToWishlist: (product) =>
                set((state) => {
                    if (!state.wishlistIds.includes(product.id)) {
                        return {
                            wishlistItems: [...state.wishlistItems, product],
                            wishlistIds: [...state.wishlistIds, product.id],
                        };
                    }
                    return state;
                }),
            removeFromWishlist: (productId) =>
                set((state) => ({
                    wishlistItems: state.wishlistItems.filter(
                        (item) => item.id !== productId
                    ),
                    wishlistIds: state.wishlistIds.filter((id) => id !== productId),
                })),
            setWishlistItems: (products) =>
                set({
                    wishlistItems: products,
                    wishlistIds: products.map((product) => product.id),
                }),
            setWishlistIds: (ids) =>
                set((state) => ({
                    wishlistIds: ids,
                    wishlistItems: state.wishlistItems.filter((item) =>
                        ids.includes(item.id)
                    ),
                })),
            clearWishlist: () => set({ wishlistItems: [], wishlistIds: [] }),
            isInWishlist: (productId) => {
                const state = get();
                // Nếu không có productId thì mặc định là false để tránh đỏ hàng loạt
                if (!productId) return false;

                // Ép cả danh sách và productId về String để so sánh chính xác tuyệt đối
                return state.wishlistIds.some(id => String(id) === String(productId));
            },

        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const loadAllUserData = async (token: string) => {
    try {
        const promises = [
            (async () => {
                try {
                    const { getUserWishlist } = await import("./wishlistApi");
                    const wishlistResponse = await getUserWishlist(token);
                    if (wishlistResponse.success) {
                        useWishlistStore
                            .getState()
                            .setWishlistIds(wishlistResponse.wishlist);
                    }
                } catch (error) {
                    console.warn("Failed to load wishlist:", error);
                }
            })(),
            (async () => {
                try {
                    await useCartStore.getState().syncCartFromServer();
                } catch (error) {
                    console.warn("Failed to load cart:", error);
                }
            })(),
            (async () => {
                try {
                    await useOrderStore.getState().loadOrders(token);
                } catch (error) {
                    console.warn("Failed to load orders:", error);
                }
            })(),
        ];

        await Promise.allSettled(promises);
    } catch (error) {
        console.error("Error loading user data:", error);
    }
};
