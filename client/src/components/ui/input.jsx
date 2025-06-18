// components/ui/input.jsx
import * as React from "react";

const Input = React.forwardRef(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };