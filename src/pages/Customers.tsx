import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { customerAPI } from '../services/api';
import { Customer } from '../services/mockData';
import { toast } from 'sonner';

export default function Customers() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerAPI.getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('获取客户数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await customerAPI.deleteCustomer(deleteTarget.id);
      setCustomers(customers.filter(cus => cus.id !== deleteTarget.id));
      toast.success(t('deleteSuccess'));
    } catch (error) {
      toast.error(t('deleteError'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAdd = async (customer: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await customerAPI.createCustomer(customer);
      setCustomers([...customers, newCustomer]);
      setIsAddModalOpen(false);
      setCurrentCustomer({});
      toast.success('客户已添加');
    } catch (error) {
      toast.error('添加客户失败');
    }
  };

  const handleEdit = async (customer: Partial<Customer>) => {
    if (!currentCustomer.id) return;
    try {
      await customerAPI.updateCustomer(currentCustomer.id, customer);
      setCustomers(customers.map(cus =>
        cus.id === currentCustomer.id ? { ...cus, ...customer } : cus
      ));
      setIsEditModalOpen(false);
      setCurrentCustomer({});
      toast.success('客户信息已更新');
    } catch (error) {
      toast.error('更新客户信息失败');
    }
  };

  const filteredCustomers = customers.filter(cus =>
    cus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = filteredCustomers.slice((safePage - 1) * pageSize, safePage * pageSize);

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

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const SkeletonRow = () => (
    <tr>
      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg skeleton" /><div className="w-20 h-4 skeleton" /></div></td>
      <td className="px-5 py-4"><div className="w-32 h-4 skeleton" /></td>
      <td className="px-5 py-4"><div className="w-24 h-4 skeleton" /></td>
      <td className="px-5 py-4"><div className="w-28 h-4 skeleton" /></td>
      <td className="px-5 py-4"><div className="w-20 h-4 skeleton" /></td>
      <td className="px-5 py-4"><div className="w-20 h-4 skeleton" /></td>
      <td className="px-5 py-4"><div className="w-16 h-4 skeleton" /></td>
      <td className="px-5 py-4"><div className="w-16 h-4 skeleton ml-auto" /></td>
    </tr>
  );

  const formFields = [
    { key: 'name', type: 'text', field: 'name' },
    { key: 'email', type: 'email', field: 'email' },
    { key: 'phone', type: 'text', field: 'phone' },
    { key: 'address', type: 'text', field: 'address' },
    { key: 'createDate', type: 'date', field: 'createdAt' },
    { key: 'lastPurchase', type: 'date', field: 'lastPurchase' },
    { key: 'totalSpent', type: 'number', field: 'totalSpent' },
  ];

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {formFields.map(({ key, type, field }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t(key)}
          </label>
          <input
            type={type}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
            value={(currentCustomer as any)[field] || ''}
            onChange={(e) => setCurrentCustomer({
              ...currentCustomer,
              [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value
            })}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Page Header - Sticky */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('customers')}</h1>
            <p className="text-sm text-gray-500">{t('manageCustomers')}</p>
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
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('add')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('name')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('email')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('phone')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('address')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('createDate')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('lastPurchase')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('totalSpent')}</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-300 dark:text-gray-600 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingCustomers')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{customer.address}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.createdAt}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.lastPurchase}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">¥{customer.totalSpent.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => { setCurrentCustomer(customer); setIsDetailModalOpen(true); }}
                        >
                          <i className="fa-solid fa-eye text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => { setCurrentCustomer(customer); setIsEditModalOpen(true); }}
                        >
                          <i className="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setDeleteTarget(customer)}
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
      {!isLoading && filteredCustomers.length > 0 && (
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
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredCustomers.length)} {t('of')} {filteredCustomers.length} {t('totalRecords')}
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
        {isDetailModalOpen && currentCustomer.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => { setIsDetailModalOpen(false); setCurrentCustomer({}); }}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('customerDetails')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentCustomer({}); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('basicInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('name')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('address')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentCustomer.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('createDate')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentCustomer.createdAt}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('contactInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('email')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('phone')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentCustomer.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('lastPurchase')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentCustomer.lastPurchase}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('totalSpent')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">¥{currentCustomer.totalSpent?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentCustomer({}); }}
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => { setIsAddModalOpen(false); setCurrentCustomer({}); }}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('addCustomer')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsAddModalOpen(false); setCurrentCustomer({}); }}
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
                  onClick={() => { setIsAddModalOpen(false); setCurrentCustomer({}); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => handleAdd(currentCustomer as Omit<Customer, 'id'>)}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => { setIsEditModalOpen(false); setCurrentCustomer({}); }}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('editCustomer')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsEditModalOpen(false); setCurrentCustomer({}); }}
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
                  onClick={() => { setIsEditModalOpen(false); setCurrentCustomer({}); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => handleEdit(currentCustomer)}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmDeleteMessage')}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{deleteTarget.name}</p>
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
