import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';
import { User } from '../services/mockData';
import { toast } from 'sonner';
import { format, parse, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DatePicker from '../components/DatePicker';


function UserStatusSelect({ value, onChange, t }: {
  value: string;
  onChange: (v: 'active' | 'inactive') => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = [
    { key: 'active' as const, label: t('active'), dot: '#10b981', bg: 'bg-emerald-500' },
    { key: 'inactive' as const, label: t('inactive'), dot: '#9ca3af', bg: 'bg-gray-400' },
  ];
  const current = options.find(o => o.key === value) || options[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm border rounded-xl transition-all cursor-pointer focus:outline-none ${
          open
            ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
            : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30'
        } bg-white dark:bg-gray-900/50`}
      >
        <span className="flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.bg}`} style={{ animationDuration: '2s' }}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${current.bg}`}></span>
          </span>
          {current.label}
        </span>
        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full mb-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
          >
            <div className="py-1">
              {options.map(opt => {
                const isSelected = value === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { onChange(opt.key); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.dot }}></span>
                      <span>{opt.label}</span>
                    </span>
                    {isSelected && <i className="fa-solid fa-check text-[10px] text-blue-500"></i>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserDetailField({ label, value, field, editable, required, hasError, currentUser, setCurrentUser, validationErrors, setValidationErrors, language, t, formatDate }: {
  label: string;
  value: string | undefined;
  field?: string;
  editable?: boolean;
  required?: boolean;
  hasError: (f: string) => boolean;
  currentUser: Partial<User>;
  setCurrentUser: (u: Partial<User>) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (e: Record<string, string>) => void;
  language: string;
  t: (key: string) => string;
  formatDate: (d?: string) => string;
}) {
  const clearError = (f: string) => {
    if (validationErrors[f]) { const e = { ...validationErrors }; delete e[f]; setValidationErrors(e); }
  };

  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1 whitespace-nowrap">
        {label}
        {required && editable && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      {editable && field ? (
        field === 'status' ? (
          <UserStatusSelect
            value={(currentUser.status as string) || 'active'}
            onChange={(v) => { setCurrentUser({ ...currentUser, status: v }); clearError('status'); }}
            t={t}
          />
        ) : field === 'effDate' || field === 'expDate' ? (
          <DatePicker
            value={(currentUser[field as keyof User] as string) || ''}
            onChange={(val) => { setCurrentUser({ ...currentUser, [field]: val }); clearError(field); }}
          />
        ) : (
          <input
            type={field === 'email' ? 'email' : 'text'}
            className={`w-full px-3 py-1.5 text-sm border ${hasError(field) ? 'border-red-400 dark:border-red-500 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/50'} rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow`}
            value={(currentUser[field as keyof User] as string) || ''}
            onChange={(e) => { setCurrentUser({ ...currentUser, [field]: e.target.value }); clearError(field); }}
          />
        )
      ) : (
        field === 'status' ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${
            value === 'active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${value === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            {value === 'active' ? t('active') : t('inactive')}
          </span>
        ) : field === 'effDate' || field === 'expDate' || field === 'createdAt' || field === 'modifiedAt' ? (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{formatDate(value)}</p>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{value || '-'}</p>
        )
      )}
    </div>
  );
}

export default function Users() {
  const { t, language } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(d)) return dateStr;
    return format(d, 'dd MMM yyyy', { locale: language === 'zh' ? zhCN : undefined });
  };

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('fileTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCurrentUser({ ...currentUser, avatar: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (title: string, description: string, variant: 'add' | 'update' | 'delete' = 'update') => {
    const config = {
      add: { icon: 'fa-solid fa-plus', bar: 'bg-gradient-to-r from-emerald-400 to-cyan-500', iconBg: 'bg-gradient-to-br from-emerald-400 to-cyan-500' },
      update: { icon: 'fa-solid fa-check', bar: 'btn-gradient', iconBg: 'btn-gradient' },
      delete: { icon: 'fa-solid fa-trash-can', bar: 'bg-gradient-to-r from-red-400 to-rose-500', iconBg: 'bg-gradient-to-br from-red-400 to-rose-500' },
    }[variant];
    toast.custom((id) => (
      <div
        className="w-[360px] bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden"
        style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        <div className={`h-1 ${config.bar}`} />
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <i className={`${config.icon} text-white text-sm`} />
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
            onClick={() => toast.dismiss(id)}
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const deletedName = deleteTarget.username;
    try {
      await userAPI.deleteUser(deleteTarget.id, deleteTarget.modifiedById);
      fetchUsers();
      showToast(
        language === 'zh' ? '删除成功' : 'Deleted Successfully',
        language === 'zh' ? `${deletedName} 已被删除` : `${deletedName} has been deleted`,
        'delete'
      );
    } catch (error) {
      toast.error(t('deleteError'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAdd = async (user: Omit<User, 'id'>) => {
    const addedName = user.username || '';
    try {
      await userAPI.createUser(user);
      setIsAddModalOpen(false);
      setCurrentUser({});
      fetchUsers();
      showToast(
        language === 'zh' ? '添加成功' : 'Added Successfully',
        language === 'zh' ? `${addedName} 已成功添加` : `${addedName} has been added`,
        'add'
      );
    } catch (error) {
      toast.error(t('addError'));
    }
  };

  const handleEdit = async (user: Partial<User>) => {
    if (!currentUser.id) return;
    const userName = currentUser.username || '';
    try {
      await userAPI.updateUser(currentUser.id, user);
      setIsEditModalOpen(false);
      setCurrentUser({});
      fetchUsers();
      showToast(
        language === 'zh' ? '更新成功' : 'Update Successful',
        language === 'zh' ? `${userName} 的信息已成功更新` : `${userName} has been updated`,
        'update'
      );
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const hasError = (field: string) => !!validationErrors[field];

  const dfProps = { hasError, currentUser, setCurrentUser, validationErrors, setValidationErrors, language, t, formatDate };

  const validateRequired = (): boolean => {
    const errors: Record<string, string> = {};
    const checks: { field: string; check: boolean; zh: string; en: string }[] = [
      { field: 'username', check: !currentUser.username?.trim(), zh: '用户名称', en: 'User Name' },
    ];
    checks.forEach(c => { if (c.check) errors[c.field] = language === 'zh' ? c.zh : c.en; });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const ValidationBanner = () => {
    const errorList = Object.values(validationErrors);
    if (errorList.length === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
        className="rounded-xl border border-red-200 dark:border-red-800/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="fa-solid fa-circle-exclamation text-red-500 dark:text-red-400 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
              {language === 'zh' ? '请填写以下必填信息' : 'Please fill in the required fields'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {errorList.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-red-200/60 dark:border-red-800/40 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                  {name}
                </span>
              ))}
            </div>
          </div>
          <button
            className="w-6 h-6 rounded-md flex items-center justify-center text-red-300 dark:text-red-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
            onClick={() => setValidationErrors({})}
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      </motion.div>
    );
  };

  const renderAvatarUpload = () => (
    <div className="relative group">
      {currentUser.avatar ? (
        <img
          src={currentUser.avatar}
          alt="avatar"
          className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-gray-800"
        />
      ) : (
        <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">
          {getInitials(currentUser.username || '?')}
        </div>
      )}
      <button
        type="button"
        className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <i className="fa-solid fa-camera text-white text-sm"></i>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </div>
  );

  const renderFormContent = () => (
    <>
      {/* Validation Banner */}
      <AnimatePresence><ValidationBanner /></AnimatePresence>

      {/* Avatar Header with Status on same line */}
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/50">
        {renderAvatarUpload()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">{t('username')}<span className="text-red-500 ml-0.5">*</span></p>
          <input
            type="text"
            className={`w-full px-3 py-1.5 text-sm font-semibold border ${hasError('username') ? 'border-red-400 dark:border-red-500 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/50'} rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed`}
            value={currentUser.username || ''}
            onChange={(e) => { setCurrentUser({ ...currentUser, username: e.target.value }); if (validationErrors.username) { const err = { ...validationErrors }; delete err.username; setValidationErrors(err); } }}
          />
        </div>
        <div className="flex-shrink-0 w-40">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">{t('status')}</p>
          <UserStatusSelect
            value={(currentUser.status as string) || 'active'}
            onChange={(v) => { setCurrentUser({ ...currentUser, status: v }); }}
            t={t}
          />
        </div>
      </div>

      {/* Avatar action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xs px-3 py-1.5 rounded-lg btn-gradient text-white font-medium"
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fa-solid fa-upload mr-1.5"></i>
          {t('changeAvatar')}
        </button>
        {currentUser.avatar && (
          <div className="relative">
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setShowRemoveAvatarConfirm(true)}
            >
              <i className="fa-solid fa-trash-can mr-1.5"></i>
              {t('removeAvatar')}
            </button>
            <AnimatePresence>
              {showRemoveAvatarConfirm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-10 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-triangle-exclamation text-red-500 text-[10px]"></i>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('confirmDeleteMessage')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => setShowRemoveAvatarConfirm(false)}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                      onClick={() => {
                        setCurrentUser({ ...currentUser, avatar: '' });
                        setShowRemoveAvatarConfirm(false);
                      }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Single merged card */}
      <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
            <i className="fa-solid fa-user text-[10px] text-white"></i>
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{language === 'zh' ? '用户信息' : 'User Info'}</h4>
        </div>
        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <UserDetailField {...dfProps} label={t('email')} value={currentUser.email} editable field="email" />
          <UserDetailField {...dfProps} label={t('phone')} value={currentUser.phone} editable field="phone" />
        </div>
        {/* Effective Date + Expiry Date */}
        <div className="grid grid-cols-2 gap-4">
          <UserDetailField {...dfProps} label={t('effectiveDate')} value={currentUser.effDate} editable field="effDate" />
          <UserDetailField {...dfProps} label={t('expiryDate')} value={currentUser.expDate} editable field="expDate" />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-3">
      {/* Page Header - Sticky */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('user')}</h1>
            <p className="text-sm text-gray-500">{t('manageUsers')}</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search')}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm input-themed text-gray-900 dark:text-white w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>

            <button
              className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2 flex items-center justify-center"
              onClick={() => {
                const today = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
                const expStr = `${today.getFullYear() + 1}-12-31`;
                setCurrentUser({
                  status: 'active',
                  effDate: todayStr,
                  expDate: expStr,
                });
                setValidationErrors({});
                setIsAddModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('add')}
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/20 border-b border-gray-200/60 dark:border-gray-700/50">
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('username')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('email')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('phone')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('effectiveDate')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('expiryDate')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('status')}
                </th>
                <th scope="col" className="px-5 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-800/50">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="skeleton h-4 w-24 rounded" />
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-36 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-28 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-24 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-24 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-6 w-16 rounded-lg" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="skeleton w-7 h-7 rounded-lg" />
                        <div className="skeleton w-7 h-7 rounded-lg" />
                        <div className="skeleton w-7 h-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('noMatchingUsers')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="font-semibold text-[13px] text-gray-900 dark:text-white">{user.username}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{user.email || '-'}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{user.phone || '-'}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{formatDate(user.effDate)}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{formatDate(user.expDate)}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.status === 'active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => { setCurrentUser(user); setIsDetailModalOpen(true); }}
                          title={language === 'zh' ? '查看' : 'View'}
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => {
                            setCurrentUser(user);
                            setValidationErrors({});
                            setIsEditModalOpen(true);
                          }}
                          title={language === 'zh' ? '编辑' : 'Edit'}
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setDeleteTarget(user)}
                          title={language === 'zh' ? '删除' : 'Delete'}
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{t('rowsPerPage')}:</span>
            <select
              className="px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white input-themed text-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="ml-2">
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredUsers.length)} {t('of')} {filteredUsers.length} {t('totalRecords')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
            >
              <i className="fa-solid fa-angles-left"></i>
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">...</span>
              ) : (
                <button
                  key={page}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    safePage === page
                      ? 'btn-gradient text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </button>
              )
            )}
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && currentUser.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => { setIsDetailModalOpen(false); setCurrentUser({}); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('userDetails')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentUser({}); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Avatar Header with Status */}
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/50">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.username} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-gray-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">
                      {getInitials(currentUser.username || '?')}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{currentUser.username}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${
                    currentUser.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentUser.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {currentUser.status === 'active' ? t('active') : t('inactive')}
                  </span>
                </div>

                {/* User Info Card */}
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
                      <i className="fa-solid fa-user text-[10px] text-white"></i>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{language === 'zh' ? '用户信息' : 'User Info'}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <UserDetailField {...dfProps} label={t('email')} value={currentUser.email} field="email" />
                    <UserDetailField {...dfProps} label={t('phone')} value={currentUser.phone} field="phone" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <UserDetailField {...dfProps} label={t('effectiveDate')} value={currentUser.effDate} field="effDate" />
                    <UserDetailField {...dfProps} label={t('expiryDate')} value={currentUser.expDate} field="expDate" />
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentUser({}); }}
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('addUser')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentUser({});
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {renderFormContent()}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentUser({});
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => { if (validateRequired()) handleAdd(currentUser as Omit<User, 'id'>); }}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('editUser')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentUser({});
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {renderFormContent()}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentUser({});
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => { if (validateRequired()) handleEdit(currentUser); }}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('confirmDeleteMessage')}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                  {deleteTarget.username}
                </p>
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
