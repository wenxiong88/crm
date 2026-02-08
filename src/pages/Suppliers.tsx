import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { supplierAPI } from '../services/api';
import { Supplier } from '../services/mockData';
import { toast } from 'sonner';

export default function Suppliers() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await supplierAPI.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      toast.error('获取供应商数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierAPI.deleteSupplier(id);
      setSuppliers(suppliers.filter(sup => sup.id !== id));
      toast.success('供应商已删除');
    } catch (error) {
      toast.error('删除供应商失败');
    }
  };

  const handleAdd = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = await supplierAPI.createSupplier(supplier);
      setSuppliers([...suppliers, newSupplier]);
      setIsAddModalOpen(false);
      setCurrentSupplier({});
      toast.success('供应商已添加');
    } catch (error) {
      toast.error('添加供应商失败');
    }
  };

  const handleEdit = async (supplier: Partial<Supplier>) => {
    if (!currentSupplier.id) return;
    
    try {
      await supplierAPI.updateSupplier(currentSupplier.id, supplier);
      setSuppliers(suppliers.map(sup => 
        sup.id === currentSupplier.id ? { ...sup, ...supplier } : sup
      ));
      setIsEditModalOpen(false);
      setCurrentSupplier({});
      toast.success('供应商信息已更新');
    } catch (error) {
      toast.error('更新供应商信息失败');
    }
  };

  const filteredSuppliers = suppliers.filter(sup => 
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('suppliers')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('manageSuppliers')}</p>
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
            className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
              `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
            }`}
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fa-solid fa-plus mr-2"></i>
            {t('add')}
          </button>
        </div>
      </div>
      
      {/* 供应商表格 */}
      <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#161b22]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('contact')}
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
                  {t('category')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('partnershipStart')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0d1117] divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loading')}</p>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <i className="fa-solid fa-search fa-2xl text-gray-300 dark:text-gray-700"></i>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noMatchingSuppliers')}</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{supplier.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{supplier.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{supplier.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{supplier.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{supplier.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{supplier.since}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        onClick={() => {
                          setCurrentSupplier(supplier);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-edit mr-1"></i> {t('edit')}
                      </button>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        onClick={() => handleDelete(supplier.id)}
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
      
      {/* 添加供应商模态框 */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('addSupplier')}</h3>
            </div>
            <div className="p-6">
              {/* 表单内容 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.name || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.contactPerson || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.email || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.phone || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.address || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('category')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.category || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('partnershipStart')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.since || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, since: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCurrentSupplier({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
                }`}
                onClick={() => handleAdd(currentSupplier as Omit<Supplier, 'id'>)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* 编辑供应商模态框 */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('editSupplier')}</h3>
            </div>
            <div className="p-6">
              {/* 表单内容 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.name || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.contactPerson || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.email || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.phone || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.address || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('category')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.category || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('partnershipStart')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSupplier.since || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, since: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentSupplier({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
                }`}
                onClick={() => handleEdit(currentSupplier)}
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