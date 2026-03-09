"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  variant?: "top" | "bottom";
  className?: string;
}

export function ProductPagination({
  totalItems,
  pageSize,
  currentPage,
  variant = "bottom",
  className,
}: ProductPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const scrollTarget = variant === "bottom" ? 0 : undefined;
    router.push(createPageURL(page), { scroll: scrollTarget === 0 });
  };

  if (variant === "top") {
    return (
      <div className={cn("flex items-center gap-2 sm:gap-4", className)}>
        <div className="flex items-center text-xs sm:text-sm font-medium">
          <span className="text-primary">{currentPage}</span>
          <span className="mx-1 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{totalPages}</span>
        </div>
        <div className="flex items-center border rounded-md overflow-hidden bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none border-r"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Bottom pagination logic (numbered)
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
      }
    }
    return pages;
  };

  return (
    <Pagination className={className}>
      <PaginationContent className="gap-0 sm:gap-1">
        <PaginationItem>
          <PaginationPrevious 
            href={createPageURL(Math.max(1, currentPage - 1))}
            className={cn(
              "h-9 w-9 px-0 sm:h-10 sm:w-auto sm:px-4",
              currentPage <= 1 ? "pointer-events-none opacity-50" : ""
            )}
          />
        </PaginationItem>

        {getVisiblePages().map((page, idx) => {
          // Hide non-adjacent pages on very small screens
          const isFar = typeof page === 'number' && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages;
          
          return (
            <PaginationItem key={idx} className={isFar ? "hidden sm:block" : ""}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={createPageURL(page)}
                  isActive={currentPage === page}
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext 
            href={createPageURL(Math.min(totalPages, currentPage + 1))}
            className={cn(
              "h-9 w-9 px-0 sm:h-10 sm:w-auto sm:px-4",
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
