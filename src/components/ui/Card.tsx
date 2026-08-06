import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--r-md)] border border-line bg-ink-700 p-6 ${className}`}>
      {children}
    </div>
  );
}
