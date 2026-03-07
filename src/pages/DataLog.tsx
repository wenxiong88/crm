import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';

interface DataLogEntry {
  id: string;
  user: string;
  action: string;
  table: string;
  recordId: string;
  field: string;
  oldValue: string;
  newValue: string;
  time: string;
}

const mockDataLogs: DataLogEntry[] = [
  { id: '1', user: '张三', action: '更新', table: 'User', recordId: '5', field: 'userName', oldValue: '李四', newValue: '李四（已更新）', time: '2026-03-08 09:20:15' },
  { id: '2', user: '张三', action: '更新', table: 'User', recordId: '5', field: 'userEmail', oldValue: 'lisi@old.com', newValue: 'lisi@new.com', time: '2026-03-08 09:20:15' },
  { id: '3', user: '李四', action: '插入', table: 'Customer', recordId: '28', field: '-', oldValue: '-', newValue: '深圳科技有限公司', time: '2026-03-08 09:18:42' },
  { id: '4', user: '张三', action: '删除', table: 'Invoice', recordId: '45', field: '-', oldValue: 'INV-2026-0045', newValue: '-', time: '2026-03-08 08:55:30' },
  { id: '5', user: '王五', action: '更新', table: 'Project', recordId: '12', field: 'status', oldValue: '进行中', newValue: '已完成', time: '2026-03-07 16:30:11' },
  { id: '6', user: '陈七', action: '插入', table: 'Employee', recordId: '33', field: '-', oldValue: '-', newValue: '周八', time: '2026-03-07 14:10:05' },
  { id: '7', user: '张三', action: '更新', table: 'UserRole', recordId: '3', field: 'permissions', oldValue: 'read,write', newValue: 'read,write,delete', time: '2026-03-07 11:25:33' },
  { id: '8', user: '赵六', action: '更新', table: 'Company', recordId: '1', field: 'address', oldValue: '北京市朝阳区', newValue: '北京市海淀区中关村', time: '2026-03-06 10:05:44' },
  { id: '9', user: '李四', action: '更新', table: 'Employee', recordId: '15', field: 'salary', oldValue: '15000', newValue: '18000', time: '2026-03-06 09:30:22' },
  { id: '10', user: '王五', action: '插入', table: 'Receipt', recordId: '88', field: '-', oldValue: '-', newValue: 'REC-2026-0088', time: '2026-03-05 15:20:18' },
];

const actionColorMap: Record<string, string> = {
  '插入': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  '更新': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '删除': 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function DataLog() {
  const { t } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = mockDataLogs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.oldValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.newValue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-3">
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dataLog')}</h1>
            <p className="text-sm text-gray-500">{t('manageDataLog')}</p>
          </div>
          <div className="mt-4 md:mt-0">
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
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logTime')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logUser')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logAction')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logTable')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logField')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logOldValue')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logNewValue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingLogs')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{log.time}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <i className="fa-solid fa-user text-teal-500 text-[10px]"></i>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${actionColorMap[log.action] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <i className="fa-solid fa-table text-[10px] text-gray-400"></i>
                        {log.table}
                        <span className="text-gray-400 dark:text-gray-600 text-xs">#{log.recordId}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{log.field}</code>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-red-500 dark:text-red-400 max-w-[150px] truncate line-through decoration-red-300/50">{log.oldValue}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 max-w-[150px] truncate">{log.newValue}</div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{t('rowsPerPage')}:</span>
            <select
              className="px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white input-themed text-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="ml-2">
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filtered.length)} {t('of')} {filtered.length} {t('totalRecords')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(1)} disabled={safePage === 1}><i className="fa-solid fa-angles-left"></i></button>
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><i className="fa-solid fa-chevron-left"></i></button>
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><i className="fa-solid fa-chevron-right"></i></button>
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors ${safePage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`} onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}><i className="fa-solid fa-angles-right"></i></button>
          </div>
        </div>
      )}
    </div>
  );
}
