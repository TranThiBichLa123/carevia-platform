"use client";

import { useEffect } from "react";
import { useUserStore } from "../../../lib/store";

const AuthInitializer = () => {
  const { verifyAuth } = useUserStore();

  useEffect(() => {
    console.log("AuthInitializer: Running verifyAuth");
    verifyAuth();
  }, [verifyAuth]);

  return null;
};

export default AuthInitializer;
