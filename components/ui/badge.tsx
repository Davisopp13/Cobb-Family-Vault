import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-forest-700 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-forest-700 text-white hover:bg-forest-800",
        secondary:
          "border-transparent bg-stone-100 text-stone-900 hover:bg-stone-200",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "text-stone-700",
        amber:
          "border-transparent bg-amber-100 text-amber-800",
        green:
          "border-transparent bg-emerald-100 text-emerald-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
