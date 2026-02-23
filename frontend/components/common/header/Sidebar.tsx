"use client";
import { Menu } from "lucide-react";
import React, { useState } from "react";
import LeftSideBar from "./LeftSideBar";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="md:hidden">
      <button
        onClick={toggleSidebar}
        className="hover:text-babyshopSky hoverEffect"
      >
        <Menu />
      </button>
      <LeftSideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
