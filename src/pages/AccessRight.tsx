import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { accessRightAPI } from '../services/api';
import { AccessRight } from '../services/mockData';
import { toast } from 'sonner';

export default function AccessRights() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [accessRights, setAccessRights] = useState<AccessRight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRight, setCurrentRight] = useState<Partial<AccessRight>>({});

  useEffect(() => {
    fetchAccessRights();
  }, []);

  const fetchAccessRights = async () => {
    setIsLoading(true);
    try {
      const data = await accessRightAPI.getAccessRights();
      setAccessRights(data);
    } catch (error) {
      toast.error(t('fetchError') || '获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await accessRightAPI.deleteAccessRight(id);
      setAccessRights(accessRights.filter(right => right.id !== id));
      toast.success(t('deleteSuccess') || '删除成功');
    } catch (error) {
      toast.error(t('deleteError') || '删除失败');
    }
  };

  const handleAdd = async (right: Omit<AccessRight, 'id'>) => {
    try {
      const newRight = await accessRightAPI.createAccessRight(right);
      setAccessRights([...accessRights, newRight]);
      setIsAddModalOpen(false);
      setCurrentRight({});
      toast.success(t('addSuccess') || '添加成功');
    } catch (error) {
      toast.error(t('addError') || '添加失败');
    }
  };

  const handleEdit = async (right: Partial<AccessRight>) => {
    if (!currentRight.id) return;

    try {
      await accessRightAPI.updateAccessRight(currentRight.id, right);
      setAccessRights(accessRights.map(r =>
        r.id === currentRight.id ? { ...r, ...right } : r
      ));
      setIsEditModalOpen(false);
      setCurrentRight({});
      toast.success(t('updateSuccess') || '更新成功');
    } catch (error) {
      toast.error(t('updateError') || '更新失败');
    }
  };

  const filteredRights = accessRights.filter(right =>
    right.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    right.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    right.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    right.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按模块分组
  const groupedRights = filteredRights.reduce((acc, right) => {
    if (!acc[right.module]) {
      acc[right.module] = [];
    }
    acc[right.module].push(right);
    return acc;
  }, {} as Record<string, AccessRight[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('accessRight')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('manageAccessRights')}</p>
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

      {isLoading ? (
        <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-12">
          <div className="flex justify-center">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
          </div>
          <p className="mt-2 text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
        </div>
      ) : Object.keys(groupedRights).length === 0 ? (
        <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-12">
          <div className="text-center">
            <i className="fa-solid fa-search fa-2xl text-gray-300 dark:text-gray-700"></i>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noData') || '暂无数据'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedRights).map(([module, rights]) => (
            <motion.div
              key={module}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#1f242d]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {module}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-[#161b22]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('name')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('code')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('action')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('description')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#0d1117] divide-y divide-gray-200 dark:divide-gray-800">
                    {rights.map((right, index) => (
                      <motion.tr
                        key={right.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{right.name || right.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-600 dark:text-gray-400">{right.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            right.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            right.action === 'read' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            right.action === 'update' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {right.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{right.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                            onClick={() => {
                              setCurrentRight(right);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <i className="fa-solid fa-edit mr-1"></i> {t('edit')}
                          </button>
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            onClick={() => handleDelete(right.id)}
                          >
                            <i className="fa-solid fa-trash mr-1"></i> {t('delete')}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 添加权限模态框 */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('add')} {t('accessRight')}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.name || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('code')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.code || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('module')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.module || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, module: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('action')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.action || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, action: e.target.value })}
                  >
                    <option value="">选择操作</option>
                    <option value="create">create</option>
                    <option value="read">read</option>
                    <option value="update">update</option>
                    <option value="delete">delete</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={currentRight.description || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.createdAt || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, createdAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCurrentRight({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
                onClick={() => handleAdd(currentRight as Omit<AccessRight, 'id'>)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 编辑权限模态框 */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit')} {t('accessRight')}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.name || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('code')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.code || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('module')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.module || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, module: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('action')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.action || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, action: e.target.value })}
                  >
                    <option value="">选择操作</option>
                    <option value="create">create</option>
                    <option value="read">read</option>
                    <option value="update">update</option>
                    <option value="delete">delete</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={currentRight.description || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRight.createdAt || ''}
                    onChange={(e) => setCurrentRight({ ...currentRight, createdAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentRight({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
                onClick={() => handleEdit(currentRight)}
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
