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
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast(t('logoutSuccess'));
    setIsDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeColors: Record<string, { from: string; to: string; label: string }> = {
    blue: { from: '#4f46e5', to: '#06b6d4', label: '宝石蓝' },
    purple: { from: '#7c3aed', to: '#ec4899', label: '梦幻紫' },
    green: { from: '#059669', to: '#14b8a6', label: '翡翠绿' },
    orange: { from: '#ea580c', to: '#eab308', label: '日落橙' },
    rose: { from: '#e11d48', to: '#a855f7', label: '樱桃红' },
  };

  return (
    <header className="glass-header h-16 flex items-center justify-between px-6 z-30 relative">
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

        {/* Theme picker dropdown */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            className="h-9 px-3 rounded-lg flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
          >
            <div
              className="w-4 h-4 rounded-full ring-1 ring-black/10 dark:ring-white/20"
              style={{
                background: `linear-gradient(135deg, ${themeColors[themeColor].from}, ${themeColors[themeColor].to})`,
              }}
            />
            <span className="text-xs font-medium hidden sm:inline">{themeColors[themeColor].label}</span>
            <i className={`fa-solid fa-chevron-down text-[9px] text-gray-400 transition-transform duration-200 ${isThemeDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          <AnimatePresence>
            {isThemeDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50 overflow-hidden"
              >
                {/* Theme options */}
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">{t('themeColor')}</p>
                </div>
                {(['blue', 'purple', 'green', 'orange', 'rose'] as const).map(color => (
                  <button
                    key={color}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      themeColor === color
                        ? 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => {
                      setThemeColor(color);
                      setIsThemeDropdownOpen(false);
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full ring-1 ring-black/10 dark:ring-white/20 flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors[color].from}, ${themeColors[color].to})`,
                      }}
                    />
                    <span className="flex-1 text-left text-[13px] font-medium">{themeColors[color].label}</span>
                    {themeColor === color && (
                      <i className="fa-solid fa-check text-[11px]" style={{ color: themeColors[color].from }}></i>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div className="my-1.5 mx-3 h-px bg-gray-100 dark:bg-gray-800"></div>

                {/* Dark mode toggle */}
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={toggleThemeMode}
                >
                  <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${themeMode === 'dark' ? 'fa-sun' : 'fa-moon'} text-[10px] text-gray-500 dark:text-gray-400`}></i>
                  </div>
                  <span className="flex-1 text-left text-[13px] font-medium">
                    {themeMode === 'dark' ? t('lightMode') : t('darkMode')}
                  </span>
                  <div className={`w-8 h-[18px] rounded-full flex items-center px-0.5 transition-all duration-300 ${
                    themeMode === 'dark' ? 'bg-[var(--primary-color)] justify-end' : 'bg-gray-300 justify-start'
                  }`}>
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"></span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
