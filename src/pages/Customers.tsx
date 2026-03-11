import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { customerAPI, countryAPI, CountryOption } from '../services/api';
import { Customer } from '../services/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';


function StatusSelect({ value, onChange, t }: {
  value: string;
  onChange: (v: 'active' | 'inactive') => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = [
    { key: 'active' as const, label: t('active'), dot: '#10b981', bg: 'bg-emerald-500' },
    { key: 'inactive' as const, label: t('inactive'), dot: '#9ca3af', bg: 'bg-gray-400' },
  ];
  const current = options.find(o => o.key === value) || options[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm border rounded-xl transition-all cursor-pointer focus:outline-none ${
          open
            ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
            : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30'
        } bg-white dark:bg-gray-900/50`}
      >
        <span className="flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.bg}`} style={{ animationDuration: '2s' }}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${current.bg}`}></span>
          </span>
          {current.label}
        </span>
        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full mb-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
          >
            <div className="py-1">
              {options.map(opt => {
                const isSelected = value === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { onChange(opt.key); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.dot }}></span>
                      <span>{opt.label}</span>
                    </span>
                    {isSelected && <i className="fa-solid fa-check text-[10px] text-blue-500"></i>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailField({ label, value, editable, field, required, hasError, currentCustomer, setCurrentCustomer, validationErrors, setValidationErrors, countryOptions, language, t }: {
  label: string;
  value: string | undefined;
  editable?: boolean;
  field?: keyof Customer;
  required?: boolean;
  hasError: (f: string) => boolean;
  currentCustomer: Partial<Customer>;
  setCurrentCustomer: (c: Partial<Customer>) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (e: Record<string, string>) => void;
  countryOptions: CountryOption[];
  language: string;
  t: (key: string) => string;
}) {
  const clearError = (f: string) => {
    if (validationErrors[f]) { const e = { ...validationErrors }; delete e[f]; setValidationErrors(e); }
  };

  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1 whitespace-nowrap">
        {label}
        {required && editable && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      {editable && field ? (
        field === 'status' ? (
          <StatusSelect
            value={(currentCustomer.status as string) || 'active'}
            onChange={(v) => { setCurrentCustomer({ ...currentCustomer, status: v }); clearError('status'); }}
            t={t}
          />
        ) : field === 'country' ? (
          <select
            className={`w-full px-3 py-1.5 border ${hasError('country') ? 'border-red-400 dark:border-red-500 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'} rounded-xl bg-white dark:bg-gray-900/50 dark:text-white text-sm transition-all cursor-pointer focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none appearance-none`}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%239ca3af\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
            value={currentCustomer.countryId ?? ''}
            onChange={(e) => {
              const selectedId = Number(e.target.value) || 0;
              const selected = countryOptions.find(c => c.id === selectedId);
              setCurrentCustomer({ ...currentCustomer, country: selected?.name || '', countryId: selectedId });
              clearError('country');
            }}
          >
            <option value="">{language === 'zh' ? '请选择国家' : 'Select Country'}</option>
            {countryOptions.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : (
          <input
            type={field === 'email' ? 'email' : 'text'}
            className={`w-full px-3 py-1.5 text-sm border ${hasError(field) ? 'border-red-400 dark:border-red-500 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/50'} rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow`}
            value={(currentCustomer[field] as string) || ''}
            onChange={(e) => { setCurrentCustomer({ ...currentCustomer, [field]: e.target.value }); clearError(field); }}
          />
        )
      ) : (
        field === 'status' ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${
            value === 'active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${value === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            {value === 'active' ? t('active') : t('inactive')}
          </span>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{value || '-'}</p>
        )
      )}
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomers();
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const data = await countryAPI.getCountries();
      setCountryOptions(data);
    } catch (error) {
      console.warn('[Customer] Failed to fetch countries:', error);
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerAPI.getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error(t('fetchError') || '获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const delName = deleteTarget.name;
    try {
      await customerAPI.deleteCustomer(deleteTarget.id);
      const refreshed = await customerAPI.getCustomers();
      setCustomers(refreshed);
      showToast(
        language === 'zh' ? '删除成功' : 'Deleted Successfully',
        language === 'zh' ? `${delName} 已被删除` : `${delName} has been deleted`,
        'delete'
      );
    } catch (error) {
      console.error('[Customer] Delete failed:', error);
      toast.error(t('deleteError') || '删除失败');
    } finally {
      setDeleteTarget(null);
    }
  };

  const showToast = (title: string, description: string, variant: 'add' | 'update' | 'delete' = 'update') => {
    const config = {
      add: { icon: 'fa-solid fa-plus', bar: 'bg-gradient-to-r from-emerald-400 to-cyan-500', iconBg: 'bg-gradient-to-br from-emerald-400 to-cyan-500' },
      update: { icon: 'fa-solid fa-check', bar: 'btn-gradient', iconBg: 'btn-gradient' },
      delete: { icon: 'fa-solid fa-trash-can', bar: 'bg-gradient-to-r from-red-400 to-rose-500', iconBg: 'bg-gradient-to-br from-red-400 to-rose-500' },
    }[variant];
    toast.custom((id) => (
      <div
        className="w-[360px] bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden"
        style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        <div className={`h-1 ${config.bar}`} />
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <i className={`${config.icon} text-white text-sm`} />
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
    const cusName = customer.name || '';
    try {
      await customerAPI.createCustomer(customer);
      const refreshed = await customerAPI.getCustomers();
      setCustomers(refreshed);
      setIsAddModalOpen(false);
      setCurrentCustomer({});
      showToast(
        language === 'zh' ? '添加成功' : 'Added Successfully',
        language === 'zh' ? `${cusName} 已成功添加` : `${cusName} has been added`,
        'add'
      );
    } catch (error) {
      console.error('[Customer] Save failed:', error);
      toast.error(t('addError') || '添加失败');
    }
  };

  const handleEdit = async (customer: Partial<Customer>) => {
    if (!currentCustomer.id) return;
    const cusName = currentCustomer.name || '';

    try {
      await customerAPI.updateCustomer(currentCustomer.id, customer);
      const refreshed = await customerAPI.getCustomers();
      setCustomers(refreshed);
      setIsEditModalOpen(false);
      setCurrentCustomer({});
      showToast(
        language === 'zh' ? '更新成功' : 'Update Successful',
        language === 'zh' ? `${cusName} 的信息已成功更新` : `${cusName}'s info has been updated`,
        'update'
      );
    } catch (error) {
      console.error('[Customer] Update failed:', error);
      toast.error(t('updateError') || '更新失败');
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

  const hasError = (field: string) => !!validationErrors[field];

  const dfProps = { hasError, currentCustomer, setCurrentCustomer, validationErrors, setValidationErrors, countryOptions, language, t };

  const renderFormContent = (editable: boolean) => (
    <>
      {/* Validation Banner */}
      {editable && <AnimatePresence><ValidationBanner /></AnimatePresence>}

      {/* Avatar Header with Status on same line */}
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/50">
        <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">
          {getInitials(currentCustomer.name || '?')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">{t('name')}<span className="text-red-500 ml-0.5">*</span></p>
          <input
            type="text"
            className={`w-full px-3 py-1.5 text-sm font-semibold border ${hasError('name') ? 'border-red-400 dark:border-red-500 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/50'} rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed`}
            value={currentCustomer.name || ''}
            onChange={(e) => { setCurrentCustomer({ ...currentCustomer, name: e.target.value }); if (validationErrors.name) { const err = { ...validationErrors }; delete err.name; setValidationErrors(err); } }}
          />
        </div>
        <div className="flex-shrink-0 w-40">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">{t('status')}<span className="text-red-500 ml-0.5">*</span></p>
          <StatusSelect
            value={(currentCustomer.status as string) || 'active'}
            onChange={(v) => { setCurrentCustomer({ ...currentCustomer, status: v }); if (validationErrors.status) { const err = { ...validationErrors }; delete err.status; setValidationErrors(err); } }}
            t={t}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact Info Card */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
              <i className="fa-solid fa-address-book text-[10px] text-white"></i>
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t('contactInfo')}</h4>
          </div>
          <DetailField {...dfProps} label={t('contactPerson')} value={currentCustomer.contactPerson} editable={editable} field="contactPerson" required />
          <DetailField {...dfProps} label={t('email')} value={currentCustomer.email} editable={editable} field="email" />
          <DetailField {...dfProps} label={t('phone')} value={currentCustomer.phone} editable={editable} field="phone" />
        </div>

        {/* Address Card */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
              <i className="fa-solid fa-location-dot text-[10px] text-white"></i>
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t('address')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField {...dfProps} label={t('block')} value={currentCustomer.block} editable={editable} field="block" />
            <DetailField {...dfProps} label={t('unitNo')} value={currentCustomer.unitNo} editable={editable} field="unitNo" />
          </div>
          <DetailField {...dfProps} label={t('street')} value={currentCustomer.street} editable={editable} field="street" />
          <DetailField {...dfProps} label={t('building')} value={currentCustomer.building} editable={editable} field="building" />
          <div className="grid grid-cols-2 gap-4">
            <DetailField {...dfProps} label={t('postalCode')} value={currentCustomer.postalCode} editable={editable} field="postalCode" />
            <DetailField {...dfProps} label={t('country')} value={currentCustomer.country} editable={editable} field="country" required />
          </div>
        </div>
      </div>
    </>
  );

  const validateRequired = (): boolean => {
    const errors: Record<string, string> = {};
    const checks: { field: string; check: boolean; zh: string; en: string }[] = [
      { field: 'name', check: !currentCustomer.name?.trim(), zh: '客户名称', en: 'Customer Name' },
      { field: 'contactPerson', check: !currentCustomer.contactPerson?.trim(), zh: '联系人', en: 'Contact Person' },
      { field: 'status', check: !currentCustomer.status, zh: '状态', en: 'Status' },
      { field: 'country', check: !currentCustomer.countryId && !currentCustomer.country?.trim(), zh: '国家', en: 'Country' },
    ];
    checks.forEach(c => { if (c.check) errors[c.field] = language === 'zh' ? c.zh : c.en; });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const ValidationBanner = () => {
    const errorList = Object.values(validationErrors);
    if (errorList.length === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
        className="rounded-xl border border-red-200 dark:border-red-800/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="fa-solid fa-circle-exclamation text-red-500 dark:text-red-400 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
              {language === 'zh' ? '请填写以下必填信息' : 'Please fill in the required fields'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {errorList.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-red-200/60 dark:border-red-800/40 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                  {name}
                </span>
              ))}
            </div>
          </div>
          <button
            className="w-6 h-6 rounded-md flex items-center justify-center text-red-300 dark:text-red-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
            onClick={() => setValidationErrors({})}
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      </motion.div>
    );
  };

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
              onClick={() => {
                const sg = countryOptions.find(c => c.name.toLowerCase().includes('singapore'));
                setCurrentCustomer({ status: 'active', country: sg?.name || 'Singapore', countryId: sg?.id || 0 });
                setValidationErrors({});
                setIsAddModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('add')}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/20 border-b border-gray-200/60 dark:border-gray-700/50">
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('name')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('contactPerson')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('phone')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('email')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('country')}
                </th>
                <th scope="col" className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('status')}
                </th>
                <th scope="col" className="px-5 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-800/50">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="skeleton h-4 w-28 rounded" />
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-20 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-28 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-36 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-4 w-24 rounded" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="skeleton h-6 w-16 rounded-lg" />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
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
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('noData') || '暂无数据'}</p>
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
                    className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="font-semibold text-[13px] text-gray-900 dark:text-white">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{customer.contactPerson || '-'}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{customer.phone || '-'}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{customer.email || '-'}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[13px] text-gray-600 dark:text-gray-400">{customer.country || '-'}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {customer.status === 'active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => { setCurrentCustomer(customer); setIsDetailModalOpen(true); }}
                          title={language === 'zh' ? '查看' : 'View'}
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => {
                            setCurrentCustomer(customer);
                            setValidationErrors({});
                            setIsEditModalOpen(true);
                          }}
                          title={language === 'zh' ? '编辑' : 'Edit'}
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setDeleteTarget(customer)}
                          title={language === 'zh' ? '删除' : 'Delete'}
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
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-[60rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'zh' ? '客户详情' : 'Customer Details'}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentCustomer({}); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Avatar Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/50">
                  <div className="w-14 h-14 rounded-2xl avatar-container text-lg flex-shrink-0 shadow-lg">
                    {getInitials(currentCustomer.name || '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{currentCustomer.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentCustomer.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                    currentCustomer.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentCustomer.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {currentCustomer.status === 'active' ? t('active') : t('inactive')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Contact Info Card */}
                  <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
                        <i className="fa-solid fa-address-book text-[10px] text-white"></i>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t('contactInfo')}</h4>
                    </div>
                    <DetailField {...dfProps} label={t('contactPerson')} value={currentCustomer.contactPerson} field="contactPerson" />
                    <DetailField {...dfProps} label={t('email')} value={currentCustomer.email} field="email" />
                    <DetailField {...dfProps} label={t('phone')} value={currentCustomer.phone} field="phone" />
                  </div>

                  {/* Address Card */}
                  <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
                        <i className="fa-solid fa-location-dot text-[10px] text-white"></i>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t('address')}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField {...dfProps} label={t('block')} value={currentCustomer.block} field="block" />
                      <DetailField {...dfProps} label={t('unitNo')} value={currentCustomer.unitNo} field="unitNo" />
                    </div>
                    <DetailField {...dfProps} label={t('street')} value={currentCustomer.street} field="street" />
                    <DetailField {...dfProps} label={t('building')} value={currentCustomer.building} field="building" />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField {...dfProps} label={t('postalCode')} value={currentCustomer.postalCode} field="postalCode" />
                      <DetailField {...dfProps} label={t('country')} value={currentCustomer.country} field="country" />
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

      {/* Add Customer Modal */}
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
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-[60rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('add')} {t('customers')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentCustomer({});
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {renderFormContent(true)}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentCustomer({});
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => { if (validateRequired()) handleAdd(currentCustomer as Omit<Customer, 'id'>); }}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
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
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-[60rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('edit')} {t('customers')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentCustomer({});
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {renderFormContent(true)}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentCustomer({});
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={() => { if (validateRequired()) handleEdit(currentCustomer); }}
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
