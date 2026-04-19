"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import React, { useState, useEffect } from "react"; // Added useEffect

const SelectCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  
  // 1. Add a mounted state to handle hydration
  const [mounted, setMounted] = useState(false);

  // 2. Set mounted to true after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
    { code: "EUR", name: "Euro", symbol: "€", rate: 0.85 },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 0.73 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 110.0 },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.25 },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.35 },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.92 },
  ];

  // 3. Return a placeholder or null during SSR (Server Side Rendering)
  // This prevents the ID mismatch error (radix-_R_...)
  if (!mounted) {
    return (
      <div className="flex items-center px-2 py-1 h-6 w-[60px] text-white/50 text-sm">
        USD
      </div>
    );
  }

  return (
    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
      <SelectTrigger className="border-none bg-transparent text-white focus:ring-0 focus:outline-none shadow-none flex items-center justify-between px-2 py-1 data-[size=default]:h-6 dark:bg-transparent dark:hover:transparent ">
        <SelectValue>{selectedCurrency}</SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Currencies</SelectLabel>
          {currencies.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} - {c.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectCurrency;
