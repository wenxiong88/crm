import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { userRoleAPI, accessRightAPI } from '../services/api';
import { UserRole, AccessRight } from '../services/mockData';
import { toast } from 'sonner';

export default function UserRoles() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [accessRights, setAccessRights] = useState<AccessRight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Partial<UserRole>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchAccessRights();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await userRoleAPI.getUserRoles();
      setRoles(data);
    } catch (error) {
      toast.error(t('fetchError') || '获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccessRights = async () => {
    try {
      const data = await accessRightAPI.getAccessRights();
      setAccessRights(data);
    } catch (error) {
      console.error('获取权限列表失败', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userRoleAPI.deleteUserRole(id);
      setRoles(roles.filter(role => role.id !== id));
      toast.success(t('deleteSuccess') || '删除成功');
    } catch (error) {
      toast.error(t('deleteError') || '删除失败');
    }
  };

  const handleAdd = async (role: Omit<UserRole, 'id'>) => {
    try {
      const roleWithPermissions = {
        ...role,
        permissions: selectedPermissions
      };
      const newRole = await userRoleAPI.createUserRole(roleWithPermissions);
      setRoles([...roles, newRole]);
      setIsAddModalOpen(false);
      setCurrentRole({});
      setSelectedPermissions([]);
      toast.success(t('addSuccess') || '添加成功');
    } catch (error) {
      toast.error(t('addError') || '添加失败');
    }
  };

  const handleEdit = async (role: Partial<UserRole>) => {
    if (!currentRole.id) return;

    try {
      const roleWithPermissions = {
        ...role,
        permissions: selectedPermissions
      };
      await userRoleAPI.updateUserRole(currentRole.id, roleWithPermissions);
      setRoles(roles.map(r =>
        r.id === currentRole.id ? { ...r, ...roleWithPermissions } : r
      ));
      setIsEditModalOpen(false);
      setCurrentRole({});
      setSelectedPermissions([]);
      toast.success(t('updateSuccess') || '更新成功');
    } catch (error) {
      toast.error(t('updateError') || '更新失败');
    }
  };

  const handlePermissionToggle = (permissionCode: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionCode)
        ? prev.filter(p => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const openAddModal = () => {
    setCurrentRole({});
    setSelectedPermissions([]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (role: UserRole) => {
    setCurrentRole(role);
    setSelectedPermissions(role.permissions || []);
    setIsEditModalOpen(true);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按模块分组权限
  const groupedPermissions = accessRights.reduce((acc, right) => {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('userRole')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('manageUserRoles')}</p>
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
            onClick={openAddModal}
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
                  {t('roleName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('description')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('permissions')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0d1117] divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loading')}</p>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <i className="fa-solid fa-search fa-2xl text-gray-300 dark:text-gray-700"></i>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noData') || '暂无数据'}</p>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, index) => (
                  <motion.tr
                    key={role.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{role.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{role.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{role.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map(perm => (
                          <span key={perm} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                            {perm}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-[#161b22] dark:text-gray-400 rounded">
                            +{role.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        onClick={() => openEditModal(role)}
                      >
                        <i className="fa-solid fa-edit mr-1"></i> {t('edit')}
                      </button>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        onClick={() => handleDelete(role.id)}
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

      {/* 添加角色模态框 */}
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
            className="bg-white dark:bg-[#0d1117] rounded-xl shadow-lg border border-gray-200 dark:border-[#1f242d] w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#1f242d]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('add')} {t('userRole')}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('code')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentRole.code || ''}
                      onChange={(e) => setCurrentRole({ ...currentRole, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('roleName')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentRole.name || ''}
                      onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={currentRole.description || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('assignPermissions')}
                  </label>
                  <div className="border border-gray-300 dark:border-[#1f242d] rounded-lg p-4 max-h-64 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([module, rights]) => (
                      <div key={module} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 capitalize">{module}</h4>
                        <div className="space-y-2">
                          {rights.map(right => (
                            <label key={right.code} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedPermissions.includes(right.code)}
                                onChange={() => handlePermissionToggle(right.code)}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {right.description} ({right.code})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRole.createdAt || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, createdAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCurrentRole({});
                  setSelectedPermissions([]);
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
                onClick={() => handleAdd(currentRole as Omit<UserRole, 'id'>)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 编辑角色模态框 */}
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
            className="bg-white dark:bg-[#0d1117] rounded-xl shadow-lg border border-gray-200 dark:border-[#1f242d] w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#1f242d]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit')} {t('userRole')}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('code')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentRole.code || ''}
                      onChange={(e) => setCurrentRole({ ...currentRole, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('roleName')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentRole.name || ''}
                      onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={currentRole.description || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('assignPermissions')}
                  </label>
                  <div className="border border-gray-300 dark:border-[#1f242d] rounded-lg p-4 max-h-64 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([module, rights]) => (
                      <div key={module} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 capitalize">{module}</h4>
                        <div className="space-y-2">
                          {rights.map(right => (
                            <label key={right.code} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedPermissions.includes(right.code)}
                                onChange={() => handlePermissionToggle(right.code)}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {right.description} ({right.code})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentRole.createdAt || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, createdAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentRole({});
                  setSelectedPermissions([]);
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`}
                onClick={() => handleEdit(currentRole)}
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
