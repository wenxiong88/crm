import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { payrollAPI, employeeAPI } from '../services/api';
import { Payroll as PayrollType, Employee } from '../services/mockData';
import { toast } from 'sonner';
import { format, parse, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Payroll() {
  const { t, language } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(d)) return dateStr;
    return format(d, 'dd MMM yyyy', { locale: language === 'zh' ? zhCN : undefined });
  };

  const formatCurrency = (val?: number) => {
    if (val == null) return '-';
    return `¥${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState<Partial<PayrollType>>({});
  const [deleteTarget, setDeleteTarget] = useState<PayrollType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [payrollData, empData] = await Promise.all([
        payrollAPI.getPayrolls(),
        employeeAPI.getEmployees()
      ]);
      setPayrolls(payrollData);
      setEmployees(empData);
    } catch {
      toast.error(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await payrollAPI.deletePayroll(deleteTarget.id);
      setPayrolls(payrolls.filter(p => p.id !== deleteTarget.id));
      toast.success(t('deleteSuccess'));
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAdd = async () => {
    try {
      const newPayroll = await payrollAPI.createPayroll(currentPayroll as Omit<PayrollType, 'id'>);
      setPayrolls([...payrolls, newPayroll]);
      setIsAddModalOpen(false);
      setCurrentPayroll({});
      toast.success(t('addSuccess'));
    } catch {
      toast.error(t('addError'));
    }
  };

  const handleEdit = async () => {
    if (!currentPayroll.id) return;
    try {
      await payrollAPI.updatePayroll(currentPayroll.id, currentPayroll);
      setPayrolls(payrolls.map(p =>
        p.id === currentPayroll.id ? { ...p, ...currentPayroll } as PayrollType : p
      ));
      setIsEditModalOpen(false);
      setCurrentPayroll({});
      toast.success(t('updateSuccess'));
    } catch {
      toast.error(t('updateError'));
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      setCurrentPayroll({
        ...currentPayroll,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        position: emp.position
      });
    }
  };

  const updateSalaryFields = (field: 'baseSalary' | 'bonus' | 'deductions', value: string) => {
    const numVal = value === '' ? 0 : parseFloat(value);
    if (value !== '' && isNaN(numVal)) return;
    const updated = { ...currentPayroll, [field]: numVal };
    updated.netSalary = Math.round(((updated.baseSalary || 0) + (updated.bonus || 0) - (updated.deductions || 0)) * 100) / 100;
    setCurrentPayroll(updated);
  };

  const filteredPayrolls = payrolls.filter(p =>
    p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPayrolls.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPayrolls = filteredPayrolls.slice((safePage - 1) * pageSize, safePage * pageSize);

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

  const getStatusBadge = (status: PayrollType['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      processed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    const labels = {
      pending: t('statusPending'),
      processed: t('statusProcessed'),
      paid: t('statusPaid')
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('selectEmployee')} <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.employeeId || ''}
          onChange={(e) => handleEmployeeSelect(e.target.value)}
        >
          <option value="">{t('selectEmployee')}</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('month')} <span className="text-red-500">*</span>
        </label>
        <input
          type="month"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.month || ''}
          onChange={(e) => setCurrentPayroll({ ...currentPayroll, month: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('baseSalary')}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.baseSalary ?? ''}
          onChange={(e) => updateSalaryFields('baseSalary', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('bonus')}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.bonus ?? ''}
          onChange={(e) => updateSalaryFields('bonus', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('deductions')}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.deductions ?? ''}
          onChange={(e) => updateSalaryFields('deductions', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('netSalary')}
        </label>
        <input
          type="text"
          readOnly
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-gray-50 dark:bg-gray-800/50 dark:text-white text-sm cursor-not-allowed"
          value={formatCurrency(currentPayroll.netSalary)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('paymentDate')}
        </label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.paymentDate || ''}
          onChange={(e) => setCurrentPayroll({ ...currentPayroll, paymentDate: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('status')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white input-themed text-sm"
          value={currentPayroll.status || ''}
          onChange={(e) => setCurrentPayroll({ ...currentPayroll, status: e.target.value as PayrollType['status'] })}
        >
          <option value="">{t('selectStatus')}</option>
          <option value="pending">{t('statusPending')}</option>
          <option value="processed">{t('statusProcessed')}</option>
          <option value="paid">{t('statusPaid')}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('payroll')}</h1>
            <p className="text-sm text-gray-500">{t('managePayroll')}</p>
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
                setCurrentPayroll({ baseSalary: 0, bonus: 0, deductions: 0, netSalary: 0, status: 'pending' });
                setIsAddModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('addPayroll')}
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('name')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('department')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('month')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('baseSalary')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('netSalary')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('status')}
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
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><div className="skeleton h-4 w-16 rounded" /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="skeleton w-8 h-8 rounded-lg" />
                        <div className="skeleton w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingPayroll')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayrolls.map((payroll, index) => (
                  <motion.tr
                    key={payroll.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg avatar-container text-xs flex-shrink-0">
                          {payroll.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{payroll.employeeName}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{payroll.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{payroll.department}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{payroll.month}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(payroll.baseSalary)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(payroll.netSalary)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {getStatusBadge(payroll.status)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => { setCurrentPayroll(payroll); setIsDetailModalOpen(true); }}
                        >
                          <i className="fa-solid fa-eye text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => { setCurrentPayroll(payroll); setIsEditModalOpen(true); }}
                        >
                          <i className="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setDeleteTarget(payroll)}
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
      {!isLoading && filteredPayrolls.length > 0 && (
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
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredPayrolls.length)} {t('of')} {filteredPayrolls.length} {t('totalRecords')}
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
        {isDetailModalOpen && currentPayroll.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => { setIsDetailModalOpen(false); setCurrentPayroll({}); }}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('payrollDetails')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentPayroll({}); }}
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentPayroll.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('department')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentPayroll.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('position')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentPayroll.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('month')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentPayroll.month}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('status')}</p>
                        {currentPayroll.status && getStatusBadge(currentPayroll.status as PayrollType['status'])}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('salaryInfo')}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('baseSalary')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(currentPayroll.baseSalary)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('bonus')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(currentPayroll.bonus)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('deductions')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(currentPayroll.deductions)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('netSalary')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(currentPayroll.netSalary)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('paymentDate')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(currentPayroll.paymentDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsDetailModalOpen(false); setCurrentPayroll({}); }}
                >
                  {t('cancel')}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('addPayroll')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsAddModalOpen(false); setCurrentPayroll({}); }}
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
                  onClick={() => { setIsAddModalOpen(false); setCurrentPayroll({}); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={handleAdd}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('editPayroll')}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => { setIsEditModalOpen(false); setCurrentPayroll({}); }}
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
                  onClick={() => { setIsEditModalOpen(false); setCurrentPayroll({}); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2"
                  onClick={handleEdit}
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
                  {deleteTarget.employeeName} - {deleteTarget.month}
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
