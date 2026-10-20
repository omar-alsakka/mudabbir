"use client";

import { usePrivacyStore } from "@/stores/privacyStore";

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
}

export function AmountDisplay({
  amount,
  currency = "USD",
  className = "",
  showSign = false,
}: AmountDisplayProps) {
  const isPrivacyMode = usePrivacyStore((s) => s.isPrivacyMode);

  if (isPrivacyMode) {
    return <span className={className}>****</span>;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = showSign && amount > 0 ? "+" : "";
  const colorClass =
    showSign && amount !== 0
      ? amount > 0
        ? "text-success"
        : "text-danger"
      : "";

  return (
    <span className={`${colorClass} ${className}`}>
      {sign}
      {amount < 0 && showSign ? "-" : ""}
      {formatted}
    </span>
  );
}
