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
import User from "@/pages/User";
import UserRole from "@/pages/UserRole";
import AccessRight from "@/pages/AccessRight";

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
              <Route path="customers" element={<Customers />} />
              <Route path="master-data/suppliers" element={<Suppliers />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="receipts" element={<Receipts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="master-data/company" element={<Company />} />
              <Route path="master-data/project" element={<Project />} />
              <Route path="master-data/user" element={<User />} />
              <Route path="master-data/user-role" element={<UserRole />} />
              <Route path="master-data/access-right" element={<AccessRight />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </LanguageProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
