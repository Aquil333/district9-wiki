"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Gamepad2,
  Users,
  Briefcase,
  Heart,
  Package,
  Map,
  HelpCircle,
  Scroll,
  Shield,
  Coins
} from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

// Резервный маппинг иконок по slug категории (если в БД нет иконки)
const iconMap: Record<string, any> = {
  'start': Gamepad2,
  'rp': BookOpen,
  'lore': Scroll,
  'factions': Users,
  'jobs': Briefcase,
  'family': Heart,
  'economy': Coins,
  'activities': Package,
  'rules': Shield,
  'default': BookOpen
};

interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  children?: Category[];
}

interface SidebarProps {
  categories: Category[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getIcon = (category: Category) => {
    // Если у категории есть иконка в БД, используем её
    if (category.icon && (Icons as any)[category.icon]) {
      const Icon = (Icons as any)[category.icon];
      return <Icon className="w-5 h-5" />;
    }
    // Иначе пробуем найти по slug в маппинге
    const Icon = iconMap[category.slug] || iconMap.default;
    return <Icon className="w-5 h-5" />;
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/50">
            <img 
              src="/d9-logo.png" 
              alt="District 9" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-white font-montserrat font-bold">District 9</h2>
            <p className="text-xs text-gray-400 font-inter">Wiki</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto flex-1">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-white/5",
            pathname === "/" && "bg-purple-500/20 text-purple-400"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Главная</span>
        </Link>

        {/* Dynamic Categories */}
        {categories.map((category) => {
          const isActive = pathname.startsWith(`/${category.slug}`);
          const isExpanded = expandedItems.includes(category.id);
          const hasChildren = category.children && category.children.length > 0;

          return (
            <div key={category.id}>
              {!hasChildren ? (
                <Link
                  href={`/${category.slug}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    "hover:bg-white/5",
                    isActive && "bg-purple-500/20 text-purple-400"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {getIcon(category)}
                  <span className="font-medium">{category.title}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpanded(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                      "hover:bg-white/5",
                      isActive && "text-purple-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(category)}
                      <span className="font-medium">{category.title}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  
                  {isExpanded && category.children && (
                    <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                      {category.children.map((child) => {
                        const isSubActive = pathname.startsWith(`/${child.slug}`);
                        const ChildIcon = child.icon && (Icons as any)[child.icon] 
                          ? (Icons as any)[child.icon] 
                          : null;
                        
                        return (
                          <Link
                            key={child.id}
                            href={`/${child.slug}`}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                              "hover:bg-white/5 hover:text-white",
                              isSubActive 
                                ? "bg-purple-500/20 text-purple-400" 
                                : "text-gray-400"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            {ChildIcon && <ChildIcon className="w-4 h-4" />}
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Static Links */}
        <Link
          href="/map"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-white/5",
            pathname === "/map" && "bg-purple-500/20 text-purple-400"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <Map className="w-5 h-5" />
          <span className="font-medium">Карта</span>
        </Link>

        <Link
          href="/faq"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-white/5",
            pathname === "/faq" && "bg-purple-500/20 text-purple-400"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">FAQ</span>
        </Link>
      </nav>

      {/* Server Status */}
      <div className="p-4 border-t border-white/10">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Сервер</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white">Online</span>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Игроков: 127/300
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass hover:bg-white/10 transition-colors"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/10">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-64 glass-dark border-r border-white/10 transition-transform duration-300 flex flex-col",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <NavContent />
        </aside>
      </div>
    </>
  );
}