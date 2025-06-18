// components/ui/select.jsx
import * as React from "react";

const Select = React.forwardRef(({ className, children, value, onChange, ...props }, ref) => (
  <div className="relative w-full">
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      className={`flex h-10 w-full appearance-none items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 pr-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
      <svg
        className="h-4 w-4 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  </div>
));
Select.displayName = "Select";

const SelectItem = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);

export { Select, SelectItem };