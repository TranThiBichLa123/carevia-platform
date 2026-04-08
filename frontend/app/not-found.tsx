"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Heart,
  Search,
  Phone,
  ArrowLeft,
  Clock,
  MapPin,
  Baby,
} from "lucide-react";

const NotFoundPage = () => {
  const quickLinks = [
    { icon: ShoppingBag, label: "Shop All Products", href: "/shop" },
    { icon: Heart, label: "Wishlist", href: "/user/wishlist" },
    { icon: Search, label: "Search Products", href: "/search" },
    { icon: Phone, label: "Contact Support", href: "/help/contact" },
  ];

  const popularCategories = [
    { name: "Baby Clothes", href: "/shop?category=clothes" },
    { name: "Toys & Games", href: "/shop?category=toys" },
    { name: "Feeding Essentials", href: "/shop?category=feeding" },
    { name: "Safety Products", href: "/shop?category=safety" },
    { name: "Nursery Decor", href: "/shop?category=nursery" },
    { name: "Accessories", href: "/shop?category=accessories" },
  ];

  const helpLinks = [
    { label: "Track Your Order", href: "/track-order" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Shipping Information", href: "/help/shipping" },
    { label: "Customer Reviews", href: "/testimonials" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-12 px-6 relative">
          {/* Baby icon with question mark */}
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Baby className="w-12 h-12 text-gray-800" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-bold text-sm">?</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Oops! Page Not Found
          </h1>
          <p className="text-white/90 max-w-md mx-auto">
            This little one seems to have wandered off to playtime!
            <br />
            Don&apos;t worry, we&apos;ll help you find what you&apos;re looking for.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Return to Home button */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/client"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl text-lg shadow-lg transition-all duration-300"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Home
              </Link>
            </motion.div>
            <p className="text-gray-500 mt-4">
              Or explore our amazing collection of baby products below
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="group flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <link.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-gray-700 text-center group-hover:text-blue-500 transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-center mb-4">
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-gray-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Need Help */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {helpLinks.map((page, index) => (
                <motion.div
                  key={page.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={page.href}
                    className="flex items-center p-3 bg-gradient-to-r from-green-50 to-blue-5 hover:from-green-100 hover:to-blue-100 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 group"
                  >
                    <ArrowLeft className="h-4 w-4 text-green-600 mr-3 transform group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm font-medium text-green-700">
                      {page.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Welcome section */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-2">
              Welcome to Babyshop - Your Trusted Baby Store
            </h3>
            <p className="text-gray-600 text-sm mb-4 max-w-2xl mx-auto">
              We&apos;re your one-stop destination for everything your little one
              needs. From clothes and toys to safety gear and nursery essentials,
              we make shopping for your baby safe, easy, and enjoyable.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/help/contact" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                <Phone className="w-4 h-4 text-green-500" />
                Customer Support
              </Link>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                24/7 Available
              </div>
              <Link href="/help/shipping" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                <MapPin className="w-4 h-4 text-green-500" />
                Free Shipping
              </Link>
            </div>
          </div>

          {/* Footer links */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Your privacy and security matter to us.{" "}
              <Link href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </Link>
              {" • "}
              <Link href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;