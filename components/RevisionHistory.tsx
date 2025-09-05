"use client";

import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  User,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Check,
  X,
  Loader2,
  GitBranch,
  Hash
} from 'lucide-react';

interface Revision {
  id: string;
  title: string;
  description: string | null;
  content: string;
  version: number;
  comment: string | null;
  changeType: 'CREATE' | 'UPDATE' | 'RESTORE' | 'DELETE';
  articleId: string;
  authorId: string;
  author: {
    username: string;
    email: string;
  };
  createdAt: string;
}

interface RevisionHistoryProps {
  articleId: string;
  currentTitle?: string;
}

export default function RevisionHistory({ 
  articleId, 
  currentTitle = "История изменений",   
}: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);

  useEffect(() => {
    fetchRevisions();
  }, [articleId]);

  const fetchRevisions = async () => {
    try {
      const response = await fetch(`/api/revisions/${articleId}`);
      const data = await response.json();
      setRevisions(data);
    } catch (error) {
      console.error('Error fetching revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (revision: Revision) => {
    setRestoring(true);
    try {
      const response = await fetch(
        `/api/revisions/${articleId}/${revision.id}/restore`,
        { method: 'POST' }
      );

      if (response.ok) {
        // Обновляем список версий
        await fetchRevisions();
        
        window.location.reload();
        
        setShowConfirm(false);
        setSelectedRevision(null);
      }
    } catch (error) {
      console.error('Error restoring revision:', error);
    } finally {
      setRestoring(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedVersions(prev =>
      prev.includes(id)
        ? prev.filter(v => v !== id)
        : [...prev, id]
    );
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'CREATE': return <FileText className="w-4 h-4 text-green-400" />;
      case 'UPDATE': return <GitBranch className="w-4 h-4 text-blue-400" />;
      case 'RESTORE': return <RotateCcw className="w-4 h-4 text-purple-400" />;
      case 'DELETE': return <X className="w-4 h-4 text-red-400" />;
      default: return <History className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'CREATE': return 'Создание';
      case 'UPDATE': return 'Обновление';
      case 'RESTORE': return 'Восстановление';
      case 'DELETE': return 'Удаление';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} мин назад`;
    }
    if (hours < 24) {
      return `${hours} ч назад`;
    }
    if (hours < 48) {
      return 'Вчера';
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <History className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">История версий</h3>
        <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
          {revisions.length} версий
        </span>
      </div>

      {/* Versions List */}
      <div className="space-y-2">
        {revisions.map((revision) => {
          const isExpanded = expandedVersions.includes(revision.id);
          const isLatest = revision.version === Math.max(...revisions.map(r => r.version));
          
          return (
            <div
              key={revision.id}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/[0.07] transition-colors"
            >
              {/* Version Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleExpanded(revision.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-gray-500" />
                        <span className="font-mono text-sm text-white">v{revision.version}</span>
                      </span>
                      
                      <span className="flex items-center gap-1">
                        {getChangeTypeIcon(revision.changeType)}
                        <span className="text-xs text-gray-400">
                          {getChangeTypeLabel(revision.changeType)}
                        </span>
                      </span>
                      
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-green-500/20 rounded text-xs text-green-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Текущая
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {revision.author.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(revision.createdAt)}
                      </span>
                    </div>
                    
                    {revision.comment && (
                      <p className="text-sm text-gray-300 mt-2">
                        {revision.comment}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isLatest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRevision(revision);
                          setShowConfirm(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Восстановить эту версию"
                      >
                        <RotateCcw className="w-4 h-4 text-purple-400" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(revision.id);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/10 p-4 bg-black/20">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Заголовок:</h4>
                      <p className="text-white">{revision.title}</p>
                    </div>
                    
                    {revision.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Описание:</h4>
                        <p className="text-gray-300">{revision.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Превью контента:</h4>
                      <div className="bg-black/30 rounded p-3 max-h-40 overflow-y-auto">
                        <div 
                          className="text-sm text-gray-300 line-clamp-5"
                          dangerouslySetInnerHTML={{ 
                            __html: revision.content.substring(0, 500) + '...' 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedRevision(revision);
                          setShowPreview(true);
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-3 h-3" />
                        Полный просмотр
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Restore Confirmation Modal */}
      {showConfirm && selectedRevision && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Восстановить версию {selectedRevision.version}?
                </h3>
                <p className="text-sm text-gray-400">
                  Текущая версия будет сохранена в истории. Вы сможете вернуться к ней в любой момент.
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded p-3 mb-4">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Автор:</span> {selectedRevision.author.username}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-medium">Дата:</span> {new Date(selectedRevision.createdAt).toLocaleString('ru-RU')}
              </p>
              {selectedRevision.comment && (
                <p className="text-sm text-gray-300 mt-1">
                  <span className="font-medium">Комментарий:</span> {selectedRevision.comment}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleRestore(selectedRevision)}
                disabled={restoring}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Восстановление...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Восстановить
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedRevision(null);
                }}
                disabled={restoring}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedRevision && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Версия {selectedRevision.version} - {selectedRevision.title}
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedRevision(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedRevision.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}