import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { invoiceAPI, customerAPI } from '../services/api';
import { Invoice, InvoiceItem, Customer } from '../services/mockData';
import { toast } from 'sonner';

export default function Invoices() {
  const { t } = useContext(LanguageContext);
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
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
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

  const handleDelete = async (id: string) => {
    try {
      await invoiceAPI.deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      toast.success(t('invoiceDeleted'));
    } catch (error) {
      toast.error(t('deleteInvoiceFailed'));
    }
  };

  const handleAdd = async (invoice: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await invoiceAPI.createInvoice(invoice);
      setInvoices([...invoices, newInvoice]);
      setIsAddModalOpen(false);
      setCurrentInvoice({ items: [] });
      toast.success(t('invoiceAdded'));
    } catch (error) {
      toast.error(t('addInvoiceFailed'));
    }
  };

  const handleEdit = async (invoice: Partial<Invoice>) => {
    if (!currentInvoice.id) return;

    try {
      await invoiceAPI.updateInvoice(currentInvoice.id, invoice);
      setInvoices(invoices.map(inv =>
        inv.id === currentInvoice.id ? { ...inv, ...invoice } : inv
      ));
      setIsEditModalOpen(false);
      setCurrentInvoice({ items: [] });
      toast.success(t('invoiceUpdated'));
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
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());

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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('date')}
          </label>
          <input
            type="date"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
            value={currentInvoice.date || ''}
            onChange={(e) => setCurrentInvoice({ ...currentInvoice, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('dueDate')}
          </label>
          <input
            type="date"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
            value={currentInvoice.dueDate || ''}
            onChange={(e) => setCurrentInvoice({ ...currentInvoice, dueDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('status')}
          </label>
          <select
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
            value={currentInvoice.status || 'draft'}
            onChange={(e) => setCurrentInvoice({ ...currentInvoice, status: e.target.value as Invoice['status'] })}
          >
            <option value="draft">{t('draft')}</option>
            <option value="sent">{t('sent')}</option>
            <option value="paid">{t('paid')}</option>
            <option value="overdue">{t('overdue')}</option>
          </select>
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
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
                  value={item.price || 0}
                  onChange={(e) => updateInvoiceItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('amount')}
                </label>
                <div className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800/50 bg-gray-100 dark:bg-gray-800/50 text-sm font-medium text-gray-900 dark:text-white">
                  ¥{(item.amount || 0).toFixed(2)}
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

            <select
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white input-themed"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('allStatus')}</option>
              <option value="draft">{t('draft')}</option>
              <option value="sent">{t('sent')}</option>
              <option value="paid">{t('paid')}</option>
              <option value="overdue">{t('overdue')}</option>
            </select>

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

      {/* 发票表格 */}
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('customer')}
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
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
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
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerName}</span>
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
                            onClick={() => handleDelete(invoice.id)}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('editInvoice')}</h3>
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
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentInvoice.id}</p>
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">¥{item.price.toFixed(2)}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">¥{item.amount.toFixed(2)}</span>
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
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{currentInvoice.id}</p>
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
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>¥{item.price.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>¥{item.amount.toFixed(2)}</td>
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
