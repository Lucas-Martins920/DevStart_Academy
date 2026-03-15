import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-full lip-spark",
        destructive: "bg-destructive text-destructive-foreground rounded-full",
        outline: "border-2 border-neon text-neon bg-transparent rounded-full hover:bg-neon/15 hover:glow-neon",
        secondary: "bg-surface-2 text-text-mid rounded-full hover:bg-surface-3 hover:text-text-high",
        ghost: "bg-transparent text-text-mid hover:bg-surface-2 hover:text-text-high rounded-lg",
        link: "text-spark underline-offset-4 hover:underline",
        success: "bg-neon text-surface-0 rounded-full lip-neon font-bold",
        accent: "bg-volt text-surface-0 rounded-full lip-volt font-bold",
        plasma: "bg-plasma text-primary-foreground rounded-full lip-plasma",
      },
      size: {
        default: "h-11 px-7 py-2 text-sm",
        sm: "h-9 px-5 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
