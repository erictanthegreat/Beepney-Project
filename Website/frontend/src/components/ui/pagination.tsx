import * as React from "react";
import { cn } from "@/lib/utils";

export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex w-full justify-end", className)} // changed to right align
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

export function PaginationItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({
  isActive,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  return (
    <a
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
        isActive
          ? "bg-[#1478C9] text-white border-[#1478C9]" // active
          : "text-[#1478C9] border-[#1478C9] hover:bg-[#1E86DA] hover:text-white", // hover
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "flex h-9 items-center justify-center rounded-md border px-2 text-sm font-medium text-[#1478C9] border-[#1478C9] hover:bg-[#1E86DA] hover:text-white",
        className
      )}
      {...props}
    >
      Previous
    </a>
  );
}

export function PaginationNext({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "flex h-9 items-center justify-center rounded-md border px-2 text-sm font-medium text-[#1478C9] border-[#1478C9] hover:bg-[#1E86DA] hover:text-white",
        className
      )}
      {...props}
    >
      Next
    </a>
  );
}