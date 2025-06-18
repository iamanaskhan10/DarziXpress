// components/ui/textarea.jsx (Simplified Example)
import * as React from "react";
const Textarea = React.forwardRef(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={`flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
export { Textarea };