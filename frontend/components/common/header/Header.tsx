import React from "react";
import TopBanner from "./TopBanner";
import Container from "../Container";
import SearchInput from "./SearchInput";
import UserButton from "./UserButton";
import CartIcon from "./CartIcon";
import Sidebar from "./Sidebar";
import Logo from "../Logo";
import OrdersIcon from "./OrdersIcon";
import WishlistIcon from "./WishlistIcon";

const Header = () => {
  return (
    <header className="border-b sticky top-0 z-50 bg-babyshopWhite">
      <TopBanner />
      <Container className="flex items-center justify-between gap-10 py-4">
        <div className="flex flex-1 items-center justify-between md:justify-start md:gap-12">
          <Sidebar />
          <Logo />
          <div className="md:hidden flex items-center gap-3">
            <OrdersIcon />
            <WishlistIcon />
            <CartIcon />
          </div>
          <SearchInput />
        </div>
        <div className="hidden md:inline-flex items-center gap-5">
          <OrdersIcon />
          <WishlistIcon />
          <UserButton />
          <CartIcon />
        </div>
      </Container>
    </header>
  );
};

export default Header;
