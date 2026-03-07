import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ModuleItem {
  id: string;
  labelKey: string;
  icon: string;
  iconColor: string;
  category: string;
  categoryKey: string;
}

const STORAGE_KEY = 'crm-quick-access';

const ALL_MODULES: ModuleItem[] = [
  { id: 'invoices', labelKey: 'invoices', icon: 'fa-file-invoice-dollar', iconColor: '#fbbf24', category: 'finance', categoryKey: 'finance' },
  { id: 'receipts', labelKey: 'receipts', icon: 'fa-receipt', iconColor: '#34d399', category: 'finance', categoryKey: 'finance' },
  { id: 'reports', labelKey: 'reports', icon: 'fa-chart-line', iconColor: '#f472b6', category: 'finance', categoryKey: 'finance' },
  { id: 'employees', labelKey: 'employees', icon: 'fa-users', iconColor: '#38bdf8', category: 'humanResources', categoryKey: 'humanResources' },
  { id: 'payroll', labelKey: 'payroll', icon: 'fa-money-bill-wave', iconColor: '#34d399', category: 'humanResources', categoryKey: 'humanResources' },
  { id: 'company', labelKey: 'company', icon: 'fa-building-user', iconColor: '#60a5fa', category: 'administrator', categoryKey: 'administrator' },
  { id: 'project', labelKey: 'project', icon: 'fa-folder-open', iconColor: '#fbbf24', category: 'administrator', categoryKey: 'administrator' },
  { id: 'user', labelKey: 'user', icon: 'fa-user-gear', iconColor: '#a78bfa', category: 'administrator', categoryKey: 'administrator' },
  { id: 'userRole', labelKey: 'userRole', icon: 'fa-user-tag', iconColor: '#2dd4bf', category: 'administrator', categoryKey: 'administrator' },
  { id: 'customers', labelKey: 'customers', icon: 'fa-user-group', iconColor: '#38bdf8', category: 'administrator', categoryKey: 'administrator' },
  { id: 'suppliers', labelKey: 'suppliers', icon: 'fa-building', iconColor: '#fb923c', category: 'administrator', categoryKey: 'administrator' },
  { id: 'accessRight', labelKey: 'accessRight', icon: 'fa-shield-halved', iconColor: '#f87171', category: 'administrator', categoryKey: 'administrator' },
  { id: 'stickyNotes', labelKey: 'stickyNotes', icon: 'fa-note-sticky', iconColor: '#fbbf24', category: 'personalization', categoryKey: 'personalization' },
  { id: 'feedback', labelKey: 'feedback', icon: 'fa-comment-dots', iconColor: '#a78bfa', category: 'other', categoryKey: 'feedback' },
];

export default function QuickAccess() {
  const { t, language } = useContext(LanguageContext);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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
    ), { duration: 3000 });
  };

  const toggleFavorite = (moduleId: string) => {
    setFavoriteIds(prev => {
      const next = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      const mod = ALL_MODULES.find(m => m.id === moduleId);
      const modName = mod ? t(mod.labelKey) : moduleId;
      if (next.includes(moduleId)) {
        showSuccessToast(t('quickAccessUpdated'), language === 'zh' ? `已添加「${modName}」` : `Added "${modName}"`);
      } else {
        showSuccessToast(t('quickAccessUpdated'), language === 'zh' ? `已移除「${modName}」` : `Removed "${modName}"`);
      }

      return next;
    });
  };

  // Group modules by category
  const categories = [
    { key: 'finance', labelKey: 'finance', icon: 'fa-coins', iconColor: '#fbbf24' },
    { key: 'humanResources', labelKey: 'humanResources', icon: 'fa-people-group', iconColor: '#2dd4bf' },
    { key: 'administrator', labelKey: 'administrator', icon: 'fa-database', iconColor: '#fb923c' },
    { key: 'personalization', labelKey: 'personalization', icon: 'fa-wand-magic-sparkles', iconColor: '#ec4899' },
    { key: 'other', labelKey: 'feedback', icon: 'fa-comment-dots', iconColor: '#a78bfa' },
  ];

  return (
    <div className="space-y-3">
      {/* Page Header - Sticky */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-star text-white text-sm"></i>
              </span>
              {t('quickAccess')}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('manageQuickAccess')}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <i className="fa-solid fa-th-large text-[10px]"></i>
            <span>{ALL_MODULES.length} {language === 'zh' ? '个模块' : 'modules'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400">
            <i className="fa-solid fa-star text-[10px]"></i>
            <span>{favoriteIds.length} {language === 'zh' ? '个已选' : 'selected'}</span>
          </div>
        </div>
      </div>

      {/* Selected preview */}
      {favoriteIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800/60 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-star text-amber-400 text-[11px]"></i>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {language === 'zh' ? '侧边栏快捷入口预览' : 'Sidebar Quick Access Preview'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteIds.map(id => {
              const mod = ALL_MODULES.find(m => m.id === id);
              if (!mod) return null;
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                >
                  <i className={`fa-solid ${mod.icon} text-xs`} style={{ color: mod.iconColor }}></i>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t(mod.labelKey)}</span>
                  <button
                    onClick={() => toggleFavorite(id)}
                    className="ml-1 w-4 h-4 rounded flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-[9px]"></i>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Module Grid by Category */}
      <div className="space-y-6">
        {categories.map(cat => {
          const modules = ALL_MODULES.filter(m => m.category === cat.key);
          if (modules.length === 0) return null;

          return (
            <div key={cat.key}>
              <div className="flex items-center gap-2 mb-3">
                <i className={`fa-solid ${cat.icon} text-[11px]`} style={{ color: cat.iconColor }}></i>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t(cat.labelKey)}
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800/50"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {modules.map((mod, i) => {
                  const isFav = favoriteIds.includes(mod.id);
                  return (
                    <motion.button
                      key={mod.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 28 }}
                      onClick={() => toggleFavorite(mod.id)}
                      className={`relative group p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        isFav
                          ? 'border-amber-300 dark:border-amber-600/60 bg-amber-50/80 dark:bg-amber-900/20 shadow-sm shadow-amber-200/30 dark:shadow-amber-900/20'
                          : 'border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900/40 hover:border-gray-200 dark:hover:border-gray-700/60 hover:shadow-sm'
                      }`}
                    >
                      {/* Star indicator */}
                      <div className={`absolute top-2.5 right-2.5 transition-all duration-200 ${
                        isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                      }`}>
                        <i className={`fa-${isFav ? 'solid' : 'regular'} fa-star text-sm ${
                          isFav ? 'text-amber-400' : 'text-gray-400'
                        }`}></i>
                      </div>

                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: mod.iconColor + '18' }}
                      >
                        <i className={`fa-solid ${mod.icon} text-base`} style={{ color: mod.iconColor }}></i>
                      </div>

                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block leading-tight">
                        {t(mod.labelKey)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state hint */}
      {favoriteIds.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-3">
            <i className="fa-regular fa-star text-amber-400 text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noFavorites')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {language === 'zh' ? '点击上方模块卡片即可添加到快捷访问' : 'Click a module card above to add it to quick access'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
