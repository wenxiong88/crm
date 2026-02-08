import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { LanguageContext } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useContext(LanguageContext);

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm border border-blue-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('welcomeToSystem')}</h1>
          <p className="text-gray-600 text-lg mb-6">
            {t('systemDescription')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>{t('viewDashboard')}</span>
            </Link>
            <Link
              to="/customers"
              className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <i className="fa-solid fa-users"></i>
              <span>{t('manageCustomersShort')}</span>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-blue-600 mb-3">
              <i className="fa-solid fa-file-invoice text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('financialManagement')}</h3>
            <p className="text-gray-600 mb-4">{t('financialDescription')}</p>
            <Link
              to="/invoices"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>{t('viewDetails')}</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-green-600 mb-3">
              <i className="fa-solid fa-user-tie text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('employeeManagement')}</h3>
            <p className="text-gray-600 mb-4">{t('employeeDescription')}</p>
            <Link
              to="/employees"
              className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
            >
              <span>{t('viewDetails')}</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-purple-600 mb-3">
              <i className="fa-solid fa-cog text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('systemSettings')}</h3>
            <p className="text-gray-600 mb-4">{t('settingsDescription')}</p>
            <Link
              to="/settings"
              className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              <span>{t('viewDetails')}</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}