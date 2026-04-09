"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  DollarSign,
  Truck,
  HeartHandshake,
  Award,
  Users,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";

const FeaturedServicesSection = () => {
  const services = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Thiết bị chính hãng",
      description: "100% hàng chính hãng có nguồn gốc rõ ràng",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Giá tốt nhất",
      description: "Cam kết giá cạnh tranh nhất thị trường",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Giao hàng nhanh",
      description: "Giao hàng toàn quốc trong 24-48h",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: "Hỗ trợ 24/7",
      description: "Tư vấn và hỗ trợ mọi lúc mọi nơi",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      number: "50K+",
      label: "Khách hàng hài lòng",
    },
    {
      icon: <Award className="w-6 h-6" />,
      number: "99.9%",
      label: "Đánh giá trung bình",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      number: "24/7",
      label: "Hỗ trợ khách hàng",

    },
    {
      icon: <Star className="w-6 h-6" />,
      number: "4.9",
      label:"Tỷ lệ hài lòng",
    },
  ];

  return (
    <div className="py-12 bg-background p-5 mt-5 rounded-md border border-gray-200">
      <div className="text-center mb-8">
        <Badge
          variant="outline"
          className="text-primary border-primary mb-4"
        >
          Tại sao chọn Carevia
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Điều đặc biệt từ Carevia
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Chúng tôi cam kết mang đến trải nghiệm mua sắm và chăm sóc da tốt nhất
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {services.map((service, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary"
          >
            <CardContent className="p-6 text-center">
              <div
                className={`${service.bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                <div className={service.color}>{service.icon}</div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">
                {stat.number}
              </div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Sẵn sàng chăm sóc làn da của bạn?
        </h3>
        <p className="text-muted-foreground mb-6">
          Tham gia cùng hàng ngàn khách hàng tin dùng Carevia
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-hover text-white"
            >
              Khám phá thiết bị
            </Button>
          </Link>
          <Link href="/about">
            <Button
              size="lg"
              variant="outline"
              className="border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              Đặt lịch trải nghiệm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedServicesSection;
