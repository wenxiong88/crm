import { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { dashboardData } from '../services/mockData';

export default function Dashboard() {
  const { t } = useContext(LanguageContext);
  const { themeColor, themeMode } = useContext(ThemeContext);

  const isDark = themeMode === 'dark';

  const themeColorMap: Record<string, { primary: string; secondary: string; border: string; gradient: [string, string] }> = {
    blue: { primary: '#6366f1', secondary: '#3b82f6', border: '#818cf8', gradient: ['#6366f1', '#3b82f6'] },
    purple: { primary: '#8b5cf6', secondary: '#ec4899', border: '#a78bfa', gradient: ['#8b5cf6', '#ec4899'] },
    green: { primary: '#14b8a6', secondary: '#10b981', border: '#2dd4bf', gradient: ['#14b8a6', '#10b981'] },
  };

  const colors = themeColorMap[themeColor] || themeColorMap.blue;
  const primaryColor = isDark ? colors.border : colors.primary;
  const secondaryColor = colors.secondary;

  const statsCards = [
    {
      title: t('totalRevenue'),
      value: '¥589,000',
      change: '+12.5%',
      isPositive: true,
      icon: 'fa-arrow-trend-up',
      iconBg: `${primaryColor}15`,
      iconColor: primaryColor,
      sparkData: [30, 40, 35, 50, 49, 60, 70, 65, 80],
    },
    {
      title: t('newCustomers'),
      value: '34',
      change: '+8.2%',
      isPositive: true,
      icon: 'fa-user-plus',
      iconBg: `${secondaryColor}15`,
      iconColor: secondaryColor,
      sparkData: [20, 25, 30, 22, 35, 40, 38, 45, 50],
    },
    {
      title: t('pendingInvoices'),
      value: '7',
      change: '-3.1%',
      isPositive: false,
      icon: 'fa-clock',
      iconBg: '#f59e0b15',
      iconColor: '#f59e0b',
      sparkData: [40, 35, 42, 38, 30, 28, 25, 22, 20],
    },
    {
      title: t('totalExpenses'),
      value: '¥324,500',
      change: '+5.3%',
      isPositive: false,
      icon: 'fa-wallet',
      iconBg: '#ef444415',
      iconColor: '#ef4444',
      sparkData: [25, 30, 28, 35, 40, 38, 42, 45, 48],
    }
  ];

  const COLORS = [primaryColor, secondaryColor, '#f59e0b', '#ef4444', '#06b6d4'];

  const gridColor = isDark ? '#1f2937' : '#f1f5f9';
  const textColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipBorder = isDark ? '#1f2937' : '#f1f5f9';

  const recentActivities = [
    { type: 'invoice', text: t('newCustomers'), detail: '李明 - ¥12,500', time: '5 min', color: '#10b981' },
    { type: 'customer', text: t('customers'), detail: '张华科技有限公司', time: '12 min', color: primaryColor },
    { type: 'payment', text: t('totalRevenue'), detail: '¥45,000', time: '1h', color: '#f59e0b' },
    { type: 'feedback', text: t('feedback'), detail: '5/5 - 王芳', time: '2h', color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('overview')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5 card-elevated group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1.5 text-gray-900 dark:text-white count-animate">{card.value}</h3>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: card.iconBg }}
              >
                <i className={`fa-solid ${card.icon} text-sm`} style={{ color: card.iconColor }}></i>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-8 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.sparkData.map((v, i) => ({ v, i }))}>
                  <defs>
                    <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.iconColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={card.iconColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.iconColor}
                    strokeWidth={1.5}
                    fill={`url(#spark-${index})`}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                card.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              }`}>
                <i className={`fa-solid ${card.isPositive ? 'fa-arrow-up' : 'fa-arrow-down'} text-[9px]`}></i>
                {card.change}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend - 2/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5 card-elevated"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('salesTrend')}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Monthly revenue overview</p>
            </div>
            <div className="flex gap-1">
              {['7D', '1M', '1Y'].map((period, idx) => (
                <button
                  key={period}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    idx === 1
                      ? 'text-white btn-gradient'
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.salesTrend}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: textColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    color: isDark ? '#e2e8f0' : undefined,
                    fontSize: 12,
                    padding: '8px 12px',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Customers - 1/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5 card-elevated"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('topCustomers')}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Revenue distribution</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.topCustomers}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {dashboardData.topCustomers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`¥${value}`, t('sales')]}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    color: isDark ? '#e2e8f0' : undefined,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-2">
            {dashboardData.topCustomers.slice(0, 4).map((customer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{customer.name}</span>
                </div>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">¥{customer.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5 card-elevated"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${activity.color}15` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activity.color }}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">{activity.detail}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{activity.text}</p>
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
