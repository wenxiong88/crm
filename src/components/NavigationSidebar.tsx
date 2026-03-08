import { useContext, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  id: string;
  labelKey: string;
  icon: string;
  iconColor?: string;
  path?: string;
  badge?: number;
  children?: NavigationItem[];
}

interface NavigationSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function NavigationSidebar({ isCollapsed, onToggle }: NavigationSidebarProps) {
  const { themeColor, themeMode } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['finance', 'administrator', 'personalization']);

  // Demo mode state
  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('crm-demo-mode');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  // Quick Access favorites from localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('crm-quick-access');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen for storage changes (when user updates favorites on the QuickAccess page)
  const syncFavorites = useCallback(() => {
    try {
      const stored = localStorage.getItem('crm-quick-access');
      setFavoriteIds(stored ? JSON.parse(stored) : []);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncFavorites);
    // Also poll on focus to catch same-tab changes
    const interval = setInterval(syncFavorites, 2000);
    return () => {
      window.removeEventListener('storage', syncFavorites);
      clearInterval(interval);
    };
  }, [syncFavorites]);

  // Map of all available modules for quick access lookup
  const allModulesMap: Record<string, NavigationItem> = {
    invoices: { id: 'invoices', labelKey: 'invoices', icon: 'fa-file-invoice-dollar', iconColor: '#fbbf24', path: '/finance/invoices' },
    receipts: { id: 'receipts', labelKey: 'receipts', icon: 'fa-receipt', iconColor: '#34d399', path: '/finance/receipts' },
    reports: { id: 'reports', labelKey: 'reports', icon: 'fa-chart-line', iconColor: '#f472b6', path: '/finance/reports' },
    employees: { id: 'employees', labelKey: 'employees', icon: 'fa-users', iconColor: '#38bdf8', path: '/human-resources/employees' },
    payroll: { id: 'payroll', labelKey: 'payroll', icon: 'fa-money-bill-wave', iconColor: '#34d399', path: '/human-resources/payroll' },
    company: { id: 'company', labelKey: 'company', icon: 'fa-building-user', iconColor: '#60a5fa', path: '/administrator/company' },
    project: { id: 'project', labelKey: 'project', icon: 'fa-folder-open', iconColor: '#fbbf24', path: '/administrator/project' },
    user: { id: 'user', labelKey: 'user', icon: 'fa-user-gear', iconColor: '#a78bfa', path: '/administrator/user' },
    userRole: { id: 'userRole', labelKey: 'userRole', icon: 'fa-user-tag', iconColor: '#2dd4bf', path: '/administrator/user-role' },
    customers: { id: 'customers', labelKey: 'customers', icon: 'fa-user-group', iconColor: '#38bdf8', path: '/administrator/customers' },
    suppliers: { id: 'suppliers', labelKey: 'suppliers', icon: 'fa-building', iconColor: '#fb923c', path: '/administrator/suppliers' },
    accessRight: { id: 'accessRight', labelKey: 'accessRight', icon: 'fa-shield-halved', iconColor: '#f87171', path: '/administrator/access-right' },
    stickyNotes: { id: 'stickyNotes', labelKey: 'stickyNotes', icon: 'fa-note-sticky', iconColor: '#fbbf24', path: '/personalization/sticky-notes' },
    feedback: { id: 'feedback', labelKey: 'feedback', icon: 'fa-comment-dots', iconColor: '#a78bfa', path: '/feedback' },
    discover: { id: 'discover', labelKey: 'discover', icon: 'fa-compass', iconColor: '#fb923c', path: '/discover' },
    loginLog: { id: 'loginLog', labelKey: 'loginLog', icon: 'fa-right-to-bracket', iconColor: '#38bdf8', path: '/system-logs/login-log' },
    auditLog: { id: 'auditLog', labelKey: 'auditLog', icon: 'fa-clipboard-check', iconColor: '#a78bfa', path: '/system-logs/audit-log' },
    dataLog: { id: 'dataLog', labelKey: 'dataLog', icon: 'fa-database', iconColor: '#34d399', path: '/system-logs/data-log' },
    errorLog: { id: 'errorLog', labelKey: 'errorLog', icon: 'fa-triangle-exclamation', iconColor: '#f87171', path: '/system-logs/error-log' },
  };

  const favoriteItems: NavigationItem[] = favoriteIds
    .map(id => allModulesMap[id])
    .filter(Boolean);

  const navigationItems: NavigationItem[] = [
    { id: 'discover', labelKey: 'discover', icon: 'fa-compass', iconColor: '#fb923c', path: '/discover' },
    { id: 'dashboard', labelKey: 'dashboard', icon: 'fa-chart-pie', iconColor: '#a78bfa', path: '/' },
    {
      id: 'finance',
      labelKey: 'finance',
      icon: 'fa-coins',
      iconColor: '#fbbf24',
      children: [
        { id: 'invoices', labelKey: 'invoices', icon: 'fa-file-invoice-dollar', iconColor: '#fbbf24', path: '/finance/invoices', badge: 3 },
        { id: 'receipts', labelKey: 'receipts', icon: 'fa-receipt', iconColor: '#34d399', path: '/finance/receipts' },
        { id: 'reports', labelKey: 'reports', icon: 'fa-chart-line', iconColor: '#f472b6', path: '/finance/reports' },
      ]
    },
    {
      id: 'humanResources',
      labelKey: 'humanResources',
      icon: 'fa-people-group',
      iconColor: '#2dd4bf',
      children: [
        { id: 'employees', labelKey: 'employees', icon: 'fa-users', iconColor: '#38bdf8', path: '/human-resources/employees' },
        { id: 'payroll', labelKey: 'payroll', icon: 'fa-money-bill-wave', iconColor: '#34d399', path: '/human-resources/payroll' }
      ]
    },
    {
      id: 'administrator',
      labelKey: 'administrator',
      icon: 'fa-database',
      iconColor: '#fb923c',
      children: [
        { id: 'company', labelKey: 'company', icon: 'fa-building-user', iconColor: '#60a5fa', path: '/administrator/company' },
        { id: 'project', labelKey: 'project', icon: 'fa-folder-open', iconColor: '#fbbf24', path: '/administrator/project' },
        { id: 'role', labelKey: 'role', icon: 'fa-id-badge', iconColor: '#f472b6', path: '/administrator/role' },
        { id: 'user', labelKey: 'user', icon: 'fa-user-gear', iconColor: '#a78bfa', path: '/administrator/user' },
        { id: 'userRole', labelKey: 'userRole', icon: 'fa-user-tag', iconColor: '#2dd4bf', path: '/administrator/user-role' },
        { id: 'customers', labelKey: 'customers', icon: 'fa-user-group', iconColor: '#38bdf8', path: '/administrator/customers' },
        { id: 'suppliers', labelKey: 'suppliers', icon: 'fa-building', iconColor: '#fb923c', path: '/administrator/suppliers' },
        { id: 'menu', labelKey: 'menu', icon: 'fa-bars', iconColor: '#818cf8', path: '/administrator/menu' },
        { id: 'module', labelKey: 'module', icon: 'fa-cubes', iconColor: '#34d399', path: '/administrator/module' },
        { id: 'menuAccess', labelKey: 'menuAccess', icon: 'fa-key', iconColor: '#fbbf24', path: '/administrator/menu-access' },
        { id: 'chargeType', labelKey: 'chargeType', icon: 'fa-tags', iconColor: '#a3e635', path: '/administrator/charge-type' },
        { id: 'chargeCode', labelKey: 'chargeCodeLabel', icon: 'fa-barcode', iconColor: '#22d3ee', path: '/administrator/charge-code' },
        { id: 'transactionCode', labelKey: 'transactionCode', icon: 'fa-exchange-alt', iconColor: '#f59e0b', path: '/administrator/transaction-code' },
        { id: 'accessRight', labelKey: 'accessRight', icon: 'fa-shield-halved', iconColor: '#f87171', path: '/administrator/access-right' }
      ]
    },
    {
      id: 'systemLogs',
      labelKey: 'systemLogs',
      icon: 'fa-clock-rotate-left',
      iconColor: '#94a3b8',
      children: [
        { id: 'loginLog', labelKey: 'loginLog', icon: 'fa-right-to-bracket', iconColor: '#38bdf8', path: '/system-logs/login-log' },
        { id: 'auditLog', labelKey: 'auditLog', icon: 'fa-clipboard-check', iconColor: '#a78bfa', path: '/system-logs/audit-log' },
        { id: 'dataLog', labelKey: 'dataLog', icon: 'fa-database', iconColor: '#34d399', path: '/system-logs/data-log' },
        { id: 'errorLog', labelKey: 'errorLog', icon: 'fa-triangle-exclamation', iconColor: '#f87171', path: '/system-logs/error-log' },
      ]
    },
    {
      id: 'personalization',
      labelKey: 'personalization',
      icon: 'fa-wand-magic-sparkles',
      iconColor: '#ec4899',
      children: [
        { id: 'stickyNotes', labelKey: 'stickyNotes', icon: 'fa-note-sticky', iconColor: '#fbbf24', path: '/personalization/sticky-notes' },
        { id: 'quickAccess', labelKey: 'quickAccess', icon: 'fa-star', iconColor: '#fbbf24', path: '/personalization/quick-access' }
      ]
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: NavigationItem) => {
    if (!item.children) return false;
    return item.children.some(child => child.path && location.pathname.startsWith(child.path));
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: NavigationItem, isChild: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = item.path ? isActive(item.path) : isParentActive(item);

    if (hasChildren) {
      return (
        <li key={item.id}>
          <button
            onClick={() => toggleExpand(item.id)}
            className={cn(
              'w-full flex items-center justify-between rounded-xl transition-all duration-200 nav-item-hover',
              isCollapsed ? 'justify-center py-3 px-2' : 'px-4 py-2.5',
              isItemActive
                ? 'nav-item-active text-white'
                : 'text-white/90 hover:text-white'
            )}
            title={isCollapsed ? t(item.labelKey) : undefined}
          >
            <div className={cn("flex items-center", !isCollapsed && "flex-1")}>
              <div className={cn(
                "flex items-center justify-center w-5",
                !isCollapsed && "mr-3"
              )}>
                <i className={`fa-solid ${item.icon} text-[15px]`} style={!isItemActive && item.iconColor ? { color: item.iconColor } : undefined}></i>
              </div>
              {!isCollapsed && <span className="text-[14px] font-medium">{t(item.labelKey)}</span>}
            </div>
            {!isCollapsed && (
              <motion.i
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="fa-solid fa-chevron-down text-[10px] opacity-50"
              />
            )}
          </button>

          <AnimatePresence initial={false}>
            {!isCollapsed && isExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3"
              >
                {item.children?.map(child => renderMenuItem(child, true))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          to={item.path || '#'}
          className={cn(
            'flex items-center rounded-xl transition-all duration-200 nav-item-hover group',
            isCollapsed ? 'justify-center py-3 px-2' : isChild ? 'px-3 py-2' : 'px-4 py-2.5',
            isItemActive
              ? 'nav-item-active text-white'
              : 'text-white/90 hover:text-white'
          )}
          title={isCollapsed ? t(item.labelKey) : undefined}
        >
          <div className={cn(
            "flex items-center justify-center",
            isCollapsed ? "w-5" : (isChild ? "w-4 mr-2.5" : "w-5 mr-3")
          )}>
            <i className={cn(
              `fa-solid ${item.icon}`,
              isChild ? "text-[13px]" : "text-[15px]"
            )} style={!isItemActive && item.iconColor ? { color: item.iconColor } : undefined}></i>
          </div>
          {!isCollapsed && (
            <span className={cn(
              "flex-1",
              isChild ? "text-[13px]" : "text-[14px] font-medium"
            )}>{t(item.labelKey)}</span>
          )}
          {!isCollapsed && item.badge && (
            <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div className={cn(
      "h-full sidebar-gradient flex flex-col transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("pt-6 pb-4", isCollapsed ? "px-4" : "px-5")}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mr-3 backdrop-blur-sm">
                <i className="fa-solid fa-cube text-white text-base"></i>
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-white tracking-tight">
                  {t('systemTitle')}
                </h1>
                <p className="text-[10px] text-white/60 font-medium tracking-widest uppercase">Enterprise</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <i className="fa-solid fa-cube text-white text-lg"></i>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分隔线 */}
      <div className={cn("mx-4 mb-2", isCollapsed && "mx-3")}>
        <div className="h-px bg-white/10"></div>
      </div>

      {/* Toggle */}
      {!isCollapsed && (
        <div className="px-4 mb-2">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/5 transition-all text-xs"
            title={t('collapseSidebar')}
          >
            <span className="font-medium uppercase tracking-wider">{t('collapseSidebar') || 'Menu'}</span>
            <i className="fa-solid fa-angles-left text-[10px]"></i>
          </button>
        </div>
      )}
      {isCollapsed && (
        <div className="px-3 mb-2 flex justify-center">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/5 transition-all"
            title={t('expandSidebar')}
          >
            <i className="fa-solid fa-angles-right text-[11px]"></i>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        {/* Quick Access Favorites */}
        {favoriteItems.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-3 pt-1 pb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
                  {t('quickAccess')}
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {favoriteItems.map(item => renderMenuItem(item))}
            </ul>
            <div className={cn("my-2", isCollapsed ? "mx-1" : "mx-3")}>
              <div className="h-px bg-white/10"></div>
            </div>
          </>
        )}
        <ul className="space-y-0.5">
          {navigationItems.map(item => renderMenuItem(item))}
        </ul>
      </nav>

      {/* Demo Mode Toggle */}
      <div className={cn("p-3", isCollapsed ? "flex justify-center" : "")}>
        <div className={cn("mx-3 mb-2", isCollapsed && "mx-0")}>
          <div className="h-px bg-white/10"></div>
        </div>
        {isCollapsed ? (
          <button
            onClick={() => {
              const next = !demoMode;
              setDemoMode(next);
              localStorage.setItem('crm-demo-mode', String(next));
              window.location.reload();
            }}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
              demoMode
                ? "bg-amber-500/20 text-amber-300"
                : "bg-emerald-500/20 text-emerald-300"
            )}
            title={demoMode ? 'Demo' : 'Live'}
          >
            {demoMode ? (
              <i className="fa-solid fa-flask text-xs"></i>
            ) : (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animationDuration: '2s' }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => {
              const next = !demoMode;
              setDemoMode(next);
              localStorage.setItem('crm-demo-mode', String(next));
              window.location.reload();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              {demoMode ? (
                <i className="fa-solid fa-flask text-[13px] text-amber-300"></i>
              ) : (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animationDuration: '2s' }}></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              )}
              <span className={cn(
                "font-medium transition-colors",
                demoMode ? "text-[12px] text-white/70 group-hover:text-white/90" : "text-[13px] text-emerald-300 group-hover:text-emerald-200 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
              )}>
                {demoMode ? t('demoMode') : t('apiMode')}
              </span>
            </div>
            <div className={cn(
              "w-8 h-[18px] rounded-full relative transition-all duration-200",
              demoMode ? "bg-amber-500/40" : "bg-emerald-500/40"
            )}>
              <div className={cn(
                "absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all duration-200",
                demoMode
                  ? "left-[2px] bg-amber-300"
                  : "left-[14px] bg-emerald-300"
              )} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
