// components/ui/card.jsx
import * as React from "react";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ${className || ""}`}
    {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-5 sm:p-6 border-b border-slate-100 ${className || ""}`}
    {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 // Changed to h3 for semantics
    ref={ref}
    className={`text-sm font-medium text-slate-800 ${className || ""}`} // Changed default to text-sm font-medium for dashboard cards
    {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-slate-500 ${className || ""}`}
    {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-5 sm:p-6 ${className || ""}`} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-5 sm:p-6 border-t border-slate-100 flex items-center ${className || ""}`}
    {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };