import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const NOTE_COLORS = [
  { id: 'yellow', bg: 'from-amber-100 to-yellow-50', border: 'border-amber-200/60', dark: 'dark:from-amber-900/30 dark:to-yellow-900/20', darkBorder: 'dark:border-amber-700/30', icon: '#f59e0b' },
  { id: 'pink', bg: 'from-pink-100 to-rose-50', border: 'border-pink-200/60', dark: 'dark:from-pink-900/30 dark:to-rose-900/20', darkBorder: 'dark:border-pink-700/30', icon: '#ec4899' },
  { id: 'blue', bg: 'from-blue-100 to-sky-50', border: 'border-blue-200/60', dark: 'dark:from-blue-900/30 dark:to-sky-900/20', darkBorder: 'dark:border-blue-700/30', icon: '#3b82f6' },
  { id: 'green', bg: 'from-emerald-100 to-green-50', border: 'border-emerald-200/60', dark: 'dark:from-emerald-900/30 dark:to-green-900/20', darkBorder: 'dark:border-emerald-700/30', icon: '#10b981' },
  { id: 'purple', bg: 'from-violet-100 to-purple-50', border: 'border-violet-200/60', dark: 'dark:from-violet-900/30 dark:to-purple-900/20', darkBorder: 'dark:border-violet-700/30', icon: '#8b5cf6' },
  { id: 'orange', bg: 'from-orange-100 to-amber-50', border: 'border-orange-200/60', dark: 'dark:from-orange-900/30 dark:to-amber-900/20', darkBorder: 'dark:border-orange-700/30', icon: '#f97316' },
];

const STORAGE_KEY = 'crm-sticky-notes';

export default function StickyNotes() {
  const { t, language } = useContext(LanguageContext);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StickyNote | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formColor, setFormColor] = useState('yellow');
  const [searchTerm, setSearchTerm] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setNotes(JSON.parse(saved)); } catch { /* empty */ }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const showSuccessToast = (title: string, description: string) => {
    toast.custom((toastId) => (
      <div
        className="w-[360px] bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden"
        style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        <div className="h-1 btn-gradient" />
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-check text-white text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5">
              <i className="fa-regular fa-clock mr-1" />
              {format(new Date(), 'dd MMM yyyy HH:mm')}
            </p>
          </div>
          <button
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0"
            onClick={() => toast.dismiss(toastId)}
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const getColor = (colorId: string) => NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];

  const openAddModal = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormColor('yellow');
    setIsModalOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const openEditModal = (note: StickyNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormColor(note.color);
    setIsModalOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    if (!formTitle.trim() && !formContent.trim()) return;
    const now = new Date().toISOString();

    if (editingNote) {
      setNotes(prev => prev.map(n =>
        n.id === editingNote.id
          ? { ...n, title: formTitle, content: formContent, color: formColor, updatedAt: now }
          : n
      ));
      showSuccessToast(t('noteUpdated'), formTitle || (language === 'zh' ? '便签已更新' : 'Note updated'));
    } else {
      const newNote: StickyNote = {
        id: crypto.randomUUID(),
        title: formTitle,
        content: formContent,
        color: formColor,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      };
      setNotes(prev => [newNote, ...prev]);
      showSuccessToast(t('noteAdded'), formTitle || (language === 'zh' ? '新便签已添加' : 'New note added'));
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setNotes(prev => prev.filter(n => n.id !== deleteTarget.id));
    showSuccessToast(t('noteDeleted'), deleteTarget.title || (language === 'zh' ? '便签已删除' : 'Note deleted'));
    setDeleteTarget(null);
  };

  const togglePin = (noteId: string) => {
    setNotes(prev => {
      const target = prev.find(n => n.id === noteId);
      if (!target) return prev;
      const updated = prev.filter(n => n.id !== noteId);
      const toggled = { ...target, pinned: !target.pinned };
      // Move to front of its new section
      if (toggled.pinned) {
        // Insert at front (pinned notes are first in array)
        return [toggled, ...updated];
      } else {
        // Insert after last pinned note
        const lastPinnedIdx = updated.reduce((acc, n, i) => n.pinned ? i : acc, -1);
        updated.splice(lastPinnedIdx + 1, 0, toggled);
        return [...updated];
      }
    });
  };

  // --- Drag and Drop ---
  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDragId(noteId);
    e.dataTransfer.effectAllowed = 'move';
    // Make the ghost semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, 20);
    }
  };

  const handleDragOver = (e: React.DragEvent, noteId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (noteId !== dragId) {
      setDragOverId(noteId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    setNotes(prev => {
      const fromNote = prev.find(n => n.id === dragId);
      const toNote = prev.find(n => n.id === targetId);
      if (!fromNote || !toNote) return prev;

      // Only allow reorder within same pin group
      if (fromNote.pinned !== toNote.pinned) return prev;

      const newNotes = [...prev];
      const fromIdx = newNotes.findIndex(n => n.id === dragId);
      const toIdx = newNotes.findIndex(n => n.id === targetId);

      // Remove from old position and insert at new position
      newNotes.splice(fromIdx, 1);
      newNotes.splice(toIdx, 0, fromNote);

      return newNotes;
    });

    setDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  // --- Filtering (no auto-sort, preserve manual order) ---
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return language === 'zh' ? '刚刚' : 'Just now';
      if (diffMins < 60) return language === 'zh' ? `${diffMins}分钟前` : `${diffMins}m ago`;
      if (diffHours < 24) return language === 'zh' ? `${diffHours}小时前` : `${diffHours}h ago`;
      if (diffDays < 7) return language === 'zh' ? `${diffDays}天前` : `${diffDays}d ago`;
      return format(d, 'MM/dd');
    } catch {
      return '';
    }
  };

  const renderNoteCard = (note: StickyNote, index: number) => {
    const color = getColor(note.color);
    const isDragging = dragId === note.id;
    const isDragOver = dragOverId === note.id;

    return (
      <motion.div
        key={note.id}
        layout
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: isDragging ? 0.4 : 1,
          scale: isDragOver ? 1.03 : 1,
          y: 0,
        }}
        exit={{ opacity: 0, scale: 0.85, y: -10 }}
        transition={{ delay: index * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
        draggable
        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, note.id)}
        onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, note.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e as unknown as React.DragEvent, note.id)}
        onDragEnd={handleDragEnd}
        className={`relative group bg-gradient-to-br ${color.bg} ${color.dark} border-2 ${
          isDragOver
            ? 'border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/10'
            : isDragging
            ? 'border-dashed border-gray-300 dark:border-gray-600'
            : `${color.border} ${color.darkBorder}`
        } rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-150 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20`}
        style={{ transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.15s' }}
      >
        {/* Drop zone indicator */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 rounded-2xl bg-blue-400/10 dark:bg-blue-500/10 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-blue-500/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <i className="fa-solid fa-arrows-up-down-left-right text-[10px]"></i>
              {language === 'zh' ? '放置到这里' : 'Drop here'}
            </div>
          </div>
        )}

        {/* Pin indicator */}
        {note.pinned && (
          <div className="absolute -top-0.5 right-4 z-10">
            <div className="w-5 h-7 rounded-b-full bg-red-500 shadow-md flex items-end justify-center pb-1">
              <i className="fa-solid fa-thumbtack text-white text-[8px]"></i>
            </div>
          </div>
        )}

        {/* Card header with actions */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color.icon }}></div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
              {formatDate(note.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${note.pinned ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' : 'text-gray-400 hover:text-gray-600 hover:bg-white/60 dark:hover:bg-white/10'}`}
              title={note.pinned ? t('unpinNote') : t('pinNote')}
            >
              <i className={`fa-solid fa-thumbtack text-[10px] ${note.pinned ? '' : 'rotate-45'}`}></i>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openEditModal(note); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <i className="fa-solid fa-pen text-[10px]"></i>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(note); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <i className="fa-solid fa-trash text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4" onClick={() => openEditModal(note)}>
          {note.title && (
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1.5 line-clamp-2 leading-snug">
              {note.title}
            </h3>
          )}
          {note.content && (
            <p className="text-[13px] text-gray-600 dark:text-gray-300 line-clamp-6 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          )}
          {!note.title && !note.content && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              {language === 'zh' ? '空便签' : 'Empty note'}
            </p>
          )}
        </div>

        {/* Drag handle hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
            <i className="fa-solid fa-grip-dots-vertical text-[8px] text-gray-400 dark:text-gray-500"></i>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">{t('dragToMove')}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Page Header - Sticky */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-note-sticky text-white text-sm"></i>
              </span>
              {t('stickyNotes')}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('manageStickyNotes')}</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search')}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm input-themed text-gray-900 dark:text-white w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>

            <button
              className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2 flex items-center justify-center gap-2"
              onClick={openAddModal}
            >
              <i className="fa-solid fa-plus text-xs"></i>
              {t('addNote')}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <i className="fa-solid fa-note-sticky text-[10px]"></i>
            <span>{notes.length} {language === 'zh' ? '个便签' : 'notes'}</span>
          </div>
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 dark:text-red-500">
              <i className="fa-solid fa-thumbtack text-[10px]"></i>
              <span>{pinnedNotes.length} {language === 'zh' ? '个置顶' : 'pinned'}</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {NOTE_COLORS.map(c => (
              <div key={c.id} className="w-3 h-3 rounded-full ring-1 ring-black/5" style={{ backgroundColor: c.icon }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 && !searchTerm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 border border-amber-200/60 dark:border-amber-700/30 flex items-center justify-center rotate-6 shadow-lg">
              <i className="fa-solid fa-note-sticky text-amber-400 text-3xl"></i>
            </div>
            <div className="absolute -top-2 -right-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/20 border border-pink-200/60 dark:border-pink-700/30 flex items-center justify-center -rotate-12 shadow-md">
              <i className="fa-solid fa-pen text-pink-400 text-lg"></i>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {language === 'zh' ? '开始记录你的想法' : 'Start capturing your ideas'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
            {t('noNotes')}
          </p>
          <button
            className="btn-gradient rounded-xl text-sm font-medium text-white px-6 py-2.5 flex items-center gap-2 shadow-lg"
            onClick={openAddModal}
          >
            <i className="fa-solid fa-plus text-xs"></i>
            {t('addNote')}
          </button>
        </motion.div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-4">
            <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'zh' ? '未找到匹配的便签' : 'No matching notes found'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <i className="fa-solid fa-thumbtack text-red-400 text-[11px]"></i>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {language === 'zh' ? '置顶' : 'Pinned'}
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800/50"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {pinnedNotes.map((note, i) => renderNoteCard(note, i))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Unpinned Section */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-regular fa-note-sticky text-gray-400 text-[11px]"></i>
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {language === 'zh' ? '其他' : 'Others'}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800/50"></div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {unpinnedNotes.map((note, i) => renderNoteCard(note, i))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-lg overflow-hidden modal-content relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full btn-gradient" />

              <div className="p-6 pb-0 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <i className={`fa-solid ${editingNote ? 'fa-pen' : 'fa-plus'} text-white text-xs`}></i>
                  </div>
                  {editingNote ? t('editNote') : t('addNote')}
                </h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Color picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wider">
                    {t('noteColor')}
                  </label>
                  <div className="flex items-center gap-2">
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setFormColor(c.id)}
                        className={`w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center ${
                          formColor === c.id
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110 shadow-md'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.icon }}
                      >
                        {formColor === c.id && (
                          <i className="fa-solid fa-check text-white text-xs"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    {t('noteTitle')}
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    placeholder={language === 'zh' ? '输入标题...' : 'Enter title...'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-900 dark:text-white input-themed placeholder-gray-400 dark:placeholder-gray-600 font-medium"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    {t('noteContent')}
                  </label>
                  <textarea
                    placeholder={language === 'zh' ? '输入内容...' : 'Write your note...'}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-900 dark:text-white input-themed placeholder-gray-400 dark:placeholder-gray-600 resize-none leading-relaxed"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>

                {/* Live preview */}
                {(formTitle || formContent) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                      {language === 'zh' ? '预览' : 'Preview'}
                    </label>
                    <div className={`bg-gradient-to-br ${getColor(formColor).bg} ${getColor(formColor).dark} border ${getColor(formColor).border} ${getColor(formColor).darkBorder} rounded-xl p-4`}>
                      {formTitle && <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{formTitle}</p>}
                      {formContent && <p className="text-[13px] text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3 leading-relaxed">{formContent}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm"
                  onClick={handleSave}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('confirmDelete')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmDeleteMessage')}</p>
                {deleteTarget.title && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">"{deleteTarget.title}"</p>
                )}
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setDeleteTarget(null)}
                >
                  {t('cancel')}
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white transition-colors"
                  onClick={handleDelete}
                >
                  {t('delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
