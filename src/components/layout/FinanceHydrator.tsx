"use client";

import { useEffect } from "react";
import { useFinanceStore } from "@/stores/financeStore";

export function FinanceHydrator() {
  useEffect(() => {
    useFinanceStore.persist.rehydrate();
  }, []);
  return null;
}
