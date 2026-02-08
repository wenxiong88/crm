import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast } from 'sonner';

export default function Settings() {
  const { t, language, setLanguage } = useContext(LanguageContext);
  const { themeColor, setThemeColor, themeMode, toggleThemeMode } = useContext(ThemeContext);
  
  // 表单状态
  const [formData, setFormData] = useState({
    siteName: '管理系统',
    showNotifications: true,
    autoSave: true,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'CNY',
    defaultPage: 'dashboard'
  });
  
  // 保存设置
  const handleSave = () => {
    // 在实际应用中，这里会将设置保存到后端或本地存储
    toast.success(t('settingsSaved'));
  };
  
  // 重置设置
  const handleReset = () => {
    setFormData({
      siteName: '管理系统',
      showNotifications: true,
      autoSave: true,
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'CNY',
      defaultPage: 'dashboard'
    });
    toast.info(t('settingsReset'));
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('customizeSettings')}</p>
      </div>
      
      {/* 主题设置卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i className="fa-solid fa-paint-brush mr-2 text-blue-500"></i>
          {t('appearanceSettings')}
        </h2>
        
        <div className="space-y-6">
          {/* 主题颜色 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('themeColor')}
            </label>
            <div className="flex space-x-3">
              {([
                { key: 'blue', color: '#6366f1' },
                { key: 'purple', color: '#8b5cf6' },
                { key: 'green', color: '#14b8a6' },
                { key: 'orange', color: '#f97316' },
                { key: 'rose', color: '#f43f5e' },
              ] as const).map(item => (
                <button
                  key={item.key}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                    themeColor === item.key
                      ? 'ring-4 ring-offset-2 ring-gray-200 dark:ring-gray-700 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.color }}
                  onClick={() => setThemeColor(item.key)}
                  aria-label={`Set ${item.key} theme`}
                >
                  {themeColor === item.key && (
                    <i className="fa-solid fa-check text-white text-lg"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* 明暗模式 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('darkMode')}
            </label>
            <button
              className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                themeMode === 'dark' 
                  ? 'bg-blue-500 justify-end' 
                  : 'bg-gray-300 justify-start'
              }`}
              onClick={toggleThemeMode}
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="w-4 h-4 rounded-full bg-white"></span>
            </button>
          </div>
          
          {/* 语言设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('language')}
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
            >
              <option value="zh">{t('chinese')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* 常规设置卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i className="fa-solid fa-cog mr-2 text-green-500"></i>
          {t('generalSettings')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 站点名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('siteName')}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            />
          </div>
          
          {/* 默认页面 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('defaultPage')}
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.defaultPage}
              onChange={(e) => setFormData({ ...formData, defaultPage: e.target.value })}
            >
              <option value="dashboard">{t('dashboard')}</option>
              <option value="employees">{t('employees')}</option>
              <option value="customers">{t('customers')}</option>
              <option value="invoices">{t('invoices')}</option>
              <option value="reports">{t('reports')}</option>
            </select>
          </div>
          
          {/* 日期格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('dateFormat')}
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.dateFormat}
              onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
          
          {/* 时间格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('timeFormat')}
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.timeFormat}
              onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
            >
              <option value="24h">{t('time24h')}</option>
              <option value="12h">{t('time12h')}</option>
            </select>
          </div>
          
          {/* 货币 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('currency')}
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="CNY">{t('cny')}</option>
              <option value="USD">{t('usd')}</option>
              <option value="EUR">{t('eur')}</option>
              <option value="GBP">{t('gbp')}</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* 通知设置卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i className="fa-solid fa-bell mr-2 text-amber-500"></i>
          {t('notificationSettings')}
        </h2>
        
        <div className="space-y-4">
          {/* 显示通知 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                {t('enableNotifications')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('notificationDescription')}
              </p>
            </div>
            <button
              className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                formData.showNotifications 
                  ? 'bg-blue-500 justify-end' 
                  : 'bg-gray-300 justify-start'
              }`}
              onClick={() => setFormData({ ...formData, showNotifications: !formData.showNotifications })}
            >
              <span className="w-4 h-4 rounded-full bg-white"></span>
            </button>
          </div>
          
          {/* 自动保存 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                {t('autoSave')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('autoSaveDescription')}
              </p>
            </div>
            <button
              className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                formData.autoSave 
                  ? 'bg-blue-500 justify-end' 
                  : 'bg-gray-300 justify-start'
              }`}
              onClick={() => setFormData({ ...formData, autoSave: !formData.autoSave })}
            >
              <span className="w-4 h-4 rounded-full bg-white"></span>
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button
          className="px-6 py-3 rounded-lg font-medium flex items-center justify-center border border-gray-300 dark:border-[#1f242d] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={handleReset}
        >
          <i className="fa-solid fa-undo mr-2"></i>
          {t('reset')}
        </button>
        
        <button
          className={`px-8 py-3 rounded-lg font-medium flex items-center justify-center ${
            `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white transition-colors`
          }`}
          onClick={handleSave}
        >
          <i className="fa-solid fa-save mr-2"></i>
          {t('saveSettings')}
        </button>
      </div>
    </div>
  );
}