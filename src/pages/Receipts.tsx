import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('receipts')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('manageReceipts')}</p>
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
      
      {/* 收据表格 */}
      <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#161b22]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customer')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('paymentMethod')}
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loading')}</p>
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <i className="fa-solid fa-search fa-2xl text-gray-300 dark:text-gray-700"></i>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noMatchingReceipts')}</p>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt, index) => (
                  <motion.tr
                    key={receipt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{receipt.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{receipt.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{receipt.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">¥{(receipt.amount).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{receipt.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{receipt.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                        onClick={() => {
                          setCurrentReceipt(receipt);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-eye mr-1"></i> {t('details')}
                      </button>
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        onClick={() => {
                          setCurrentReceipt(receipt);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-edit mr-1"></i> {t('edit')}
                      </button>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        onClick={() => handleDelete(receipt.id)}
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
      
      {/* 添加收据模态框 */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('addReceipt')}</h3>
            </div>
            <div className="p-6">
              {/* 表单内容 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentReceipt.customerId || ''}
                    onChange={(e) => {
                      const selectedCustomer = customers.find(c => c.id === e.target.value);
                      setCurrentReceipt({ 
                        ...currentReceipt, 
                        customerId: e.target.value,
                        customerName: selectedCustomer?.name
                      });
                    }}
                  >
                    <option value="">{t('selectCustomer')}</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentReceipt.date || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('amount')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentReceipt.amount || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('paymentMethod')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={currentReceipt.description || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCurrentReceipt({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
                }`}
                onClick={() => handleAdd(currentReceipt as Omit<Receipt, 'id'>)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* 编辑收据模态框 */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('editReceipt')}</h3>
            </div>
            <div className="p-6">
              {/* 表单内容 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentReceipt.customerId || ''}
                    onChange={(e) => {
                      const selectedCustomer = customers.find(c => c.id === e.target.value);
                      setCurrentReceipt({ 
                        ...currentReceipt, 
                        customerId: e.target.value,
                        customerName: selectedCustomer?.name
                      });
                    }}
                  >
                    <option value="">{t('selectCustomer')}</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentReceipt.date || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('amount')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentReceipt.amount || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('paymentMethod')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={currentReceipt.description || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentReceipt({});
                }}
              >
                {t('cancel')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
                }`}
                onClick={() => handleEdit(currentReceipt)}
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* 收据详情模态框 */}
      {isDetailModalOpen && currentReceipt.id && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#0d1117] rounded-xl shadow-lg border border-gray-200 dark:border-[#1f242d] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#1f242d] flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('receiptDetails')}</h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <i className="fa-solid fa-times text-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('receiptInfo')}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('receiptNumber')}</p>
                        <p className="text-base text-gray-900 dark:text-white">{currentReceipt.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('date')}</p>
                        <p className="text-base text-gray-900 dark:text-white">{currentReceipt.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('amount')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">¥{(currentReceipt.amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('paymentInfo')}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('paymentMethod')}</p>
                        <p className="text-base text-gray-900 dark:text-white">{currentReceipt.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('customerName')}</p>
                        <p className="text-base text-gray-900 dark:text-white">{currentReceipt.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('customerID')}</p>
                        <p className="text-base text-gray-900 dark:text-white">{currentReceipt.customerId}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('description')}</h4>
                  <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#1f242d]">
                    <p className="text-base text-gray-900 dark:text-white">{currentReceipt.description}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#1f242d] flex justify-end">
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
                }`}
                onClick={() => {
                  // 这里可以添加打印或导出功能
                  toast.info(t('printFeatureComingSoon'));
                }}
              >
                <i className="fa-solid fa-print mr-2"></i>
                {t('print')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}