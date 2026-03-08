import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { invoiceAPI, customerAPI } from '../services/api';
import { Invoice, InvoiceItem, Customer } from '../services/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DatePicker from '../components/DatePicker';

export default function Invoices() {
  const { t, language } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice>>({ items: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [focusedPriceItemId, setFocusedPriceItemId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const printRef = useRef<HTMLDivElement>(null);
  const [statusDdlOpen, setStatusDdlOpen] = useState(false);
  const [filterDdlOpen, setFilterDdlOpen] = useState(false);
  const statusDdlRef = useRef<HTMLDivElement>(null);
  const filterDdlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusDdlRef.current && !statusDdlRef.current.contains(e.target as Node)) {
        setStatusDdlOpen(false);
      }
      if (filterDdlRef.current && !filterDdlRef.current.contains(e.target as Node)) {
        setFilterDdlOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invoicesData, customersData] = await Promise.all([
        invoiceAPI.getInvoices(),
        customerAPI.getCustomers()
      ]);
      setInvoices(invoicesData);
      setCustomers(customersData);
    } catch (error) {
      toast.error(t('fetchDataFailed'));
    } finally {
      setIsLoading(false);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const invNo = deleteTarget.invoiceNo;
    try {
      await invoiceAPI.deleteInvoice(deleteTarget.id);
      setInvoices(invoices.filter(inv => inv.id !== deleteTarget.id));
      showSuccessToast(
        language === 'zh' ? '删除成功' : 'Deleted Successfully',
        language === 'zh' ? `${invNo} 已被删除` : `${invNo} has been deleted`
      );
    } catch (error) {
      toast.error(t('deleteInvoiceFailed'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAdd = async (invoice: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await invoiceAPI.createInvoice(invoice);
      setInvoices([...invoices, newInvoice]);
      setIsAddModalOpen(false);
      const invNo = currentInvoice.invoiceNo || '';
      setCurrentInvoice({ items: [] });
      showSuccessToast(
        language === 'zh' ? '添加成功' : 'Added Successfully',
        language === 'zh' ? `${invNo} 已成功添加` : `${invNo} has been added`
      );
    } catch (error) {
      toast.error(t('addInvoiceFailed'));
    }
  };

  const handleEdit = async (invoice: Partial<Invoice>) => {
    if (!currentInvoice.id) return;
    const invNo = currentInvoice.invoiceNo || '';

    try {
      await invoiceAPI.updateInvoice(currentInvoice.id, invoice);
      setInvoices(invoices.map(inv =>
        inv.id === currentInvoice.id ? { ...inv, ...invoice } : inv
      ));
      setIsEditModalOpen(false);
      setCurrentInvoice({ items: [] });
      showSuccessToast(
        language === 'zh' ? '更新成功' : 'Update Successful',
        language === 'zh' ? `${invNo} 的信息已成功更新` : `${invNo}'s info has been updated`
      );
    } catch (error) {
      toast.error(t('updateInvoiceFailed'));
    }
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      price: 0,
      amount: 0
    };
    setCurrentInvoice({
      ...currentInvoice,
      items: [...(currentInvoice.items || []), newItem]
    });
  };

  const removeInvoiceItem = (itemId: string) => {
    setCurrentInvoice({
      ...currentInvoice,
      items: (currentInvoice.items || []).filter(item => item.id !== itemId)
    });
  };

  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = (currentInvoice.items || []).map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };

        // 自动计算金额
        if (field === 'quantity' || field === 'price') {
          updatedItem.amount = updatedItem.quantity * updatedItem.price;
        }

        return updatedItem;
      }
      return item;
    });

    // 重新计算总金额
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    setCurrentInvoice({
      ...currentInvoice,
      items: updatedItems,
      totalAmount
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedInvoices = filteredInvoices.slice((safePage - 1) * pageSize, safePage * pageSize);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-300', dot: '#9ca3af' };
      case 'sent':
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', dot: '#3b82f6' };
      case 'paid':
        return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', dot: '#10b981' };
      case 'overdue':
        return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: '#ef4444' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-300', dot: '#9ca3af' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return t('draft');
      case 'sent': return t('sent');
      case 'paid': return t('paid');
      case 'overdue': return t('overdue');
      default: return status;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const renderInvoiceForm = (mode: 'add' | 'edit') => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('customer')}
          </label>
          <select
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
            value={currentInvoice.customerId || ''}
            onChange={(e) => {
              const selectedCustomer = customers.find(c => c.id === e.target.value);
              setCurrentInvoice({
                ...currentInvoice,
                customerId: e.target.value,
                customerName: selectedCustomer?.name,
                contactPerson: selectedCustomer?.contactPerson || ''
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('contactPerson')}
          </label>
          <input
            type="text"
            readOnly
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            value={currentInvoice.contactPerson || ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('date')}
          </label>
          <DatePicker
            value={currentInvoice.date || ''}
            onChange={(val) => setCurrentInvoice({ ...currentInvoice, date: val })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('dueDate')}
          </label>
          <DatePicker
            value={currentInvoice.dueDate || ''}
            onChange={(val) => setCurrentInvoice({ ...currentInvoice, dueDate: val })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('status')}
          </label>
          <div ref={statusDdlRef} className="relative">
            <button
              type="button"
              onClick={() => setStatusDdlOpen(!statusDdlOpen)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border rounded-xl transition-all cursor-pointer ${
                statusDdlOpen
                  ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
              } bg-white dark:bg-gray-900/50`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusBadge(currentInvoice.status || 'draft').dot }}></span>
                <span className="text-gray-900 dark:text-white">{getStatusText(currentInvoice.status || 'draft')}</span>
              </span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${statusDdlOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <AnimatePresence>
              {statusDdlOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 top-full mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
                >
                  <div className="py-1">
                    {(['draft', 'sent', 'paid', 'overdue'] as const).map((status) => {
                      const badge = getStatusBadge(status);
                      const isSelected = (currentInvoice.status || 'draft') === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setCurrentInvoice({ ...currentInvoice, status });
                            setStatusDdlOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.dot }}></span>
                            <span>{getStatusText(status)}</span>
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
        </div>
      </div>

      {/* 发票项目 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('invoiceItems')}</h4>
          <button
            className="btn-gradient px-3 py-1.5 rounded-xl text-xs font-medium text-white flex items-center gap-1.5"
            onClick={addInvoiceItem}
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            {t('addItem')}
          </button>
        </div>

        <div className="space-y-3">
          {(currentInvoice.items || []).map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
              <div className="col-span-12 md:col-span-5">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('description')}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
                  value={item.description || ''}
                  onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('quantity')}
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
                  value={item.quantity || 1}
                  onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('unitPrice')}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
                  value={focusedPriceItemId === item.id ? priceInput : (item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onFocus={() => {
                    setFocusedPriceItemId(item.id);
                    setPriceInput(item.price != null ? String(item.price) : '');
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
                      setPriceInput(raw);
                      updateInvoiceItem(item.id, 'price', raw === '' ? 0 : parseFloat(raw));
                    }
                  }}
                  onBlur={() => setFocusedPriceItemId(null)}
                />
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('amount')}
                </label>
                <div className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800/50 bg-gray-100 dark:bg-gray-800/50 text-sm font-medium text-gray-900 dark:text-white">
                  ¥{(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-center md:justify-end">
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => removeInvoiceItem(item.id)}
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))}

          {((currentInvoice.items || []).length === 0) && (
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/50">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-list text-gray-400 dark:text-gray-500"></i>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('clickAddItemToStart')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 总计 */}
      <div className="border-t border-gray-100 dark:border-gray-800/50 pt-4 flex justify-end">
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('totalAmount')}:</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ¥{(currentInvoice.totalAmount || 0).toLocaleString()}
            </span>
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('invoices')}</h1>
            <p className="text-sm text-gray-500">{t('manageInvoices')}</p>
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

            <div ref={filterDdlRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterDdlOpen(!filterDdlOpen)}
                className={`flex items-center justify-between gap-2 px-4 py-2 text-sm border rounded-xl transition-all cursor-pointer min-w-[140px] ${
                  filterDdlOpen
                    ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                } bg-white dark:bg-gray-900/50`}
              >
                <span className="flex items-center gap-2">
                  {statusFilter !== 'all' && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusBadge(statusFilter).dot }}></span>
                  )}
                  <span className="text-gray-900 dark:text-white">
                    {statusFilter === 'all' ? t('allStatus') : getStatusText(statusFilter)}
                  </span>
                </span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${filterDdlOpen ? 'rotate-180' : ''}`}></i>
              </button>
              <AnimatePresence>
                {filterDdlOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 top-full mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
                  >
                    <div className="py-1">
                      {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => {
                        const isSelected = statusFilter === status;
                        const badge = status !== 'all' ? getStatusBadge(status) : null;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setStatusFilter(status);
                              setFilterDdlOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              {badge && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.dot }}></span>}
                              <span>{status === 'all' ? t('allStatus') : getStatusText(status)}</span>
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

            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
              <button
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'btn-gradient text-white' : 'bg-white dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                onClick={() => setViewMode('list')}
                title={language === 'zh' ? '列表视图' : 'List View'}
              >
                <i className="fa-solid fa-list"></i>
              </button>
              <button
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'card' ? 'btn-gradient text-white' : 'bg-white dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                onClick={() => setViewMode('card')}
                title={language === 'zh' ? '卡片视图' : 'Card View'}
              >
                <i className="fa-solid fa-grip"></i>
              </button>
            </div>

            <button
              className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2 flex items-center justify-center"
              onClick={() => {
                const maxNo = invoices.reduce((max, inv) => {
                  const num = parseInt(inv.invoiceNo?.replace('INV-', '') || '0');
                  return num > max ? num : max;
                }, 0);
                setCurrentInvoice({ items: [], date: todayStr, dueDate: todayStr, invoiceNo: `INV-${String(maxNo + 1).padStart(4, '0')}` });
                setIsAddModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('add')}
            </button>
          </div>
        </div>
      </div>

      {/* 发票列表 / 卡片视图 */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800/80">
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('invoiceNumber')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('contactPerson')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('dueDate')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-28 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="skeleton h-4 w-24 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
                        <i className="fa-solid fa-file-invoice text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingInvoices')}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice, index) => {
                    const badge = getStatusBadge(invoice.status);
                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNo}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerName}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{invoice.contactPerson}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{invoice.date}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{invoice.dueDate}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">¥{(invoice.totalAmount).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.dot }}></span>
                            {getStatusText(invoice.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                              onClick={() => {
                                setCurrentInvoice(invoice);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <i className="fa-solid fa-eye text-sm"></i>
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              onClick={() => {
                                setCurrentInvoice(invoice);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <i className="fa-solid fa-pen-to-square text-sm"></i>
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              onClick={() => setDeleteTarget(invoice)}
                            >
                              <i className="fa-solid fa-trash-can text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="skeleton h-5 w-24 rounded" />
                    <div className="skeleton h-6 w-16 rounded-full" />
                  </div>
                  <div className="skeleton h-4 w-32 rounded mb-3" />
                  <div className="skeleton h-4 w-28 rounded mb-4" />
                  <div className="skeleton h-8 w-24 rounded mb-4" />
                  <div className="flex gap-2">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 px-6 py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-file-invoice text-gray-400 dark:text-gray-500 text-lg"></i>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingInvoices')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedInvoices.map((invoice, index) => {
                const badge = getStatusBadge(invoice.status);
                const statusGradient = invoice.status === 'paid'
                  ? 'from-emerald-500 to-teal-500'
                  : invoice.status === 'sent'
                  ? 'from-blue-500 to-indigo-500'
                  : invoice.status === 'overdue'
                  ? 'from-red-500 to-orange-500'
                  : 'from-gray-400 to-gray-500';
                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
                    className="group relative bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Top gradient accent */}
                    <div className={`h-1 w-full bg-gradient-to-r ${statusGradient}`} />

                    <div className="p-5">
                      {/* Header: Invoice No + Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${statusGradient} flex items-center justify-center shadow-sm`}>
                            <i className="fa-solid fa-file-invoice text-white text-sm"></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.invoiceNo}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">{invoice.date}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.dot }}></span>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>

                      {/* Customer info */}
                      <div className="mb-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-building text-[10px] text-gray-300 dark:text-gray-600 w-3.5 text-center"></i>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{invoice.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-user text-[10px] text-gray-300 dark:text-gray-600 w-3.5 text-center"></i>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{invoice.contactPerson}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/50">
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t('totalAmount')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">¥{invoice.totalAmount.toLocaleString()}</p>
                      </div>

                      {/* Due date + Items count */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <i className="fa-regular fa-calendar text-[10px]"></i>
                          <span>{language === 'zh' ? '到期' : 'Due'}: {invoice.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <i className="fa-solid fa-list-ol text-[10px]"></i>
                          <span>{invoice.items.length} {language === 'zh' ? '项' : 'items'}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800/50">
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                          onClick={() => {
                            setCurrentInvoice(invoice);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-eye text-[10px]"></i>
                          {language === 'zh' ? '查看' : 'View'}
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          onClick={() => {
                            setCurrentInvoice(invoice);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          {language === 'zh' ? '编辑' : 'Edit'}
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 rounded-xl text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => setDeleteTarget(invoice)}
                        >
                          <i className="fa-solid fa-trash-can text-[11px]"></i>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredInvoices.length > 0 && (
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
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredInvoices.length)} {t('of')} {filteredInvoices.length} {t('totalRecords')}
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

      {/* 添加发票模态框 */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-4xl max-h-[90vh] overflow-hidden modal-content relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient accent bar */}
              <div className="h-1 w-full btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('addInvoice')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentInvoice({ items: [] });
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-10rem)]">
                {renderInvoiceForm('add')}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/50 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentInvoice({ items: [] });
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient px-5 py-2 rounded-xl text-sm font-medium text-white"
                  onClick={() => handleAdd(currentInvoice as Omit<Invoice, 'id'>)}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 编辑发票模态框 */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-4xl max-h-[90vh] overflow-hidden modal-content relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient accent bar */}
              <div className="h-1 w-full btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('editInvoice')}</h3>
                  {currentInvoice.invoiceNo && (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {currentInvoice.invoiceNo}
                    </span>
                  )}
                </div>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentInvoice({ items: [] });
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-10rem)]">
                {renderInvoiceForm('edit')}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/50 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentInvoice({ items: [] });
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient px-5 py-2 rounded-xl text-sm font-medium text-white"
                  onClick={() => handleEdit(currentInvoice)}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 发票详情模态框 */}
      <AnimatePresence>
        {isDetailModalOpen && currentInvoice.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-4xl max-h-[90vh] overflow-hidden modal-content relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient accent bar */}
              <div className="h-1 w-full btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('invoiceDetails')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-10rem)]">
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('invoiceInfo')}</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('invoiceNumber')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentInvoice.invoiceNo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('date')}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{currentInvoice.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('dueDate')}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{currentInvoice.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{t('status')}</p>
                          {(() => {
                            const badge = getStatusBadge(currentInvoice.status || '');
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.dot }}></span>
                                {getStatusText(currentInvoice.status || '')}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('customerInfo')}</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('customerName')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentInvoice.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('contactPerson')}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{currentInvoice.contactPerson || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('customerID')}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{currentInvoice.customerId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 发票项目 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('invoiceItems')}</h4>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800/50">
                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              {t('description')}
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              {t('quantity')}
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              {t('unitPrice')}
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              {t('amount')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                          {(currentInvoice.items || []).map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-white">{item.description}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{item.quantity}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-500 dark:text-gray-400">¥{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">¥{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 总计 */}
                  <div className="border-t border-gray-100 dark:border-gray-800/50 pt-4 flex justify-end">
                    <div className="w-full md:w-64">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('totalAmount')}:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ¥{(currentInvoice.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/50 flex justify-end">
                <button
                  className="btn-gradient px-5 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2"
                  onClick={handlePrint}
                >
                  <i className="fa-solid fa-print text-xs"></i>
                  {t('printInvoice')}
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
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{deleteTarget.invoiceNo}</p>
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

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Hidden print area */}
      <div
        id="invoice-print-area"
        ref={printRef}
        className="hidden print:block"
        style={{ display: 'none' }}
      >
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{t('invoiceDetails')}</h1>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{t('systemTitle')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 4px 0' }}>{t('invoiceNumber')}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{currentInvoice.invoiceNo}</p>
            </div>
          </div>

          {/* Invoice info + Customer info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>{t('invoiceInfo')}</h3>
              <table style={{ fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#666' }}>{t('date')}:</td>
                    <td style={{ padding: '2px 0' }}>{currentInvoice.date}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#666' }}>{t('dueDate')}:</td>
                    <td style={{ padding: '2px 0' }}>{currentInvoice.dueDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#666' }}>{t('status')}:</td>
                    <td style={{ padding: '2px 0' }}>{getStatusText(currentInvoice.status || '')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>{t('customerInfo')}</h3>
              <table style={{ fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#666' }}>{t('customerName')}:</td>
                    <td style={{ padding: '2px 0' }}>{currentInvoice.customerName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#666' }}>{t('contactPerson')}:</td>
                    <td style={{ padding: '2px 0' }}>{currentInvoice.contactPerson}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#666' }}>{t('customerId')}:</td>
                    <td style={{ padding: '2px 0' }}>{currentInvoice.customerId}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: 'bold' }}>{t('description')}</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '2px solid #ddd', fontWeight: 'bold' }}>{t('quantity')}</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '2px solid #ddd', fontWeight: 'bold' }}>{t('unitPrice')}</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '2px solid #ddd', fontWeight: 'bold' }}>{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              {(currentInvoice.items || []).map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{item.description}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>¥{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>¥{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total + QR Code */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <QRCodeSVG
                value={JSON.stringify({
                  invoiceId: currentInvoice.id,
                  amount: currentInvoice.totalAmount,
                  date: currentInvoice.date,
                  customer: currentInvoice.customerName,
                })}
                size={120}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '16px', color: '#666' }}>{t('totalAmount')}:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>¥{(currentInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
