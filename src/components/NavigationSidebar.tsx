import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  id: string;
  labelKey: string;
  icon: string;
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
  const [expandedItems, setExpandedItems] = useState<string[]>(['masterData']);

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: 'fa-chart-pie', path: '/' },
    { id: 'customers', labelKey: 'customers', icon: 'fa-user-group', path: '/customers' },
    { id: 'invoices', labelKey: 'invoices', icon: 'fa-file-invoice-dollar', path: '/invoices', badge: 3 },
    { id: 'receipts', labelKey: 'receipts', icon: 'fa-receipt', path: '/receipts' },
    { id: 'reports', labelKey: 'reports', icon: 'fa-chart-line', path: '/reports' },
    {
      id: 'masterData',
      labelKey: 'masterData',
      icon: 'fa-database',
      children: [
        { id: 'company', labelKey: 'company', icon: 'fa-building-user', path: '/master-data/company' },
        { id: 'project', labelKey: 'project', icon: 'fa-folder-open', path: '/master-data/project' },
        { id: 'user', labelKey: 'user', icon: 'fa-user-gear', path: '/master-data/user' },
        { id: 'userRole', labelKey: 'userRole', icon: 'fa-user-tag', path: '/master-data/user-role' },
        { id: 'suppliers', labelKey: 'suppliers', icon: 'fa-building', path: '/master-data/suppliers' },
        { id: 'accessRight', labelKey: 'accessRight', icon: 'fa-shield-halved', path: '/master-data/access-right' }
      ]
    },
    {
      id: 'humanResources',
      labelKey: 'humanResources',
      icon: 'fa-people-group',
      children: [
        { id: 'employees', labelKey: 'employees', icon: 'fa-users', path: '/human-resources/employees' }
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
                : 'text-white/60 hover:text-white'
            )}
            title={isCollapsed ? t(item.labelKey) : undefined}
          >
            <div className={cn("flex items-center", !isCollapsed && "flex-1")}>
              <div className={cn(
                "flex items-center justify-center w-5",
                !isCollapsed && "mr-3"
              )}>
                <i className={`fa-solid ${item.icon} text-[15px]`}></i>
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
                className="overflow-hidden ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3"
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
              : 'text-white/60 hover:text-white'
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
            )}></i>
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
                <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Enterprise</p>
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
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all text-xs"
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
            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            title={t('expandSidebar')}
          >
            <i className="fa-solid fa-angles-right text-[11px]"></i>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        <ul className="space-y-0.5">
          {navigationItems.map(item => renderMenuItem(item))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center mr-3">
                <i className="fa-solid fa-user text-white/70 text-xs"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">Admin</p>
                <p className="text-[10px] text-white/40 truncate">admin@crm.com</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center text-white/25 mt-3">
            <span className="text-[10px] tracking-wider">v1.0.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
