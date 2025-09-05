"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

// Популярные иконки для категорий вики
const POPULAR_ICONS = [
  'Gamepad2', 'BookOpen', 'Users', 'Briefcase', 'Heart', 'Shield',
  'Scroll', 'Coins', 'Car', 'Home', 'Map', 'Package',
  'Swords', 'Crown', 'Building', 'Gavel', 'Handshake', 'DollarSign',
  'Zap', 'Truck', 'Plane', 'Ship', 'Anchor', 'Factory',
  'Hammer', 'Wrench', 'HardHat', 'Pickaxe', 'Wheat', 'Fish',
  'ShoppingBag', 'Store', 'Coffee', 'Pizza', 'Utensils', 'Wine',
  'Music', 'Radio', 'Tv', 'Camera', 'Phone', 'MessageCircle',
  'Globe', 'Flag', 'Award', 'Trophy', 'Medal', 'Star',
  'Flame', 'Sparkles', 'Gem', 'Diamond', 'BadgeCheck',
  'Lock', 'Unlock', 'Key', 'Eye', 'EyeOff', 'AlertTriangle',
  'Info', 'HelpCircle', 'CheckCircle', 'XCircle', 'Settings', 'Tool'
];

interface IconPickerProps {
  value: string | null;
  onChange: (iconName: string) => void;
  className?: string;
}

export default function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Фильтруем иконки по поиску
  const filteredIcons = POPULAR_ICONS.filter(name => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  // Получаем компонент иконки по имени
  const getIcon = (name: string) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const CurrentIcon = value && (Icons as any)[value];

  return (
    <div className={cn("relative", className)}>
      {/* Кнопка выбора */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
          text-white hover:bg-white/10 transition-colors"
      >
        {CurrentIcon ? (
          <>
            <CurrentIcon className="w-5 h-5 text-purple-400" />
            <span className="flex-1 text-left">{value}</span>
          </>
        ) : (
          <>
            <Icons.Image className="w-5 h-5 text-gray-500" />
            <span className="flex-1 text-left text-gray-500">Выберите иконку</span>
          </>
        )}
        <Icons.ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 w-full max-w-md bg-gray-800 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
            {/* Поиск */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg 
                    text-white placeholder:text-gray-500 text-sm
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Поиск иконок..."
                  autoFocus
                />
              </div>
            </div>

            {/* Список иконок */}
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map((iconName) => {
                  const Icon = (Icons as any)[iconName];
                  if (!Icon) return null;
                  
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange(iconName);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={cn(
                        "p-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center group",
                        value === iconName && "bg-purple-500/20 text-purple-400"
                      )}
                      title={iconName}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
              
              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Иконки не найдены
                </div>
              )}
            </div>

            {/* Подсказка */}
            <div className="p-2 border-t border-white/10 text-center">
              <span className="text-xs text-gray-500">
                Выбрано: {value || 'не выбрано'} • {filteredIcons.length} иконок доступно
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}