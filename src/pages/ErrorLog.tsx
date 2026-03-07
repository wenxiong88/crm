import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';

interface ErrorLogEntry {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  module: string;
  message: string;
  detail: string;
  time: string;
}

const mockErrorLogs: ErrorLogEntry[] = [
  { id: '1', level: 'error', module: 'API Gateway', message: 'Connection timeout to database server', detail: 'SqlException: Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool.', time: '2026-03-08 09:15:02' },
  { id: '2', level: 'warning', module: 'Auth Service', message: 'Multiple failed login attempts detected', detail: 'User ID: 5, IP: 10.0.0.55, Attempts: 5 within 10 minutes', time: '2026-03-08 08:58:41' },
  { id: '3', level: 'critical', module: 'Payment Service', message: 'Payment gateway unreachable', detail: 'HttpRequestException: No connection could be made because the target machine actively refused it.', time: '2026-03-08 08:30:15' },
  { id: '4', level: 'error', module: 'File Service', message: 'Failed to upload attachment', detail: 'IOException: Disk quota exceeded. Available: 0 bytes, Required: 2.4MB', time: '2026-03-07 17:22:33' },
  { id: '5', level: 'warning', module: 'Email Service', message: 'Email delivery delayed', detail: 'SMTP server responded with 421: Too many concurrent connections', time: '2026-03-07 15:45:10' },
  { id: '6', level: 'info', module: 'Scheduler', message: 'Scheduled task skipped', detail: 'Task "DailyReport" skipped: previous instance still running', time: '2026-03-07 14:00:00' },
  { id: '7', level: 'error', module: 'User Service', message: 'Failed to update user profile', detail: 'ConcurrencyException: The record has been modified by another user', time: '2026-03-07 11:25:33' },
  { id: '8', level: 'warning', module: 'Cache Service', message: 'Cache miss rate exceeds threshold', detail: 'Current miss rate: 45%, Threshold: 30%, Duration: 15 minutes', time: '2026-03-07 10:10:05' },
  { id: '9', level: 'critical', module: 'Database', message: 'Replication lag detected', detail: 'Replica lag: 120 seconds, Threshold: 30 seconds, Primary: db-master-01', time: '2026-03-06 22:15:44' },
  { id: '10', level: 'info', module: 'System', message: 'Automatic backup completed', detail: 'Backup size: 2.3GB, Duration: 4m 32s, Target: /backups/2026-03-06/', time: '2026-03-06 03:00:45' },
];

const levelConfig: Record<string, { color: string; icon: string; bg: string }> = {
  info: { color: 'text-blue-700 dark:text-blue-400', icon: 'fa-circle-info', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  warning: { color: 'text-amber-700 dark:text-amber-400', icon: 'fa-triangle-exclamation', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  error: { color: 'text-red-700 dark:text-red-400', icon: 'fa-circle-xmark', bg: 'bg-red-50 dark:bg-red-900/30' },
  critical: { color: 'text-rose-700 dark:text-rose-400', icon: 'fa-skull-crossbones', bg: 'bg-rose-50 dark:bg-rose-900/30' },
};

export default function ErrorLog() {
  const { t } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockErrorLogs.filter(log => {
    const matchSearch =
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const levelLabel = (level: string) => {
    const map: Record<string, string> = { info: t('levelInfo'), warning: t('levelWarning'), error: t('levelError'), critical: t('levelCritical') };
    return map[level] || level;
  };

  return (
    <div className="space-y-3">
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('errorLog')}</h1>
            <p className="text-sm text-gray-500">{t('manageErrorLog')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <select
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 text-sm input-themed text-gray-900 dark:text-white"
              value={filterLevel}
              onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">{t('logLevel')}</option>
              <option value="info">{t('levelInfo')}</option>
              <option value="warning">{t('levelWarning')}</option>
              <option value="error">{t('levelError')}</option>
              <option value="critical">{t('levelCritical')}</option>
            </select>
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
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logLevel')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logModule')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logMessage')}</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logDetail')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 dark:text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMatchingLogs')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((log, index) => {
                  const cfg = levelConfig[log.level];
                  const isExpanded = expandedId === log.id;
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50/80 dark:bg-gray-800/30' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'}`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{log.time}</div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.color}`}>
                          <i className={`fa-solid ${cfg.icon} text-[9px]`}></i>
                          {levelLabel(log.level)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{log.module}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="text-sm text-gray-900 dark:text-white font-medium max-w-[320px]">
                          {log.message}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/30"
                            >
                              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all whitespace-pre-wrap">{log.detail}</code>
                            </motion.div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors mx-auto">
                          <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px]`}></i>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
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
