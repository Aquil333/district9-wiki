"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Save, 
  X, 
  FileText,
  Bold,
  Italic,
  List,
  Link2,
  Code,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface Category {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

interface ArticleFormProps {
  article?: any;
  isEdit?: boolean;
}

export default function ArticleForm({ article, isEdit = false }: ArticleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    description: article?.description || "",
    content: article?.content || "",
    categoryId: article?.categoryId || "",
    published: article?.published || false,
    featured: article?.featured || false,
    tags: article?.tags?.map((t: any) => t.name).join(", ") || "",
    readTime: article?.readTime || 5
  });

  // Загружаем категории
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Автогенерация slug из заголовка
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: !isEdit || !formData.slug ? generateSlug(title) : formData.slug
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEdit ? `/api/articles/${article.slug}` : "/api/articles";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        router.push("/admin/articles");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Ошибка при сохранении статьи");
      }
    } catch (error) {
      alert("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end);
    
    setFormData({ ...formData, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Рендер категорий с вложенностью
  const renderCategoryOptions = (categories: Category[], level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    categories.forEach(category => {
      // Пропускаем категории без детей и сами родительские категории для статей
      if (!category.parentId && (!category.children || category.children.length === 0)) {
        // Это категория верхнего уровня без детей - можно добавлять статьи
        options.push(
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        );
      }
      
      // Добавляем подкатегории
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          options.push(
            <option key={child.id} value={child.id}>
              {category.title} → {child.title}
            </option>
          );
        });
      }
    });
    
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title */}
        <div className="glass rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Заголовок статьи
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
              text-white placeholder:text-gray-500 
              focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            placeholder="Введите заголовок..."
            required
          />
          
          {/* Slug */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL (slug)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                text-white placeholder:text-gray-500 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="glass rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Краткое описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
              text-white placeholder:text-gray-500 
              focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            rows={3}
            placeholder="Краткое описание для превью..."
          />
        </div>

        {/* Content */}
        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Содержание (Markdown)
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                title="Жирный"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                title="Курсив"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("\n- ")}
                className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                title="Список"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                title="Ссылка"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("`", "`")}
                className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                title="Код"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {showPreview ? (
            <div className="prose prose-invert max-w-none p-4 bg-white/5 rounded-lg min-h-[400px]">
              <div dangerouslySetInnerHTML={{ 
                __html: formData.content
                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br>')
              }} />
            </div>
          ) : (
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                text-white placeholder:text-gray-500 font-mono text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              rows={20}
              placeholder="# Заголовок&#10;&#10;Текст статьи...&#10;&#10;## Подзаголовок&#10;&#10;- Пункт списка&#10;- Еще пункт"
              required
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Settings */}
        <div className="glass rounded-lg p-6">
          <h3 className="font-medium text-white mb-4">Настройки</h3>
          
          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Категория
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50
                [&>option]:text-gray-300 [&>option]:bg-gray-800"
              required
            >
              <option value="">Выберите категорию</option>
              {renderCategoryOptions(categories)}
            </select>
          </div>

          {/* Read Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Время чтения (мин)
            </label>
            <input
              type="number"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              min="1"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                text-white placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="тег1, тег2, тег3"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 bg-white/5 border border-white/20 rounded text-purple-500 focus:ring-purple-500/50"
              />
              <span className="text-sm text-gray-300">Опубликовать сразу</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 bg-white/5 border border-white/20 rounded text-purple-500 focus:ring-purple-500/50"
              />
              <span className="text-sm text-gray-300">Рекомендуемая статья</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="glass rounded-lg p-6">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full mb-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Редактор" : "Предпросмотр"}
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Сохранить изменения" : "Создать статью"}
              </>
            )}
          </button>
          
          <Link
            href="/admin/articles"
            className="mt-3 w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Отмена
          </Link>
        </div>

        {/* Help */}
        <div className="glass rounded-lg p-6">
          <h3 className="font-medium text-white mb-4">Справка по Markdown</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div><code className="text-purple-400"># Заголовок 1</code></div>
            <div><code className="text-purple-400">## Заголовок 2</code></div>
            <div><code className="text-purple-400">**жирный**</code></div>
            <div><code className="text-purple-400">*курсив*</code></div>
            <div><code className="text-purple-400">[текст](ссылка)</code></div>
            <div><code className="text-purple-400">- элемент списка</code></div>
            <div><code className="text-purple-400">`код`</code></div>
          </div>
        </div>
      </div>
    </form>
  );
}