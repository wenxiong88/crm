import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { dashboardData } from '../services/mockData';

export default function Reports() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  
  // 主题颜色配置
  const getThemeColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      green: '#10b981',
      blueLight: '#93c5fd',
      purpleLight: '#c4b5fd',
      greenLight: '#6ee7b7'
    };
    return colorMap[colorName] || colorMap.blue;
  };
  
  const primaryColor = getThemeColor(themeColor);
  const secondaryColor = getThemeColor(`${themeColor}Light`);
  
  // 图表数据
  const salesData = [
    { name: '1月', revenue: 45000, expenses: 25000, profit: 20000 },
    { name: '2月', revenue: 52000, expenses: 28000, profit: 24000 },
    { name: '3月', revenue: 49000, expenses: 27000, profit: 22000 },
    { name: '4月', revenue: 63000, expenses: 32000, profit: 31000 },
    { name: '5月', revenue: 58000, expenses: 30000, profit: 28000 },
    { name: '6月', revenue: 71000, expenses: 35000, profit: 36000 },
    { name: '7月', revenue: 68000, expenses: 34000, profit: 34000 },
    { name: '8月', revenue: 75000, expenses: 38000, profit: 37000 },
    { name: '9月', revenue: 82000, expenses: 41000, profit: 41000 },
    { name: '10月', revenue: 79000, expenses: 39000, profit: 40000 },
    { name: '11月', revenue: 88000, expenses: 43000, profit: 45000 },
    { name: '12月', revenue: 94000, expenses: 46000, profit: 48000 }
  ];
  
  const customerSegmentData = [
    { name: '个人客户', value: 45 },
    { name: '小型企业', value: 30 },
    { name: '中型企业', value: 15 },
    { name: '大型企业', value: 10 }
  ];
  
  const performanceData = [
    { subject: '销售额', A: 90, B: 85, fullMark: 100 },
    { subject: '客户满意度', A: 80, B: 90, fullMark: 100 },
    { subject: '员工效率', A: 85, B: 75, fullMark: 100 },
    { subject: '成本控制', A: 70, B: 85, fullMark: 100 },
    { subject: '市场份额', A: 75, B: 70, fullMark: 100 },
    { subject: '项目完成率', A: 95, B: 80, fullMark: 100 }
  ];
  
  const COLORS = [primaryColor, secondaryColor, '#f59e0b', '#ef4444', '#06b6d4'];
  
  // 过滤数据根据选择的时间段
  const getFilteredData = () => {
    if (selectedPeriod === 'monthly') {
      return salesData.slice(-6); // 最近6个月
    } else if (selectedPeriod === 'quarterly') {
      // 模拟季度数据
      return [
        { name: 'Q1', revenue: 146000, expenses: 80000, profit: 66000 },
        { name: 'Q2', revenue: 192000, expenses: 97000, profit: 95000 },
        { name: 'Q3', revenue: 225000, expenses: 113000, profit: 112000 },
        { name: 'Q4', revenue: 261000, expenses: 128000, profit: 133000 }
      ];
    } else {
      return salesData; // 全年
    }
  };
  
  const filteredData = getFilteredData();
  
  // 计算总计
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = filteredData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = filteredData.reduce((sum, item) => sum + item.profit, 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('viewReports')}</p>
      </div>
      
      {/* 时间筛选器 */}
      <div className="flex flex-wrap items-center gap-3">
        {['monthly', 'quarterly', 'yearly'].map(period => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedPeriod === period
                ? `bg-${themeColor}-500 text-white`
                : 'bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#1f242d] hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedPeriod(period)}
          >
            {period === 'monthly' ? t('monthly') : period === 'quarterly' ? t('quarterly') : t('yearly')}
          </button>
        ))}
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{t('totalRevenue')}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">¥{totalRevenue.toLocaleString()}</span>
            <span className="ml-2 text-sm font-medium text-green-500">+12.5%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-[#161b22] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ width: '75%', backgroundColor: primaryColor }}
            ></div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{t('totalExpenses')}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">¥{totalExpenses.toLocaleString()}</span>
            <span className="ml-2 text-sm font-medium text-red-500">+5.3%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-[#161b22] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ width: '45%', backgroundColor: '#ef4444' }}
            ></div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{t('totalProfit')}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">¥{totalProfit.toLocaleString()}</span>
            <span className="ml-2 text-sm font-medium text-green-500">+18.7%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-[#161b22] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ width: '60%', backgroundColor: '#10b981' }}
            ></div>
          </div>
        </motion.div>
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收入支出图表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('revenueExpenseTrend')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }} 
                  formatter={(value) => [`¥${value}`, '']}
                />
                <Legend />
                <Bar dataKey="revenue" name={t('revenue')} fill={primaryColor} radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="expenses" name={t('expenses')} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="profit" name={t('profit')} fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* 客户分布图表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('customerDistribution')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {customerSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, t('percentage')]}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* 销售趋势图表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('salesTrend')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData.salesTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }} 
                  formatter={(value) => [`¥${value}`, t('sales')]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={primaryColor} 
                  strokeWidth={3}
                  dot={{ stroke: primaryColor, strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 8, stroke: primaryColor, strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* 绩效对比图表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('performanceComparison')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={performanceData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                <Radar name={t('thisYear')} dataKey="A" stroke={primaryColor} fill={primaryColor} fillOpacity={0.5} />
                <Radar name={t('lastYear')} dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      {/* 数据表格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-[#1f242d]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detailedData')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#161b22]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('period')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('revenue')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('expenses')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('profit')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('profitMargin')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0d1117] divide-y divide-gray-200 dark:divide-gray-800">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">¥{item.revenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">¥{item.expenses.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">¥{item.profit.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {(item.profit / item.revenue * 100).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-[#161b22] font-medium">
                <td className="px-6 py-4 whitespace-nowrap">{t('total')}</td>
                <td className="px-6 py-4 whitespace-nowrap">¥{totalRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">¥{totalExpenses.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 dark:text-green-400">¥{totalProfit.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(totalProfit / totalRevenue * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* 导出按钮 */}
      <div className="flex justify-center mt-8">
        <button
          className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center ${
            `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
          }`}
        >
          <i className="fa-solid fa-download mr-2"></i>
          {t('exportReport')}
        </button>
      </div>
    </div>
  );
}