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

  const handleDelete = async (id: string) => {
    try {
      await customerAPI.deleteCustomer(id);
      setCustomers(customers.filter(cus => cus.id !== id));
      toast.success('客户已删除');
    } catch (error) {
      toast.error('删除客户失败');
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

  const FormModal = ({ isOpen, onClose, title, onSubmit }: { isOpen: boolean; onClose: () => void; title: string; onSubmit: () => void }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl modal-content overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient accent */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>
            </div>

            <div className="px-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'name', type: 'text', field: 'name' },
                  { key: 'email', type: 'email', field: 'email' },
                  { key: 'phone', type: 'text', field: 'phone' },
                  { key: 'address', type: 'text', field: 'address' },
                  { key: 'createDate', type: 'date', field: 'createdAt' },
                  { key: 'lastPurchase', type: 'date', field: 'lastPurchase' },
                  { key: 'totalSpent', type: 'number', field: 'totalSpent' },
                ].map(({ key, type, field }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      {t(key)}
                    </label>
                    <input
                      type={type}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 input-themed"
                      value={(currentCustomer as any)[field] || ''}
                      onChange={(e) => setCurrentCustomer({
                        ...currentCustomer,
                        [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={onClose}
              >
                {t('cancel')}
              </button>
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white btn-gradient"
                onClick={onSubmit}
              >
                <i className="fa-solid fa-check mr-1.5 text-xs"></i>
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('customers')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageCustomers')}</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search')}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed w-full sm:w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>

          <button
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white btn-gradient flex items-center justify-center gap-1.5"
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fa-solid fa-plus text-xs"></i>
            {t('add')}
          </button>
        </div>
      </div>

      {/* Count badge */}
      {!isLoading && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {filteredCustomers.length} {t('totalRecords') || 'records'}
          </span>
        </div>
      )}

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
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
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
                filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate block">{customer.address}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{customer.createdAt}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{customer.lastPurchase}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">¥{customer.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          onClick={() => { setCurrentCustomer(customer); setIsEditModalOpen(true); }}
                          title={t('edit')}
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          onClick={() => handleDelete(customer.id)}
                          title={t('delete')}
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

      {/* Add Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setCurrentCustomer({}); }}
        title={t('addCustomer')}
        onSubmit={() => handleAdd(currentCustomer as Omit<Customer, 'id'>)}
      />

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setCurrentCustomer({}); }}
        title={t('editCustomer')}
        onSubmit={() => handleEdit(currentCustomer)}
      />
    </div>
  );
}
