"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Store, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { NavbarSearchDropdownSkeleton } from "@/components/global/search/navbar-search-skeleton";

interface SearchResult {
  organizations: {
    orgId: string;
    orgName: string;
    slug: string;
    logoUrl: string | null;
  }[];
  products: {
    productId: string;
    name: string;
    price: number;
    image_url: string | null;
    organizations: {
      orgName: string;
    } | null;
  }[];
}

export function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult>({
    organizations: [],
    products: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ organizations: [], products: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const [orgsResult, productsResult] = await Promise.all([
        supabase
          .from("organizations")
          .select("orgId, orgName, slug, logoUrl")
          .ilike("orgName", `%${debouncedQuery}%`)
          .limit(3),
        supabase
          .from("products")
          .select("productId, name, price, image_url, organizations(orgName)")
          .ilike("name", `%${debouncedQuery}%`)
          .eq("is_active", true)
          .is("deletedAt", null)
          .limit(5),
      ]);

      setResults({
        organizations: orgsResult.data || [],
        products: (productsResult.data as any) || [],
      });
      setIsLoading(false);
      setIsOpen(true);
    };

    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsOpen(false);
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    });
  };

  const handleOrgClick = (orgId: string) => {
    setIsOpen(false);
    startTransition(() => {
      router.push(`/search?orgId=${orgId}`);
    });
    setQuery("");
  };

  const handleProductClick = (productId: string) => {
    setIsOpen(false);
    startTransition(() => {
      router.push(`/search?productId=${productId}`);
    });
    setQuery("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 max-w-sm ml-2 md:ml-4 lg:ml-8 lg:max-w-md"
    >
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search stores and products..."
          className="w-full pl-9 pr-10 bg-muted/50 focus-visible:bg-background rounded-full border-muted-foreground/20 h-10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {isOpen && debouncedQuery.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg overflow-hidden z-50 flex flex-col max-h-[70vh]">
          {isLoading ? (
            <NavbarSearchDropdownSkeleton />
          ) : results.organizations.length === 0 &&
            results.products.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          ) : (
            <div className="overflow-y-auto overflow-x-hidden">
              {results.organizations.length > 0 && (
                <div className="p-2 border-b">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1 flex items-center gap-1 uppercase tracking-wider">
                    <Store className="h-3 w-3" />
                    Stores
                  </h3>
                  <div className="flex flex-col gap-1">
                    {results.organizations.map((org) => (
                      <button
                        key={org.orgId}
                        onClick={() => handleOrgClick(org.orgId)}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg text-left transition-colors"
                      >
                        {org.logoUrl ? (
                          <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 border">
                            <Image
                              src={org.logoUrl}
                              alt={org.orgName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 border">
                            <Store className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {org.orgName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1 flex items-center gap-1 uppercase tracking-wider">
                    <Package className="h-3 w-3" />
                    Products
                  </h3>
                  <div className="flex flex-col gap-1">
                    {results.products.map((product) => (
                      <button
                        key={product.productId}
                        onClick={() => handleProductClick(product.productId)}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg text-left transition-colors"
                      >
                        {product.image_url ? (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0 border">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium truncate">
                            {product.name}
                          </span>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground truncate">
                              {product.organizations?.orgName}
                            </span>
                            <span className="text-xs font-semibold text-primary whitespace-nowrap">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-2 border-t bg-muted/30">
            <button
              onClick={handleSearch}
              className="w-full text-center text-xs text-primary font-medium hover:underline p-1"
            >
              See all results for "{debouncedQuery}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
