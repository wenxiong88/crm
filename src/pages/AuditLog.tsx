import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';

interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
  time: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  { id: '1', user: '张三', action: '更新', module: '用户管理', detail: '修改用户 李四 的邮箱', ip: '192.168.1.101', time: '2026-03-08 09:20:15' },
  { id: '2', user: '李四', action: '创建', module: '客户管理', detail: '新增客户 深圳科技有限公司', ip: '192.168.1.102', time: '2026-03-08 09:18:42' },
  { id: '3', user: '张三', action: '删除', module: '发票管理', detail: '删除发票 INV-2026-0045', ip: '192.168.1.101', time: '2026-03-08 08:55:30' },
  { id: '4', user: '赵六', action: '导出', module: '报表', detail: '导出月度销售报表', ip: '192.168.1.103', time: '2026-03-07 17:45:20' },
  { id: '5', user: '王五', action: '更新', module: '项目管理', detail: '修改项目 CRM升级 状态为已完成', ip: '10.0.0.55', time: '2026-03-07 16:30:11' },
  { id: '6', user: '陈七', action: '创建', module: '员工管理', detail: '新增员工 周八', ip: '192.168.1.108', time: '2026-03-07 14:10:05' },
  { id: '7', user: '张三', action: '更新', module: '权限管理', detail: '修改角色 编辑者 的权限配置', ip: '192.168.1.101', time: '2026-03-07 11:25:33' },
  { id: '8', user: '李四', action: '删除', module: '客户管理', detail: '删除客户 测试数据公司', ip: '192.168.1.102', time: '2026-03-06 16:40:22' },
  { id: '9', user: '赵六', action: '创建', module: '收据管理', detail: '新增收据 REC-2026-0088', ip: '192.168.1.103', time: '2026-03-06 15:20:18' },
  { id: '10', user: '王五', action: '更新', module: '公司管理', detail: '修改公司 总部 的地址信息', ip: '10.0.0.55', time: '2026-03-06 10:05:44' },
];

const actionColorMap: Record<string, string> = {
  '创建': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  '更新': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '删除': 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  '导出': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const actionIconMap: Record<string, string> = {
  '创建': 'fa-plus',
  '更新': 'fa-pen',
  '删除': 'fa-trash-can',
  '导出': 'fa-file-export',
};

export default function AuditLog() {
  const { t } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = mockAuditLogs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-3">
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('auditLog')}</h1>
            <p className="text-sm text-gray-500">{t('manageAuditLog')}</p>
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
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logModule')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logDetail')}</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('logIP')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
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
                        <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <i className="fa-solid fa-user text-violet-500 text-[10px]"></i>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${actionColorMap[log.action] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        <i className={`fa-solid ${actionIconMap[log.action] || 'fa-circle'} text-[9px]`}></i>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{log.module}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] truncate">{log.detail}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{log.ip}</div>
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
