import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Tạo tài khoản Brand Staff",
    description: "Đăng ký vai trò seller để bắt đầu quy trình onboarding riêng cho brand.",
    icon: Store,
  },
  {
    title: "Chuẩn bị hồ sơ brand",
    description: "Tên thương hiệu, thông tin liên hệ, mô tả, giấy tờ pháp lý và bộ catalog dự kiến cần được chuẩn bị trước khi duyệt.",
    icon: Building2,
  },
  {
    title: "Platform Admin xét duyệt",
    description: "Admin kiểm tra seller onboarding, tính hợp lệ của brand và chỉ kích hoạt bán hàng sau khi hồ sơ đạt yêu cầu.",
    icon: ClipboardCheck,
  },
  {
    title: "Mở catalog và vận hành",
    description: "Khi được duyệt, Brand Staff mới được quản lý sản phẩm, booking, đơn hàng, voucher và review của brand mình.",
    icon: ShieldCheck,
  },
];

export default function SellWithCareviaPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[32px] bg-linear-to-r from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-lg md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">Carevia marketplace</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">Đăng ký bán hàng theo mô hình đa brand, không phải một shop nội bộ</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base">
            Carevia tách rõ Client, Brand Staff và Platform Admin. Nếu bạn muốn bán hàng, bạn cần đi qua luồng seller onboarding, được duyệt brand trước rồi mới có quyền đưa sản phẩm lên website cho khách hàng.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
              <Link href="/auth/signup?role=STAFF">Tạo tài khoản seller</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/auth/signin">Tôi đã có tài khoản</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="border-slate-200 bg-white">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-slate-600">
                  {step.description}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Checklist hồ sơ brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border bg-slate-50 p-4">Tên brand, mô tả thương hiệu, thông tin người đại diện và kênh liên hệ.</div>
              <div className="rounded-xl border bg-slate-50 p-4">Logo, bộ ảnh nhận diện, danh mục sản phẩm dự kiến và chính sách bảo hành.</div>
              <div className="rounded-xl border bg-slate-50 p-4">Giấy tờ kinh doanh, mã số thuế hoặc hồ sơ xác minh phù hợp với quy định của đồ án và SRS.</div>
              <div className="rounded-xl border bg-slate-50 p-4">Kế hoạch voucher, phạm vi vận hành booking trải nghiệm và trách nhiệm phản hồi review của brand.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân quyền sau khi được duyệt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border bg-emerald-50 p-4 text-emerald-900">Brand Staff chỉ thao tác trên dữ liệu thuộc brand của mình.</div>
              <div className="rounded-xl border bg-sky-50 p-4 text-sky-900">Platform Admin quản lý brand, moderation, audit và cấu hình hệ thống.</div>
              <div className="rounded-xl border bg-slate-50 p-4">Client chỉ nhìn thấy catalog sau khi brand được duyệt và kích hoạt hiển thị.</div>
              <Button asChild className="w-full">
                <Link href="/auth/signup?role=STAFF" className="inline-flex items-center justify-center gap-2">
                  Bắt đầu seller onboarding
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}