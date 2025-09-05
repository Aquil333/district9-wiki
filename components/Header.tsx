"use client";

import { useState, useEffect } from "react";
import { Search, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import SearchModal from "./SearchModal";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Открытие поиска по Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                  hover:bg-white/10 transition-all duration-200 text-left group"
              >
                <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                <span className="flex-1 text-gray-500 group-hover:text-gray-400">
                  Поиск по wiki...
                </span>
                <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-500">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Main Site Link */}
              <Link
                href="https://d9-rp.com"
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-4 py-2 
                  bg-white/5 hover:bg-white/10 
                  border border-white/10 rounded-lg 
                  transition-all duration-200 group"
              >
                <span className="text-sm text-gray-300 group-hover:text-white">Главный сайт</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </Link>

              {/* User Menu */}
              <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}