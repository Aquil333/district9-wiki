"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Search, 
  X, 
  FileText, 
  FolderOpen, 
  Loader2,
  Clock,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: {
      title: string;
      slug: string;
    };
    views: number;
  }>;
  categories: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    _count: {
      articles: number;
    };
  }>;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  // Поиск с задержкой (debounce)
  useEffect(() => {
    if (query.trim().length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl+K или Cmd+K для открытия/закрытия
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const Modal = () => (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-dark rounded-xl overflow-hidden border border-white/10">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-gray-500 
                outline-none text-lg"
            placeholder="Поиск по вики..."
            autoFocus
            />
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-purple-400" />}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <Search className="w-12 h-12 text-gray-600 mx-auto" />
              </div>
              <p className="text-gray-400 mb-2">Начните вводить для поиска</p>
              <p className="text-sm text-gray-600">Минимум 2 символа</p>
              
              {/* Quick Links */}
              <div className="mt-8 text-left">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Популярные разделы</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/start"
                    onClick={onClose}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Начало игры</span>
                  </Link>
                  <Link
                    href="/rp"
                    onClick={onClose}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Основы RP</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : !results || (results.articles.length === 0 && results.categories.length === 0) ? (
            !isLoading && (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <Search className="w-12 h-12 text-gray-600 mx-auto" />
                </div>
                <p className="text-gray-400">Ничего не найдено</p>
                <p className="text-sm text-gray-600 mt-2">Попробуйте изменить запрос</p>
              </div>
            )
          ) : (
            <div className="p-2">
              {/* Categories */}
              {results.categories.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">
                    Категории
                  </div>
                  {results.categories.map(category => (
                    <Link
                      key={category.id}
                      href={`/${category.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <FolderOpen className="w-4 h-4 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-white group-hover:text-purple-400 transition-colors">
                          {category.title}
                        </p>
                        {category.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {category._count.articles} статей
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Articles */}
              {results.articles.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">
                    Статьи
                  </div>
                  {results.articles.map(article => (
                    <Link
                      key={article.id}
                      href={`/${article.category.slug}/${article.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-white group-hover:text-purple-400 transition-colors">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {article.category.title}
                          </span>
                          {article.description && (
                            <>
                              <span className="text-gray-700">•</span>
                              <span className="text-xs text-gray-500 line-clamp-1">
                                {article.description}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd>
              Навигация
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd>
              Открыть
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd>
              Закрыть
            </span>
          </div>
          {results && (
            <span>
              Найдено: {results.articles.length + results.categories.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(<Modal />, document.body);
}