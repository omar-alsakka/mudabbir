"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  secondaryActionLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  href,
  secondaryActionLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-color bg-bg-secondary/30 px-6 py-12 text-center">
      <div className="rounded-2xl bg-accent/10 p-4 text-accent">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {(actionLabel || href) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {href ? (
            <a
              href={href}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              onClick={onAction}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && secondaryHref && (
            <a
              href={secondaryHref}
              className="rounded-xl border border-border-color bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent"
            >
              {secondaryActionLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
