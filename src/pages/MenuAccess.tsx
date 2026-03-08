import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { menuAccessAPI, menuAPI, userRoleAPI } from '../services/api';
import { MenuAccess, MenuItem, UserRole } from '../services/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MenuAccessPage() {
  const { t, language } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);

  const [items, setItems] = useState<MenuAccess[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuAccess>>({});
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MenuAccess | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [accessData, menuData, roleData] = await Promise.all([
        menuAccessAPI.getMenuAccess(),
        menuAPI.getMenuItems(),
        userRoleAPI.getUserRoles(),
      ]);
      setItems(accessData);
      setMenus(menuData);
      setRoles(roleData);
    } catch {
      toast.error(t('fetchError') || '获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const delName = deleteTarget.menuName;
    try {
      await menuAccessAPI.deleteMenuAccess(deleteTarget.id);
      setItems(prev => prev.filter(r => r.id !== deleteTarget.id));
      showToast(language === 'zh' ? '删除成功' : 'Deleted Successfully', language === 'zh' ? `${delName} 已被删除` : `${delName} has been deleted`, 'delete');
    } catch {
      toast.error(t('deleteError') || '删除失败');
    } finally {
      setDeleteTarget(null);
    }
  };

  const showToast = (title: string, description: string, variant: 'add' | 'update' | 'delete' = 'update') => {
    const config = { add: { icon: 'fa-solid fa-plus', bar: 'bg-gradient-to-r from-emerald-400 to-cyan-500', iconBg: 'bg-gradient-to-br from-emerald-400 to-cyan-500' }, update: { icon: 'fa-solid fa-check', bar: 'btn-gradient', iconBg: 'btn-gradient' }, delete: { icon: 'fa-solid fa-trash-can', bar: 'bg-gradient-to-r from-red-400 to-rose-500', iconBg: 'bg-gradient-to-br from-red-400 to-rose-500' } }[variant];
    toast.custom((id) => (
      <div className="w-[360px] bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden" style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div className={`h-1 ${config.bar}`} />
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}><i className={`${config.icon} text-white text-sm`} /></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p><p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5"><i className="fa-regular fa-clock mr-1" />{format(new Date(), 'dd MMM yyyy HH:mm')}</p></div>
          <button className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0" onClick={() => toast.dismiss(id)}><i className="fa-solid fa-xmark text-xs" /></button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
  };

  const handleAdd = async () => {
    const menuId = currentItem.menuId || '';
    const menu = menus.find(m => m.id === menuId);
    const menuName = menu?.name || '';
    const roleNames = roles.filter(r => selectedRoleIds.includes(r.id)).map(r => r.name);
    try {
      const created = await menuAccessAPI.createMenuAccess({ menuId, menuName, roleIds: selectedRoleIds, roleNames });
      setItems(prev => [...prev, created]);
      setIsAddModalOpen(false);
      setCurrentItem({});
      setSelectedRoleIds([]);
      showToast(language === 'zh' ? '添加成功' : 'Added Successfully', language === 'zh' ? `${menuName} 已成功添加` : `${menuName} has been added`, 'add');
    } catch {
      toast.error(t('addError') || '添加失败');
    }
  };

  const handleEdit = async () => {
    if (!currentItem.id) return;
    const menuName = currentItem.menuName || '';
    const roleNames = roles.filter(r => selectedRoleIds.includes(r.id)).map(r => r.name);
    try {
      await menuAccessAPI.updateMenuAccess(currentItem.id, { roleIds: selectedRoleIds, roleNames });
      setItems(prev => prev.map(r => r.id === currentItem.id ? { ...r, roleIds: selectedRoleIds, roleNames } : r));
      setIsEditModalOpen(false);
      setCurrentItem({});
      setSelectedRoleIds([]);
      showToast(language === 'zh' ? '更新成功' : 'Update Successful', language === 'zh' ? `${menuName} 的权限已更新` : `${menuName} access has been updated`, 'update');
    } catch {
      toast.error(t('updateError') || '更新失败');
    }
  };

  const filteredItems = items.filter(item =>
    item.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.roleNames.some(rn => rn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const getPageNumbers = () => { const pages: (number | string)[] = []; if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); } else { pages.push(1); if (safePage > 3) pages.push('...'); for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i); if (safePage < totalPages - 2) pages.push('...'); pages.push(totalPages); } return pages; };
  const getInitials = (name: string) => name.charAt(0).toUpperCase();
  const hasError = (field: string) => !!validationErrors[field];

  // Already configured menu IDs (for add - avoid duplicates)
  const configuredMenuIds = items.map(i => i.menuId);

  const validateRequired = (): boolean => {
    const errors: Record<string, string> = {};
    if (!currentItem.menuId) errors.menuId = language === 'zh' ? '菜单' : 'Menu';
    if (selectedRoleIds.length === 0) errors.roles = language === 'zh' ? '角色' : 'Role';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const ValidationBanner = () => {
    const errorList = Object.values(validationErrors);
    if (errorList.length === 0) return null;
    return (
      <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} className="rounded-xl border border-red-200 dark:border-red-800/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="fa-solid fa-circle-exclamation text-red-500 dark:text-red-400 text-sm"></i></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">{language === 'zh' ? '请填写以下必填信息' : 'Please fill in the required fields'}</p><div className="flex flex-wrap gap-1.5">{errorList.map((name) => (<span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-red-200/60 dark:border-red-800/40 text-xs font-medium text-red-600 dark:text-red-400"><i className="fa-solid fa-xmark text-[9px]"></i>{name}</span>))}</div></div>
          <button className="w-6 h-6 rounded-md flex items-center justify-center text-red-300 dark:text-red-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0" onClick={() => setValidationErrors({})}><i className="fa-solid fa-xmark text-xs"></i></button>
        </div>
      </motion.div>
    );
  };

  const renderFormContent = (isEdit: boolean) => (
    <>
      <AnimatePresence><ValidationBanner /></AnimatePresence>

      {/* Menu Selection */}
      <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center"><i className="fa-solid fa-bars text-[10px] text-white"></i></div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t('menu')}</h4>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">{t('menu')}<span className="text-red-500 ml-0.5">*</span></p>
          {isEdit ? (
            <p className="text-sm text-gray-900 dark:text-white font-semibold px-3 py-1.5 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-gray-50 dark:bg-gray-800/50">{currentItem.menuName}</p>
          ) : (
            <select
              className={`w-full px-3 py-1.5 border ${hasError('menuId') ? 'border-red-400 dark:border-red-500 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'} rounded-xl bg-white dark:bg-gray-900/50 dark:text-white text-sm transition-all cursor-pointer focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none appearance-none`}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%239ca3af\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
              value={currentItem.menuId || ''}
              onChange={(e) => {
                const id = e.target.value;
                const menu = menus.find(m => m.id === id);
                setCurrentItem({ ...currentItem, menuId: id, menuName: menu?.name || '' });
                if (validationErrors.menuId) { const err = { ...validationErrors }; delete err.menuId; setValidationErrors(err); }
              }}
            >
              <option value="">{language === 'zh' ? '请选择菜单' : 'Select Menu'}</option>
              {menus.filter(m => m.status === 'active' && !configuredMenuIds.includes(m.id)).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Role Assignment */}
      <div className={`rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border ${hasError('roles') ? 'border-red-200 dark:border-red-800/50' : 'border-gray-100 dark:border-gray-800/50'} p-5 space-y-4`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center"><i className="fa-solid fa-user-shield text-[10px] text-white"></i></div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t('role')}</h4>
          <span className="text-red-500 text-sm">*</span>
          {selectedRoleIds.length > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-600 dark:text-blue-400">
              {selectedRoleIds.length} {language === 'zh' ? '已选' : 'selected'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {roles.map(role => {
            const isChecked = selectedRoleIds.includes(role.id);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => { toggleRole(role.id); if (validationErrors.roles) { const err = { ...validationErrors }; delete err.roles; setValidationErrors(err); } }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isChecked
                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  isChecked
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isChecked && <i className="fa-solid fa-check text-[9px] text-white"></i>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{role.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{role.code}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-3">
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div><h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('menuAccess')}</h1><p className="text-sm text-gray-500">{t('manageMenuAccess')}</p></div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative"><input type="text" placeholder={t('search')} className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm input-themed text-gray-900 dark:text-white w-full sm:w-64" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} /><i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i></div>
            <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2 flex items-center justify-center" onClick={() => { setCurrentItem({}); setSelectedRoleIds([]); setValidationErrors({}); setIsAddModalOpen(true); }}><i className="fa-solid fa-plus mr-2"></i>{t('add')}</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/20 border-b border-gray-200/60 dark:border-gray-700/50">
              <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">{t('menu')}</th>
              <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">{t('role')}</th>
              <th scope="col" className="px-5 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">{t('actions')}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-800/50">
              {isLoading ? Array.from({ length: pageSize }).map((_, i) => (<tr key={`s-${i}`}><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="skeleton w-8 h-8 rounded-lg" /><div className="skeleton h-4 w-28 rounded" /></div></td><td className="px-5 py-3"><div className="flex gap-1"><div className="skeleton h-6 w-16 rounded-lg" /><div className="skeleton h-6 w-16 rounded-lg" /></div></td><td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-2"><div className="skeleton w-8 h-8 rounded-lg" /><div className="skeleton w-8 h-8 rounded-lg" /><div className="skeleton w-8 h-8 rounded-lg" /></div></td></tr>))
              : filteredItems.length === 0 ? (<tr><td colSpan={3} className="px-5 py-12 text-center"><div className="flex flex-col items-center"><div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3"><i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i></div><p className="text-xs text-gray-500 dark:text-gray-400">{t('noData') || '暂无数据'}</p></div></td></tr>)
              : paginatedItems.map((item, index) => (
                <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">{item.menuName.charAt(0)}</div>
                      <div className="font-semibold text-[13px] text-gray-900 dark:text-white">{item.menuName}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {item.roleNames.map((rn, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                          <i className="fa-solid fa-user-shield text-[9px]"></i>{rn}
                        </span>
                      ))}
                      {item.roleNames.length === 0 && <span className="text-xs text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-right"><div className="flex items-center justify-end gap-1">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" onClick={() => { setCurrentItem(item); setSelectedRoleIds(item.roleIds); setIsDetailModalOpen(true); }} title={language === 'zh' ? '查看' : 'View'}><i className="fa-solid fa-eye text-xs"></i></button>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={() => { setCurrentItem(item); setSelectedRoleIds([...item.roleIds]); setValidationErrors({}); setIsEditModalOpen(true); }} title={language === 'zh' ? '编辑' : 'Edit'}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => setDeleteTarget(item)} title={language === 'zh' ? '删除' : 'Delete'}><i className="fa-solid fa-trash-can text-xs"></i></button>
                  </div></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span>{t('rowsPerPage')}:</span><select className="px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white input-themed text-sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>{[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}</select><span className="ml-2">{(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredItems.length)} {t('of')} {filteredItems.length} {t('totalRecords')}</span></div>
          <div className="flex items-center gap-1">
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(1)} disabled={safePage === 1}><i className="fa-solid fa-angles-left"></i></button>
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><i className="fa-solid fa-chevron-left"></i></button>
            {getPageNumbers().map((page, idx) => page === '...' ? <span key={`e-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">...</span> : <button key={page} className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${safePage === page ? 'btn-gradient text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(page as number)}>{page}</button>)}
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><i className="fa-solid fa-chevron-right"></i></button>
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}><i className="fa-solid fa-angles-right"></i></button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>{isDetailModalOpen && currentItem.id && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={() => { setIsDetailModalOpen(false); setCurrentItem({}); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
            <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'zh' ? '菜单权限详情' : 'Menu Access Details'}</h3><button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setIsDetailModalOpen(false); setCurrentItem({}); }}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/50">
                <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">{getInitials(currentItem.menuName || '?')}</div>
                <div className="flex-1 min-w-0"><h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{currentItem.menuName}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{selectedRoleIds.length} {language === 'zh' ? '个角色已分配' : 'roles assigned'}</p></div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1"><div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center"><i className="fa-solid fa-user-shield text-[10px] text-white"></i></div><h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{language === 'zh' ? '已分配角色' : 'Assigned Roles'}</h4></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.filter(r => selectedRoleIds.includes(r.id)).map(role => (
                    <div key={role.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20">
                      <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-check text-[9px] text-white"></i></div>
                      <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{role.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{role.code}</p></div>
                    </div>
                  ))}
                  {selectedRoleIds.length === 0 && <p className="text-xs text-gray-400 col-span-2">{language === 'zh' ? '未分配角色' : 'No roles assigned'}</p>}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end"><button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setIsDetailModalOpen(false); setCurrentItem({}); }}>{t('close')}</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>{isAddModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
            <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('add')} {t('menuAccess')}</h3><button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setIsAddModalOpen(false); setCurrentItem({}); setSelectedRoleIds([]); }}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">{renderFormContent(false)}</div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setIsAddModalOpen(false); setCurrentItem({}); setSelectedRoleIds([]); }}>{t('cancel')}</button>
              <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2" onClick={() => { if (validateRequired()) handleAdd(); }}>{t('save')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>{isEditModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
            <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('edit')} {t('menuAccess')}</h3><button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setIsEditModalOpen(false); setCurrentItem({}); setSelectedRoleIds([]); }}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">{renderFormContent(true)}</div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setIsEditModalOpen(false); setCurrentItem({}); setSelectedRoleIds([]); }}>{t('cancel')}</button>
              <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2" onClick={() => { if (validateRequired()) handleEdit(); }}>{t('save')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>{deleteTarget && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center"><div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"><i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i></div><h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('confirmDelete')}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmDeleteMessage')}</p><p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{deleteTarget.menuName}</p></div>
            <div className="px-6 pb-6 flex gap-3"><button className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setDeleteTarget(null)}>{t('cancel')}</button><button className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white transition-colors" onClick={handleDelete}>{t('delete')}</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
