"use client";

import Link from "next/link";
import { 
  ChevronRight, 
  Clock, 
  Eye, 
  Edit3, 
  BookOpen,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ArticleLayoutProps {
  title: string;
  category: string;
  breadcrumbs: { title: string; href?: string }[];
  readTime?: string;
  views?: number;
  lastUpdated?: string;
  children: ReactNode;
  toc?: { id: string; title: string; level: number }[];
}

// Компоненты для разных типов блоков контента
export const InfoBlock = ({ children, type = "info" }: { children: ReactNode; type?: "info" | "warning" | "error" | "success" | "tip" }) => {
  const styles = {
    info: { 
      bg: "bg-blue-500/10 border-blue-500/30", 
      icon: <Info className="w-5 h-5 text-blue-400" />,
      text: "text-blue-400"
    },
    warning: { 
      bg: "bg-yellow-500/10 border-yellow-500/30", 
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      text: "text-yellow-400"
    },
    error: { 
      bg: "bg-red-500/10 border-red-500/30", 
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      text: "text-red-400"
    },
    success: { 
      bg: "bg-green-500/10 border-green-500/30", 
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      text: "text-green-400"
    },
    tip: { 
      bg: "bg-purple-500/10 border-purple-500/30", 
      icon: <Lightbulb className="w-5 h-5 text-purple-400" />,
      text: "text-purple-400"
    }
  };

  const style = styles[type];

  return (
    <div className={cn("rounded-lg border p-4 mb-6", style.bg)}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className={cn("text-sm space-y-2", style.text === "text-blue-400" ? "text-gray-300" : "text-gray-300")}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const CodeBlock = ({ children }: { children: string }) => {
  return (
    <div className="relative group">
      <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto mb-6">
        <code className="text-sm text-gray-300 font-mono">{children}</code>
      </pre>
      <button className="absolute top-2 right-2 p-2 bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
};

export const KeyBind = ({ keys }: { keys: string[] }) => {
  return (
    <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">
      {keys.map((key, i) => (
        <span key={i}>
          {key}
          {i < keys.length - 1 && <span className="text-gray-500">+</span>}
        </span>
      ))}
    </kbd>
  );
};

export default function ArticleLayout({
  title,
  category,
  breadcrumbs,
  readTime = "5 мин",
  views = 0,
  lastUpdated = "2 дня назад",
  children,
  toc = []
}: ArticleLayoutProps) {
  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <article className="flex-1 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-purple-400 transition-colors">
                  {crumb.title}
                </Link>
              ) : (
                <span className="text-white">{crumb.title}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4" />}
            </div>
          ))}
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
              {category}
            </span>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readTime} чтения
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {views.toLocaleString()} просмотров
              </span>
              <span className="flex items-center gap-1">
                <Edit3 className="w-4 h-4" />
                {lastUpdated}
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-montserrat font-bold text-white mb-4">
            {title}
          </h1>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </article>

      {/* Table of Contents */}
      {toc && toc.length > 0 && (
        <aside className="hidden xl:block w-64 sticky top-24 h-fit">
          <div className="glass rounded-lg p-4">
            <h3 className="flex items-center gap-2 font-montserrat font-semibold text-white mb-4">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Содержание
            </h3>
            <nav className="space-y-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    "block text-sm hover:text-purple-400 transition-colors",
                    item.level === 2 && "ml-4 text-gray-400",
                    item.level === 3 && "ml-8 text-gray-500",
                    item.level === 1 && "text-gray-300 font-medium"
                  )}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}