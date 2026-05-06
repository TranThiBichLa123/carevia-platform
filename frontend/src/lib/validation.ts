import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Nhập email hợp lệ" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Nhập email hợp lệ" }),
  password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
  role: z.enum(["user", "admin"]).default("user"),
});

export const userSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Nhập email hợp lệ" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    .optional(),
  role: z.enum(["admin", "user", "deliveryman"], {
    error: "Vui lòng chọn vai trò hợp lệ",
  }),
  avatar: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Tên là bắt buộc" }),
  image: z.string().optional(),
  categoryType: z.enum(["Featured", "Hot Categories", "Top Categories"], {
    error: "Loại danh mục là bắt buộc",
  }),
});

export const brandSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  image: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  description: z
    .string()
    .min(10, { message: "Mô tả phải có ít nhất 10 ký tự" }),
  price: z.number().min(0, { message: "Giá phải là số dương" }),
  discountPercentage: z.number().min(0).max(100).default(0),
  stock: z.number().min(0).default(0),
  category: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
  brand: z.string().min(1, { message: "Vui lòng chọn thương hiệu" }),
  image: z.string().min(1, { message: "Vui lòng tải lên hình ảnh" }),
});

export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});
