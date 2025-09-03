"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  Loader2,
  AlertTriangle,
  GripVertical
} from "lucide-react";

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    articles: number;
  };
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    parentId: "",
    order: 0
  });

  // Обновляем категории при изменении props
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (match) => {
        const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
        const en = ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','kh','ts','ch','sh','shch','','y','','e','yu','ya'];
        return en[ru.indexOf(match)] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      title: category.title,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || "",
      order: category.order
    });
  };

  const handleSave = async (id?: string) => {
    setIsLoading(true);
    
    try {
      const url = id ? `/api/categories/${id}` : "/api/categories";
      const method = id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Обновляем страницу для загрузки новых данных
        router.refresh();
        
        // Если создаем новую категорию, добавляем её локально для немедленного отображения
        if (!id) {
          const newCategory = await response.json();
          if (formData.parentId) {
            // Если есть родитель, добавляем в children
            setCategories(prev => prev.map(cat => {
              if (cat.id === formData.parentId) {
                return {
                  ...cat,
                  children: [...(cat.children || []), newCategory]
                };
              }
              return cat;
            }));
          } else {
            // Если нет родителя, добавляем в корень
            setCategories(prev => [...prev, newCategory]);
          }
        }
        
        setEditingId(null);
        setShowNewForm(false);
        setFormData({
          title: "",
          slug: "",
          description: "",
          parentId: "",
          order: 0
        });
      } else {
        const error = await response.json();
        alert(error.error || "Ошибка при сохранении");
      }
    } catch (error) {
      alert("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        // Удаляем категорию локально для немедленного обновления
        setCategories(prev => {
          const removeCategory = (cats: Category[]): Category[] => {
            return cats
              .filter(cat => cat.id !== id)
              .map(cat => ({
                ...cat,
                children: cat.children ? removeCategory(cat.children) : []
              }));
          };
          return removeCategory(prev);
        });
        
        router.refresh();
        setDeleteConfirm(null);
      } else {
        alert("Ошибка при удалении");
      }
    } catch (error) {
      alert("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = async (categoryId: string, direction: 'up' | 'down') => {
    setIsMoving(true);
    
    try {
      // Находим категорию и её соседей
      const parentCategories = categories.filter(c => !c.parentId);
      const index = parentCategories.findIndex(c => c.id === categoryId);
      
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === parentCategories.length - 1)
      ) {
        setIsMoving(false);
        return;
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const categoryToMove = parentCategories[index];
      const categoryToSwap = parentCategories[newIndex];

      // Меняем порядок
      const newOrder1 = categoryToMove.order;
      const newOrder2 = categoryToSwap.order;

      // Обновляем на сервере
      await Promise.all([
        fetch(`/api/categories/${categoryToMove.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...categoryToMove, 
            order: newOrder2 
          })
        }),
        fetch(`/api/categories/${categoryToSwap.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...categoryToSwap, 
            order: newOrder1 
          })
        })
      ]);

      // Обновляем локально для мгновенного отображения
      const newCategories = [...categories];
      const cat1 = newCategories.find(c => c.id === categoryToMove.id);
      const cat2 = newCategories.find(c => c.id === categoryToSwap.id);
      
      if (cat1 && cat2) {
        const tempOrder = cat1.order;
        cat1.order = cat2.order;
        cat2.order = tempOrder;
        
        // Сортируем по новому порядку
        newCategories.sort((a, b) => {
          if (a.parentId === b.parentId) {
            return a.order - b.order;
          }
          return 0;
        });
        
        setCategories(newCategories);
      }

      router.refresh();
    } catch (error) {
      alert("Ошибка при перемещении");
    } finally {
      setIsMoving(false);
    }
  };

  const renderCategory = (category: Category, level = 0) => {
    const isEditing = editingId === category.id;
    const hasArticles = (category._count?.articles || 0) > 0;
    const isTopLevel = !category.parentId;

    return (
      <div key={category.id} className={level > 0 ? "ml-8" : ""}>
        <div className="glass rounded-lg p-4 mb-3 hover:bg-white/5 transition-colors">
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({
                      ...formData,
                      title,
                      slug: generateSlug(title)
                    });
                  }}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Название"
                />
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="URL (slug)"
                />
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                rows={2}
                placeholder="Описание (необязательно)"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(category.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      slug: "",
                      description: "",
                      parentId: "",
                      order: 0
                    });
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {isTopLevel && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(category.id, 'up')}
                      disabled={isMoving}
                      className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                      title="Переместить вверх"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMove(category.id, 'down')}
                      disabled={isMoving}
                      className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                      title="Переместить вниз"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {level > 0 && <ChevronRight className="w-4 h-4 text-gray-500" />}
                <FolderOpen className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">
                    {category.title}
                    <span className="ml-2 text-xs text-gray-500">/{category.slug}</span>
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{category._count?.articles || 0} статей</span>
                    {category.parent && (
                      <span>Родитель: {category.parent.title}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(category.id)}
                  disabled={hasArticles}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    hasArticles
                      ? "bg-gray-500/10 text-gray-600 cursor-not-allowed"
                      : "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  )}
                  title={hasArticles ? "Нельзя удалить категорию со статьями" : "Удалить"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm === category.id && (
          <div className="mb-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">
                Удалить категорию "{category.title}"?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(category.id)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                {isLoading ? "Удаление..." : "Удалить"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Render children */}
        {category.children && category.children.length > 0 && (
          <div className="mt-2">
            {category.children.map(child => {
              const childWithCount = { 
                ...child, 
                _count: child._count || { articles: 0 } 
              };
              return renderCategory(childWithCount, level + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  // Сортируем категории по order
  const sortedCategories = [...categories]
    .filter(c => !c.parentId)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <div className="glass rounded-lg p-6">
        {!showNewForm ? (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить категорию
          </button>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-white mb-3">Новая категория</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title)
                  });
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Название"
              />
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="URL (slug)"
              />
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              rows={2}
              placeholder="Описание (необязательно)"
            />
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Без родительской категории</option>
              {sortedCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave()}
                disabled={isLoading || !formData.title || !formData.slug}
                className="px-4 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Создать
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setFormData({
                    title: "",
                    slug: "",
                    description: "",
                    parentId: "",
                    order: 0
                  });
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Categories List */}
      <div>
        <h2 className="text-xl font-montserrat font-bold text-white mb-4">
          Существующие категории
        </h2>
        {sortedCategories.map(category => renderCategory(category))}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}