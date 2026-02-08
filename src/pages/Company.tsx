import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { companyAPI } from '../services/api';
import { Company } from '../services/mockData';
import { toast } from 'sonner';

export default function Companies() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await companyAPI.getCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error(t('fetchError') || '获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await companyAPI.deleteCompany(id);
      setCompanies(companies.filter(comp => comp.id !== id));
      toast.success(t('deleteSuccess') || '删除成功');
    } catch (error) {
      toast.error(t('deleteError') || '删除失败');
    }
  };

  const handleAdd = async (company: Omit<Company, 'id'>) => {
    try {
      const newCompany = await companyAPI.createCompany(company);
      setCompanies([...companies, newCompany]);
      setIsAddModalOpen(false);
      setCurrentCompany({});
      toast.success(t('addSuccess') || '添加成功');
    } catch (error) {
      toast.error(t('addError') || '添加失败');
    }
  };

  const handleEdit = async (company: Partial<Company>) => {
    if (!currentCompany.id) return;

    try {
      await companyAPI.updateCompany(currentCompany.id, company);
      setCompanies(companies.map(comp =>
        comp.id === currentCompany.id ? { ...comp, ...company } : comp
      ));
      setIsEditModalOpen(false);
      setCurrentCompany({});
      toast.success(t('updateSuccess') || '更新成功');
    } catch (error) {
      toast.error(t('updateError') || '更新失败');
    }
  };

  const filteredCompanies = companies.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('company')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('manageCompanies')}</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search')}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f242d] bg-white dark:bg-[#161b22] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          <button
            className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fa-solid fa-plus mr-2"></i>
            {t('add')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#161b22]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('code')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('companyName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('address')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0d1117] divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loading')}</p>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <i className="fa-solid fa-search fa-2xl text-gray-300 dark:text-gray-700"></i>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noData') || '暂无数据'}</p>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company, index) => (
                  <motion.tr
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{company.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        company.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-[#161b22] dark:text-gray-200'
                      }`}>
                        {company.status === 'active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        onClick={() => {
                          setCurrentCompany(company);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-edit mr-1"></i> {t('edit')}
                      </button>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        onClick={() => handleDelete(company.id)}
                      >
                        <i className="fa-solid fa-trash mr-1"></i> {t('delete')}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加公司模态框 */}
      {isAddModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#0d1117] rounded-xl shadow-lg border border-gray-200 dark:border-[#1f242d] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#1f242d]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('add')} {t('company')}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('code')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.code || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('companyName')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.name || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.email || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.phone || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.address || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.status || 'active'}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.createdAt || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, createdAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCurrentCompany({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
                onClick={() => handleAdd(currentCompany as Omit<Company, 'id'>)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 编辑公司模态框 */}
      {isEditModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#0d1117] rounded-xl shadow-lg border border-gray-200 dark:border-[#1f242d] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#1f242d]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit')} {t('company')}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('code')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.code || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('companyName')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.name || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.email || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.phone || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.address || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.status || 'active'}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCompany.createdAt || ''}
                    onChange={(e) => setCurrentCompany({ ...currentCompany, createdAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentCompany({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
                onClick={() => handleEdit(currentCompany)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
