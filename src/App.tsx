import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/MainLayout';

// 页面组件
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import Invoices from "@/pages/Invoices";
import Receipts from "@/pages/Receipts";
import Reports from "@/pages/Reports";
import Feedback from "@/pages/Feedback";
import Settings from "@/pages/Settings";
import Company from "@/pages/Company";
import Project from "@/pages/Project";
import Role from "@/pages/Role";
import User from "@/pages/User";
import UserRole from "@/pages/UserRole";
import AccessRight from "@/pages/AccessRight";
import ChargeTypePage from "@/pages/ChargeType";
import ChargeCodePage from "@/pages/ChargeCode";
import MenuPage from "@/pages/Menu";
import ModulePage from "@/pages/Module";
import MenuAccessPage from "@/pages/MenuAccess";
import TransactionCodePage from "@/pages/TransactionCode";
import Payroll from "@/pages/Payroll";
import StickyNotes from "@/pages/StickyNotes";
import QuickAccess from "@/pages/QuickAccess";
import Discover from "@/pages/Discover";
import LoginLog from "@/pages/LoginLog";
import AuditLog from "@/pages/AuditLog";
import DataLog from "@/pages/DataLog";
import ErrorLog from "@/pages/ErrorLog";
import Prototype from "@/pages/Prototype";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 默认已登录，用于演示

  const logout = () => {
    setIsAuthenticated(false);
  };

  // 如果未登录，可以跳转到登录页面
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">请登录</h1>
          <button 
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            onClick={() => setIsAuthenticated(true)}
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="human-resources/employees" element={<Employees />} />
              <Route path="human-resources/payroll" element={<Payroll />} />
              <Route path="finance/invoices" element={<Invoices />} />
              <Route path="finance/receipts" element={<Receipts />} />
              <Route path="finance/reports" element={<Reports />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="administrator/customers" element={<Customers />} />
              <Route path="administrator/company" element={<Company />} />
              <Route path="administrator/project" element={<Project />} />
              <Route path="administrator/role" element={<Role />} />
              <Route path="administrator/user" element={<User />} />
              <Route path="administrator/user-role" element={<UserRole />} />
              <Route path="administrator/suppliers" element={<Suppliers />} />
              <Route path="administrator/menu" element={<MenuPage />} />
              <Route path="administrator/module" element={<ModulePage />} />
              <Route path="administrator/menu-access" element={<MenuAccessPage />} />
              <Route path="administrator/charge-type" element={<ChargeTypePage />} />
              <Route path="administrator/charge-code" element={<ChargeCodePage />} />
              <Route path="administrator/transaction-code" element={<TransactionCodePage />} />
              <Route path="administrator/access-right" element={<AccessRight />} />
              <Route path="personalization/sticky-notes" element={<StickyNotes />} />
              <Route path="personalization/quick-access" element={<QuickAccess />} />
              <Route path="discover" element={<Discover />} />
              <Route path="system-logs/login-log" element={<LoginLog />} />
              <Route path="system-logs/audit-log" element={<AuditLog />} />
              <Route path="system-logs/data-log" element={<DataLog />} />
              <Route path="system-logs/error-log" element={<ErrorLog />} />
              <Route path="prototype" element={<Prototype />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </LanguageProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
