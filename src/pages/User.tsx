import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { userAPI, companyAPI, userRoleAPI, projectAPI } from '../services/api';
import { User, Company, UserRole, Project } from '../services/mockData';
import { toast } from 'sonner';
import { format, parse, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DatePicker from '../components/DatePicker';

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [nameError, setNameError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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
    fetchCompanies();
    fetchRoles();
    fetchProjects();
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

  const fetchCompanies = async () => {
    try {
      const data = await companyAPI.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await userRoleAPI.getUserRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    const companyProjects = projects.filter(p => p.companyId === companyId);
    setFilteredProjects(companyProjects);
    setCurrentUser({
      ...currentUser,
      companyId,
      companyName: company?.name || '',
      projectId: '',
      projectName: ''
    });
  };

  const handleProjectChange = (projectId: string) => {
    const project = filteredProjects.find(p => p.id === projectId);
    setCurrentUser({
      ...currentUser,
      projectId,
      projectName: project?.name || ''
    });
  };

  const handleRoleChange = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    setCurrentUser({
      ...currentUser,
      roleId,
      roleName: role?.name || ''
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userAPI.deleteUser(deleteTarget.id);
      setUsers(users.filter(u => u.id !== deleteTarget.id));
      toast.success(t('deleteSuccess'));
    } catch (error) {
      toast.error(t('deleteError'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAdd = async (user: Omit<User, 'id'>) => {
    try {
      const newUser = await userAPI.createUser(user);
      setUsers([...users, newUser]);
      setIsAddModalOpen(false);
      setCurrentUser({});
      toast.success(t('addSuccess'));
    } catch (error) {
      toast.error(t('addError'));
    }
  };

  const handleEdit = async (user: Partial<User>) => {
    if (!currentUser.id) return;
    const userName = currentUser.username || '';

    try {
      await userAPI.updateUser(currentUser.id, user);
      setUsers(users.map(u =>
        u.id === currentUser.id ? { ...u, ...user } : u
      ));
      setIsEditModalOpen(false);
      setCurrentUser({});
      toast.custom((id) => (
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
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{language === 'zh' ? '更新成功' : 'Update Successful'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {language === 'zh' ? `${userName} 的信息已成功更新` : `${userName}'s info has been updated`}
              </p>
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
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const renderFormFields = () => (
    <div className="space-y-5">
      {/* Avatar Upload */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="relative group">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt="avatar"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-gray-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl avatar-container text-xl flex-shrink-0 shadow-lg">
              {(currentUser.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <button
            type="button"
            className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fa-solid fa-camera text-white text-sm"></i>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{t('avatar')}</p>
          <div className="flex items-center gap-2 mt-1.5">
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
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('username')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm ${nameError && !currentUser.username?.trim() ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700/50'}`}
          value={currentUser.username || ''}
          onChange={(e) => {
            setCurrentUser({ ...currentUser, username: e.target.value });
            if (e.target.value.trim()) setNameError(false);
          }}
        />
        {nameError && !currentUser.username?.trim() && (
          <p className="mt-1 text-xs text-red-500">{t('nameRequired')}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('email')}
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentUser.email || ''}
          onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('phone')}
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentUser.phone || ''}
          onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('selectCompany')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentUser.companyId || ''}
          onChange={(e) => handleCompanyChange(e.target.value)}
        >
          <option value="">{t('selectCompany')}</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('selectProject')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          value={currentUser.projectId || ''}
          onChange={(e) => handleProjectChange(e.target.value)}
          disabled={!currentUser.companyId}
        >
          <option value="">{t('selectProject')}</option>
          {filteredProjects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('selectRole')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentUser.roleId || ''}
          onChange={(e) => handleRoleChange(e.target.value)}
        >
          <option value="">{t('selectRole')}</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('status')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentUser.status || 'active'}
          onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value as 'active' | 'inactive' })}
        >
          <option value="active">{t('active')}</option>
          <option value="inactive">{t('inactive')}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('createDate')}
        </label>
        <DatePicker
          value={currentUser.createdAt || ''}
          onChange={(val) => setCurrentUser({ ...currentUser, createdAt: val })}
        />
      </div>
    </div>
    </div>
  );

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    const companyProjects = projects.filter(p => p.companyId === user.companyId);
    setFilteredProjects(companyProjects);
    setIsEditModalOpen(true);
  };

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
                setCurrentUser({ createdAt: new Date().toISOString().split('T')[0], status: 'active' });
                setFilteredProjects([]);
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
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('username')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('companyName')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('projectName')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('roleName')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="skeleton h-4 w-24 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-36 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-28 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-20 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-20 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-20 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-5 w-14 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="skeleton w-8 h-8 rounded-lg" />
                        <div className="skeleton w-8 h-8 rounded-lg" />
                        <div className="skeleton w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingUsers')}</p>
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
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{user.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.companyName}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.projectName}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.roleName}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {user.status === 'active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => { setCurrentUser(user); setIsDetailModalOpen(true); }}
                        >
                          <i className="fa-solid fa-eye text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => openEditModal(user)}
                        >
                          <i className="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
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
              <div className="p-6 space-y-6">
                {/* Avatar Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/50">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.username} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-gray-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">
                      {(currentUser.username || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{currentUser.username}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('basicInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('username')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('companyName')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentUser.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('projectName')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentUser.projectName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('roleName')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentUser.roleName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('contactInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('email')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentUser.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('phone')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentUser.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('status')}</p>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          currentUser.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {currentUser.status === 'active' ? t('active') : t('inactive')}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('createDate')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(currentUser.createdAt)}</p>
                      </div>
                    </div>
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
                    setNameError(false);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6">
                {renderFormFields()}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentUser({});
                    setNameError(false);
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => {
                    if (!currentUser.username?.trim()) { setNameError(true); return; }
                    handleAdd(currentUser as Omit<User, 'id'>);
                  }}
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
                    setNameError(false);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6">
                {renderFormFields()}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentUser({});
                    setNameError(false);
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => {
                    if (!currentUser.username?.trim()) { setNameError(true); return; }
                    handleEdit(currentUser);
                  }}
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
