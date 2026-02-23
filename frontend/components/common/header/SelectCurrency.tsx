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
import React, { useState } from "react";

const SelectCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  return (
    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
      <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:outline-none shadow-none flex items-center justify-between px-2 py-1 data-[size=default]:h-6 dark:bg-transparent dark:hover:transparent ">
        <SelectValue placeholder="Select a currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Currencies</SelectLabel>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="BDT">BDT</SelectItem>
          <SelectItem value="INR">INR</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectCurrency;
