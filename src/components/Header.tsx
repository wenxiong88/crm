import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/authContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { themeColor, themeMode, setThemeColor, toggleThemeMode } = useContext(ThemeContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast(t('logoutSuccess'));
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeColors: Record<string, { from: string; to: string; label: string }> = {
    blue: { from: '#6366f1', to: '#60a5fa', label: 'Indigo' },
    purple: { from: '#8b5cf6', to: '#f472b6', label: 'Purple' },
    green: { from: '#14b8a6', to: '#34d399', label: 'Teal' },
    orange: { from: '#f97316', to: '#fbbf24', label: 'Orange' },
    rose: { from: '#f43f5e', to: '#e879f9', label: 'Rose' },
  };

  return (
    <header className="glass-header h-16 flex items-center justify-between px-6 z-10 relative">
      {/* Left side */}
      <div className="flex items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white leading-tight">
            {t('welcome')}
          </h2>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <button
          className="h-9 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        >
          <i className="fa-solid fa-globe mr-1.5 text-[11px]"></i>
          {language === 'zh' ? 'EN' : '中'}
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* Theme color picker */}
        <div className="flex items-center gap-1.5 px-2">
          {(['blue', 'purple', 'green', 'orange', 'rose'] as const).map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
                themeColor === color
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110'
                  : 'opacity-50 hover:opacity-90 hover:scale-105'
              }`}
              style={{
                background: `linear-gradient(135deg, ${themeColors[color].from}, ${themeColors[color].to})`,
                ringColor: themeColors[color].from,
              }}
              onClick={() => setThemeColor(color)}
              aria-label={`Set ${color} theme`}
            >
              {themeColor === color && (
                <i className="fa-solid fa-check text-white text-[8px] drop-shadow-sm"></i>
              )}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* Dark/Light mode toggle */}
        <button
          className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
          onClick={toggleThemeMode}
          aria-label={themeMode === 'dark' ? t('lightMode') : t('darkMode')}
        >
          <i className={`fa-solid ${themeMode === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
        </button>

        {/* Notification bell */}
        <button className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all relative">
          <i className="fa-solid fa-bell text-sm"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${themeColors[themeColor].from}, ${themeColors[themeColor].to})`,
              }}
            >
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">Admin</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{t('profile')}</p>
            </div>
            <i className={`fa-solid fa-chevron-down text-[9px] text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50 overflow-hidden"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Admin</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">admin@crm.com</p>
                </div>

                <div className="py-1">
                  {[
                    { icon: 'fa-user', label: t('profile') },
                    { icon: 'fa-bell', label: t('notifications'), badge: 3 },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <i className={`fa-solid ${item.icon} w-4 text-center mr-3 text-xs text-gray-400`}></i>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                  {[
                    { icon: 'fa-message', label: t('feedback'), path: '/feedback' },
                    { icon: 'fa-gear', label: t('settings'), path: '/settings' },
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <i className={`fa-solid ${item.icon} w-4 text-center mr-3 text-xs text-gray-400`}></i>
                      <span className="flex-1 text-left">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket w-4 text-center mr-3 text-xs"></i>
                    {t('logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
