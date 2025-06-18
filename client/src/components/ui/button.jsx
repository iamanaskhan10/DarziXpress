// components/ui/button.jsx (Improved Simplified Version)
import * as React from "react";
// If you decide to use Slot for asChild, you'd import it:
// import { Slot } from "@radix-ui/react-slot";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    // const Comp = asChild ? Slot : "button"; // Use this if Slot is available

    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400";

    const variantStyles = {
      default: "bg-indigo-600 text-white hover:bg-indigo-600/90 dark:bg-indigo-500 dark:text-slate-50 dark:hover:bg-indigo-500/90",
      destructive: "bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-700 dark:text-slate-50 dark:hover:bg-red-700/90",
      outline: "border border-slate-300 bg-white hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
      ghost: "hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-50",
      link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <button // Replace with Comp if using Slot
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };