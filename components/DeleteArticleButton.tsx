"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface DeleteArticleButtonProps {
  articleSlug: string;
  articleTitle: string;
}

export default function DeleteArticleButton({ articleSlug, articleTitle }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/articles/${articleSlug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Ошибка при удалении статьи");
      }
    } catch (error) {
      alert("Произошла ошибка");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const ConfirmModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowConfirm(false)}
      />
      <div className="relative glass-dark rounded-lg p-6 max-w-md w-full border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Удалить статью?
          </h3>
        </div>
        
        <p className="text-gray-400 mb-6">
          Вы уверены, что хотите удалить статью <span className="text-white font-medium">"{articleTitle}"</span>? 
          Это действие нельзя отменить.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
              hover:bg-white/10 transition-colors text-gray-300"
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 
              rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Удалить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
        title="Удалить"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Render modal via portal */}
      {mounted && showConfirm && createPortal(
        <ConfirmModal />,
        document.body
      )}
    </>
  );
}