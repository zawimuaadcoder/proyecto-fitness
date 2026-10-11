"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LoaderGrid } from "./LoaderGrid";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

/* Lenguaje Beautiful UI: botones en píldora, relleno con brillo interior,
 * secundarios con anillo de 1px en lugar de borde. */
const filledShadow = "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]";

const variants: Record<Variant, string> = {
  primary: `bg-ink text-canvas hover:opacity-90 ${filledShadow}`,
  secondary: "bg-surface text-ink shadow-btn hover:bg-inset aria-expanded:bg-hover",
  subtle: "bg-accent-tint text-accent-ink hover:brightness-110",
  ghost: "text-ink-2 hover:text-ink hover:bg-hover",
  danger: "bg-red-tint text-red hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-[28px] px-3 text-[13px] gap-1.5 rounded-full [&_svg]:size-3.5",
  md: "h-9 px-4 text-sm gap-2 rounded-full",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-full",
};

export function buttonClass(variant: Variant = "secondary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center font-medium leading-none whitespace-nowrap transition-[background-color,opacity,box-shadow,color,transform] duration-150 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderGrid size={12} /> : icon}
      {children}
    </button>
  );
});

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  label: string;
  size?: "sm" | "md";
  variant?: "ghost" | "secondary";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", variant = "ghost", className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[8px] transition-[background-color,color,transform] duration-150 active:scale-[0.94] disabled:opacity-40 [&_svg]:size-4",
        size === "sm" ? "size-7" : "size-9",
        variant === "ghost" ? "text-ink-3 hover:bg-hover hover:text-ink" : "bg-surface text-ink-2 shadow-btn hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
