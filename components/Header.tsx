"use client";

import { useState } from "react";
import { Search, User, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по wiki..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                  text-white placeholder:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                  transition-all duration-200"
              />
            </div>
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
  );
}