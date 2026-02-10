import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { receiptAPI, customerAPI } from '../services/api';
import { Receipt, Customer } from '../services/mockData';
import { toast } from 'sonner';

export default function Receipts() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Partial<Receipt>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [receiptsData, customersData] = await Promise.all([
        receiptAPI.getReceipts(),
        customerAPI.getCustomers()
      ]);
      setReceipts(receiptsData);
      setCustomers(customersData);
    } catch (error) {
      toast.error(t('fetchDataFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await receiptAPI.deleteReceipt(id);
      setReceipts(receipts.filter(rec => rec.id !== id));
      toast.success(t('receiptDeleted'));
    } catch (error) {
      toast.error(t('deleteReceiptFailed'));
    }
  };

  const handleAdd = async (receipt: Omit<Receipt, 'id'>) => {
    try {
      const newReceipt = await receiptAPI.createReceipt(receipt);
      setReceipts([...receipts, newReceipt]);
      setIsAddModalOpen(false);
      setCurrentReceipt({});
      toast.success(t('receiptAdded'));
    } catch (error) {
      toast.error(t('addReceiptFailed'));
    }
  };

  const handleEdit = async (receipt: Partial<Receipt>) => {
    if (!currentReceipt.id) return;
    
    try {
      await receiptAPI.updateReceipt(currentReceipt.id, receipt);
      setReceipts(receipts.map(rec => 
        rec.id === currentReceipt.id ? { ...rec, ...receipt } : rec
      ));
      setIsEditModalOpen(false);
      setCurrentReceipt({});
      toast.success(t('receiptUpdated'));
    } catch (error) {
      toast.error(t('updateReceiptFailed'));
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    return (
      receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReceipts = filteredReceipts.slice((safePage - 1) * pageSize, safePage * pageSize);

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

  return (
    <div className="space-y-3">
      {/* Page Header - Sticky */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('receipts')}</h1>
            <p className="text-sm text-gray-500">{t('manageReceipts')}</p>
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
      
      {/* 收据表格 */}
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('customer')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('paymentMethod')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('description')}
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
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-28 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right"><div className="flex items-center justify-end gap-2"><div className="skeleton w-8 h-8 rounded-lg" /><div className="skeleton w-8 h-8 rounded-lg" /><div className="skeleton w-8 h-8 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingReceipts')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((receipt, index) => (
                  <motion.tr
                    key={receipt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{receipt.id}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{receipt.customerName}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{receipt.date}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">¥{(receipt.amount).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{receipt.paymentMethod}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{receipt.description}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => {
                            setCurrentReceipt(receipt);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-eye text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => {
                            setCurrentReceipt(receipt);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => handleDelete(receipt.id)}
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
      {!isLoading && filteredReceipts.length > 0 && (
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
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredReceipts.length)} {t('of')} {filteredReceipts.length} {t('totalRecords')}
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

      {/* 添加收据模态框 */}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('addReceipt')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsAddModalOpen(false); setCurrentReceipt({}); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('customer')}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.customerId || ''}
                      onChange={(e) => {
                        const selectedCustomer = customers.find(c => c.id === e.target.value);
                        setCurrentReceipt({ ...currentReceipt, customerId: e.target.value, customerName: selectedCustomer?.name });
                      }}
                    >
                      <option value="">{t('selectCustomer')}</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.date || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.amount || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('paymentMethod')}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.paymentMethod || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, paymentMethod: e.target.value })}
                    >
                      <option value="">{t('selectPaymentMethod')}</option>
                      <option value="现金">{t('cash')}</option>
                      <option value="支付宝">{t('alipay')}</option>
                      <option value="微信支付">{t('wechat')}</option>
                      <option value="银行卡">{t('bankCard')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      rows={3}
                      value={currentReceipt.description || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsAddModalOpen(false); setCurrentReceipt({}); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => handleAdd(currentReceipt as Omit<Receipt, 'id'>)}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 编辑收据模态框 */}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('editReceipt')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsEditModalOpen(false); setCurrentReceipt({}); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('customer')}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.customerId || ''}
                      onChange={(e) => {
                        const selectedCustomer = customers.find(c => c.id === e.target.value);
                        setCurrentReceipt({ ...currentReceipt, customerId: e.target.value, customerName: selectedCustomer?.name });
                      }}
                    >
                      <option value="">{t('selectCustomer')}</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.date || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.amount || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('paymentMethod')}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      value={currentReceipt.paymentMethod || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, paymentMethod: e.target.value })}
                    >
                      <option value="">{t('selectPaymentMethod')}</option>
                      <option value="现金">{t('cash')}</option>
                      <option value="支付宝">{t('alipay')}</option>
                      <option value="微信支付">{t('wechat')}</option>
                      <option value="银行卡">{t('bankCard')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
                      rows={3}
                      value={currentReceipt.description || ''}
                      onChange={(e) => setCurrentReceipt({ ...currentReceipt, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsEditModalOpen(false); setCurrentReceipt({}); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => handleEdit(currentReceipt)}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 收据详情模态框 */}
      <AnimatePresence>
        {isDetailModalOpen && currentReceipt.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setIsDetailModalOpen(false)}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('receiptDetails')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('receiptInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('receiptNumber')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentReceipt.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('date')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentReceipt.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('amount')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">¥{(currentReceipt.amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('paymentInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('paymentMethod')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentReceipt.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('customerName')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentReceipt.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('customerID')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentReceipt.customerId}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('description')}</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800/50">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{currentReceipt.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-5 py-2 flex items-center gap-2"
                  onClick={() => { toast.info(t('printFeatureComingSoon')); }}
                >
                  <i className="fa-solid fa-print text-xs"></i>
                  {t('print')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}