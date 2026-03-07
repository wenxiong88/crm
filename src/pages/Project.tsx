import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { projectAPI, companyAPI } from '../services/api';
import { Project, Company } from '../services/mockData';
import { toast } from 'sonner';
import { format, parse, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DatePicker from '../components/DatePicker';

export default function Projects() {
  const { t, language } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(d)) return dateStr;
    return format(d, 'dd MMM yyyy', { locale: language === 'zh' ? zhCN : undefined });
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchProjects();
    fetchCompanies();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectAPI.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error(t('fetchError') || '获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await companyAPI.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('获取公司列表失败', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectAPI.deleteProject(deleteTarget.id);
      setProjects(projects.filter(proj => proj.id !== deleteTarget.id));
      toast.success(t('deleteSuccess') || '删除成功');
    } catch (error) {
      toast.error(t('deleteError') || '删除失败');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAdd = async (project: Omit<Project, 'id'>) => {
    try {
      const newProject = await projectAPI.createProject(project);
      setProjects([...projects, newProject]);
      setIsAddModalOpen(false);
      setCurrentProject({});
      toast.success(t('addSuccess') || '添加成功');
    } catch (error) {
      toast.error(t('addError') || '添加失败');
    }
  };

  const handleEdit = async (project: Partial<Project>) => {
    if (!currentProject.id) return;
    const projName = currentProject.name || '';

    try {
      await projectAPI.updateProject(currentProject.id, project);
      setProjects(projects.map(proj =>
        proj.id === currentProject.id ? { ...proj, ...project } : proj
      ));
      setIsEditModalOpen(false);
      setCurrentProject({});
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
                {language === 'zh' ? `${projName} 的信息已成功更新` : `${projName} has been updated`}
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
      toast.error(t('updateError') || '更新失败');
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setCurrentProject({
      ...currentProject,
      companyId,
      companyName: company?.name || ''
    });
  };

  const filteredProjects = projects.filter(proj =>
    proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proj.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice((safePage - 1) * pageSize, safePage * pageSize);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('active');
      case 'completed': return t('completed');
      default: return t('inactive');
    }
  };

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('projectCode')}
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentProject.code || ''}
          onChange={(e) => setCurrentProject({ ...currentProject, code: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('projectName')}
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentProject.name || ''}
          onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('selectCompany')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentProject.companyId || ''}
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
          {t('startDate')}
        </label>
        <DatePicker
          value={currentProject.startDate || ''}
          onChange={(val) => setCurrentProject({ ...currentProject, startDate: val })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('endDate')}
        </label>
        <DatePicker
          value={currentProject.endDate || ''}
          onChange={(val) => setCurrentProject({ ...currentProject, endDate: val })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('status')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentProject.status || 'active'}
          onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value as 'active' | 'inactive' | 'completed' })}
        >
          <option value="active">{t('active')}</option>
          <option value="inactive">{t('inactive')}</option>
          <option value="completed">{t('completed')}</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('description')}
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          rows={3}
          value={currentProject.description || ''}
          onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Page Header - Sticky */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('project')}</h1>
            <p className="text-sm text-gray-500">{t('manageProjects')}</p>
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
                setCurrentProject({ status: 'active' });
                setIsAddModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('add')}
            </button>
          </div>
        </div>
      </div>

      {/* Project Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('projectCode')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('projectName')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('companyName')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('startDate')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('endDate')}
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
                      <div className="skeleton h-4 w-20 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="skeleton h-4 w-24 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-28 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-24 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-4 w-24 rounded" />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="skeleton h-5 w-16 rounded-lg" />
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
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noData') || '暂无数据'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{project.code}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                          {project.name.charAt(0)}
                        </div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{project.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{project.companyName}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(project.startDate)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(project.endDate)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${getStatusBadge(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => { setCurrentProject(project); setIsDetailModalOpen(true); }}
                        >
                          <i className="fa-solid fa-eye text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => {
                            setCurrentProject(project);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setDeleteTarget(project)}
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
      {!isLoading && filteredProjects.length > 0 && (
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
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredProjects.length)} {t('of')} {filteredProjects.length} {t('totalRecords')}
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
        {isDetailModalOpen && currentProject.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => { setIsDetailModalOpen(false); setCurrentProject({}); }}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'zh' ? '项目详情' : 'Project Details'}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentProject({}); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{language === 'zh' ? '基本信息' : 'Basic Info'}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('projectCode')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentProject.code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('projectName')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentProject.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('companyName')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentProject.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('status')}</p>
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${getStatusBadge(currentProject.status || '')}`}>
                          {getStatusLabel(currentProject.status || '')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{language === 'zh' ? '日期与描述' : 'Dates & Description'}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('startDate')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(currentProject.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('endDate')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(currentProject.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('description')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentProject.description || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentProject({}); }}
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
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
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('add')} {t('project')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentProject({});
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
                    setCurrentProject({});
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => handleAdd(currentProject as Omit<Project, 'id'>)}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
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
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('edit')} {t('project')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentProject({});
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
                    setCurrentProject({});
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => handleEdit(currentProject)}
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
                  {deleteTarget.name}
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
