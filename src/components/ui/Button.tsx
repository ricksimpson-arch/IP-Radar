import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--r-sm)] px-5 py-2.5 font-medium transition-colors duration-120 disabled:opacity-50 disabled:pointer-events-none";

// Primary is the one permitted CTA role for --ma-signal: ink text on signal fill.
const variants: Record<Variant, string> = {
  primary: "bg-signal text-ink-900 hover:bg-signal-d",
  secondary: "border border-line bg-transparent text-paper hover:bg-ink-700",
  ghost: "bg-transparent text-mute hover:text-paper",
  destructive: "bg-coral text-ink-900 hover:opacity-90",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
