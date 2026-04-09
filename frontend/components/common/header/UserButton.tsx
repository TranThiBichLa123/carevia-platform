"use client";

import { User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useUserStore } from "../../../lib/store";

const UserButton = () => {
  const { isAuthenticated, authUser } = useUserStore();

  return (
    <Link
      href={isAuthenticated && authUser ? "/user/profile" : "/auth/signin"}
      /* 1. Thêm hover:text-primary-hover ở thẻ cha để đổi màu toàn bộ text & icon bên trong */
      className="flex items-center gap-2 group hover:text-primary-hover hoverEffect"
    >
      {isAuthenticated && authUser ? (
        /* 2. Đổi border sang primary-hover khi group được hover */
        <span className="w-10 h-10 border rounded-full p-1 group-hover:border-primary-hover hoverEffect">
          {authUser.avatar ? (
            <img
              src={authUser.avatar}
              alt="userImage"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
              {authUser.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </span>
      ) : (
        /* Icon Lucide tự động nhận màu từ text-primary-hover của group cha */
        <User size={30} />
      )}
      <span>
        <p className="text-xs font-medium">Welcome</p>
        <p className="font-semibold text-sm">
          {isAuthenticated && authUser
            ? authUser.name || "My Profile"
            : "Sign in / Register"}
        </p>
      </span>
    </Link>
  );
};

export default UserButton;
