import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { customerAPI } from '../services/api';
import { Customer } from '../services/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';

const COUNTRY_OPTIONS = [
  'Singapore', 'Malaysia', 'China', 'Japan', 'Australia',
  'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'South Korea',
  'India', 'Hong Kong', 'Taiwan', 'United States', 'United Kingdom',
  'Germany', 'France', 'Canada', 'New Zealand', 'Myanmar',
];

function CountrySelect({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COUNTRY_OPTIONS.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm border rounded-lg transition-all cursor-pointer ${
          open
            ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
            : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
        } bg-white dark:bg-gray-900/50`}
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
          {value || placeholder || 'Select...'}
        </span>
        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full mb-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-800/50">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400"></i>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-700"
                  placeholder={placeholder || 'Search...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">No results</div>
              ) : (
                filtered.map(c => {
                  const isSelected = c === value;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <span>{c}</span>
                      {isSelected && <i className="fa-solid fa-check text-[10px] text-blue-500"></i>}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Customers() {
  const { t, language } = useContext(LanguageContext);
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
    const delName = deleteTarget.name;
    try {
      await customerAPI.deleteCustomer(deleteTarget.id);
      setCustomers(customers.filter(cus => cus.id !== deleteTarget.id));
      showSuccessToast(
        language === 'zh' ? '删除成功' : 'Deleted Successfully',
        language === 'zh' ? `${delName} 已被删除` : `${delName} has been deleted`
      );
    } catch (error) {
      toast.error(language === 'zh' ? '删除客户失败' : 'Failed to delete customer');
    } finally {
      setDeleteTarget(null);
    }
  };

  const showSuccessToast = (title: string, description: string) => {
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
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
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
  };

  const handleAdd = async (customer: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await customerAPI.createCustomer(customer);
      setCustomers([...customers, newCustomer]);
      setIsAddModalOpen(false);
      const cusName = currentCustomer.name || '';
      setCurrentCustomer({});
      showSuccessToast(
        language === 'zh' ? '添加成功' : 'Added Successfully',
        language === 'zh' ? `${cusName} 已成功添加` : `${cusName} has been added`
      );
    } catch (error) {
      toast.error(language === 'zh' ? '添加客户失败' : 'Failed to add customer');
    }
  };

  const handleEdit = async (customer: Partial<Customer>) => {
    if (!currentCustomer.id) return;
    const cusName = currentCustomer.name || '';
    try {
      await customerAPI.updateCustomer(currentCustomer.id, customer);
      setCustomers(customers.map(cus =>
        cus.id === currentCustomer.id ? { ...cus, ...customer } : cus
      ));
      setIsEditModalOpen(false);
      setCurrentCustomer({});
      showSuccessToast(
        language === 'zh' ? '更新成功' : 'Update Successful',
        language === 'zh' ? `${cusName} 的信息已成功更新` : `${cusName}'s info has been updated`
      );
    } catch (error) {
      toast.error(language === 'zh' ? '更新客户信息失败' : 'Failed to update customer');
    }
  };

  const filteredCustomers = customers.filter(cus =>
    cus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.country.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Shared field renderer for both view and edit modes
  const DetailField = ({ label, value, editable, field }: {
    label: string;
    value: string | undefined;
    editable?: boolean;
    field?: keyof Customer;
  }) => (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {editable && field ? (
        field === 'country' ? (
          <CountrySelect
            value={(currentCustomer.country as string) || ''}
            onChange={(v) => setCurrentCustomer({ ...currentCustomer, country: v })}
            placeholder={`${t('search')}...`}
          />
        ) : (
          <input
            type={field === 'email' ? 'email' : 'text'}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow"
            value={(currentCustomer[field] as string) || ''}
            onChange={(e) => setCurrentCustomer({ ...currentCustomer, [field]: e.target.value })}
          />
        )
      ) : (
        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{value || '-'}</p>
      )}
    </div>
  );

  // Card-based modal content used by both View & Add/Edit
  const renderModalBody = (editable: boolean) => (
    <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
      {/* Avatar Header */}
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/50">
        <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">
          {getInitials(currentCustomer.name || '?')}
        </div>
        <div className="flex-1 min-w-0">
          {editable ? (
            <div>
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t('name')}</p>
              <input
                type="text"
                className="w-full px-3 py-1.5 text-base font-semibold border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed"
                value={currentCustomer.name || ''}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
              />
            </div>
          ) : (
            <>
              <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{currentCustomer.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentCustomer.email}</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact Info Card */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
              <i className="fa-solid fa-address-book text-[10px] text-white"></i>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('contactInfo')}</h4>
          </div>
          <DetailField label={t('contactPerson')} value={currentCustomer.contactPerson} editable={editable} field="contactPerson" />
          <DetailField label={t('email')} value={currentCustomer.email} editable={editable} field="email" />
          <DetailField label={t('phone')} value={currentCustomer.phone} editable={editable} field="phone" />
        </div>

        {/* Address Card */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
              <i className="fa-solid fa-location-dot text-[10px] text-white"></i>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('address')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t('block')} value={currentCustomer.block} editable={editable} field="block" />
            <DetailField label={t('unitNo')} value={currentCustomer.unitNo} editable={editable} field="unitNo" />
          </div>
          <DetailField label={t('street')} value={currentCustomer.street} editable={editable} field="street" />
          <DetailField label={t('building')} value={currentCustomer.building} editable={editable} field="building" />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t('postalCode')} value={currentCustomer.postalCode} editable={editable} field="postalCode" />
            <DetailField label={t('country')} value={currentCustomer.country} editable={editable} field="country" />
          </div>
        </div>
      </div>
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

      {/* Customer Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('name')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('contactPerson')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('country')}
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
                      <div className="skeleton h-4 w-20 rounded" />
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
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="skeleton w-8 h-8 rounded-lg" />
                        <div className="skeleton w-8 h-8 rounded-lg" />
                        <div className="skeleton w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
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
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.contactPerson}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/60 px-2.5 py-1 rounded-full">
                        <i className="fa-solid fa-location-dot text-[9px] text-gray-400 dark:text-gray-500"></i>
                        {customer.country}
                      </span>
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
              {renderModalBody(false)}
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
              {renderModalBody(true)}
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
              {renderModalBody(true)}
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
