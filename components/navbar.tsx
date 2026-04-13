"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/store";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ShoppingBag01Icon,
  UserIcon,
  FavouriteIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export default function Navbar() {
  const count = useCart((s) => s.count());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Do not render the Navbar on auth and admin pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-zinc-900"
        >
          Dos-Store
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center h-8">
            <form
              onSubmit={handleSearch}
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
                isSearchOpen ? "w-48 opacity-100 mr-1" : "w-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="relative w-full rounded-full bg-zinc-100">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-3 pr-8 text-sm bg-transparent text-zinc-900 placeholder:text-zinc-500 border-none outline-none focus:ring-0 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                </button>
              </div>
            </form>
            
            <button
              type="button"
              aria-label="Поиск"
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all duration-300 rounded-md hover:bg-zinc-50 ${
                isSearchOpen ? "w-0 overflow-hidden opacity-0 scale-50" : "w-8 h-8 opacity-100 scale-100"
              }`}
            >
              <HugeiconsIcon
                icon={Search01Icon}
                size={20}
                color="currentColor"
                strokeWidth={1.5}
                className="cursor-pointer"
              />
            </button>
          </div>

          <Link
            href="/favorites"
            aria-label="Избранное"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors rounded-md hover:bg-zinc-50"
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
          </Link>

          <Link
            href="/profile"
            aria-label="Профиль"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors rounded-md hover:bg-zinc-50"
          >
            <HugeiconsIcon
              icon={UserIcon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
          </Link>

          <Link
            href="/cart"
            aria-label="Корзина"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors rounded-md hover:bg-zinc-50 relative"
          >
            <HugeiconsIcon
              icon={ShoppingBag01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[9px] font-medium w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
