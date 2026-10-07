"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function FilterBar({
  categories,
  collections,
  total,
}: {
  categories: string[];
  collections: string[];
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [showMore, setShowMore] = useState(false);

  const activeCategory = params.get("category") ?? "All";
  const activeCollection = params.get("collection") ?? "All";
  const activeSort = params.get("sort") ?? "featured";
  const query = params.get("q") ?? params.get("search") ?? "";

  const [searchValue, setSearchValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#shop-search") {
      inputRef.current?.focus();
    }
  }, []);

  function push(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    next.delete("search");
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "All") next.delete(key);
      else next.set(key, value);
    });
    startTransition(() => router.push(next.size ? `/shop?${next}` : "/shop", { scroll: false }));
  }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    push({ q: searchValue.trim() || null });
  };

  const handleClear = () => {
    setSearchValue("");
    if (query) {
      push({ q: null });
    }
    inputRef.current?.focus();
  };

  const handleClearAll = () => {
    setSearchValue("");
    startTransition(() => router.push("/shop", { scroll: false }));
  };

  return (
    <div className="relative -mx-5 border-y border-ink/10 bg-bone/95 px-5 py-4 md:-mx-10 md:px-10">
      <form
        role="search"
        onSubmit={handleSearch}
        className="mb-4 flex items-center gap-3 rounded-full border border-ink/20 bg-bone px-4 py-2 transition-colors focus-within:border-ink"
      >
        <Search size={16} className="shrink-0 text-mist" />
        <input
          ref={inputRef}
          id="shop-search"
          name="q"
          type="search"
          aria-label="Search products"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search pieces, materials, or categories…"
          className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {searchValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="flex h-5 w-5 items-center justify-center rounded-full text-mist transition-colors hover:text-ink"
          >
            <X size={15} />
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-4 py-2 text-xs text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <div className="hide-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              disabled={pending}
              aria-pressed={category === activeCategory}
              onClick={() => push({ category })}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors",
                category === activeCategory
                  ? "bg-ink text-bone"
                  : "text-ink-soft hover:bg-bone-deep",
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-expanded={showMore}
          aria-controls="shop-refinements"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 transition-colors hover:border-ink"
        >
          <SlidersHorizontal size={13} />
          <span className="label-xs">Refine</span>
        </button>
      </div>

      {showMore && (
        <div id="shop-refinements" className="flex flex-wrap items-center gap-4 pt-4">
          <label className="flex items-center gap-2 text-xs">
            Collection
            <select
              value={activeCollection}
              onChange={(e) => push({ collection: e.target.value })}
              className="rounded-full border border-ink/15 bg-bone px-3 py-2 text-xs outline-none"
            >
              {["All", ...collections].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            Sort
            <select
              value={activeSort}
              onChange={(e) => push({ sort: e.target.value })}
              className="rounded-full border border-ink/15 bg-bone px-3 py-2 text-xs outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p aria-live="polite" className="text-[11px] uppercase tracking-[0.15em] text-mist">
          {pending
            ? "Updating…"
            : `${total} ${total === 1 ? "piece" : "pieces"}${query ? ` matching “${query}”` : ""}`}
        </p>
        {(query ||
          activeCategory !== "All" ||
          activeCollection !== "All" ||
          activeSort !== "featured") && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-ember underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
