// 模拟数据服务

// 员工数据类型
export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  idType: 'idCard' | 'passport' | 'driverLicense' | 'other';
  idNo: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
}

// 顾客数据类型
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  lastPurchase: string;
  totalSpent: number;
}

// 供应商数据类型
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  since: string;
}

// 发票数据类型
export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

// 收据数据类型
export interface Receipt {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  description: string;
}

// 反馈数据类型
export interface Feedback {
  id: string;
  title: string;
  description: string;
  images: string[]; // 图片URL数组
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// 公司数据类型
export interface Company {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// 项目数据类型
export interface Project {
  id: string;
  code: string;
  name: string;
  companyId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'completed';
  description: string;
}

// 用户数据类型
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  companyId: string;
  companyName: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// 用户角色数据类型
export interface UserRole {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

// 访问权限数据类型
export interface AccessRight {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  action: string;
  createdAt: string;
}

// 生成随机ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 模拟员工数据
export const mockEmployees: Employee[] = Array.from({ length: 10 }, (_, i) => ({
  id: generateId(),
  name: `员工 ${i + 1}`,
  email: `employee${i + 1}@example.com`,
  phone: `1380013800${i}`,
  idType: (['idCard', 'passport', 'driverLicense', 'other'] as const)[i % 4],
  idNo: `${['110101', 'E00', 'D1234', 'X'][i % 4]}${String(19900101 + i * 111111).slice(0, 8)}${String(1000 + i).slice(1)}`,
  position: ['经理', '开发人员', '设计师', '销售', '客服'][i % 5],
  department: ['技术部', '市场部', '销售部', '行政部', '财务部'][i % 5],
  hireDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
  salary: Math.round((5000 + Math.random() * 15000) * 100) / 100
}));

// 模拟顾客数据
export const mockCustomers: Customer[] = Array.from({ length: 15 }, (_, i) => ({
  id: generateId(),
  name: `顾客 ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  phone: `1390013900${i}`,
  address: `北京市朝阳区某某街道${i + 1}号`,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  lastPurchase: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  totalSpent: 100 + Math.random() * 9900
}));

// 模拟供应商数据
export const mockSuppliers: Supplier[] = Array.from({ length: 8 }, (_, i) => ({
  id: generateId(),
  name: `供应商 ${i + 1}`,
  contactPerson: `联系人 ${i + 1}`,
  email: `supplier${i + 1}@example.com`,
  phone: `1370013700${i}`,
  address: `上海市浦东新区某某路${i + 1}号`,
  category: ['办公用品', '电子设备', '原材料', '服务'][i % 4],
  since: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0]
}));

// 模拟发票数据
export const mockInvoices: Invoice[] = Array.from({ length: 12 }, (_, i) => {
  const items = Array.from({ length: 1 + Math.floor(Math.random() * 4) }, (_, j) => ({
    id: generateId(),
    description: `商品 ${j + 1}`,
    quantity: 1 + Math.floor(Math.random() * 10),
    price: 100 + Math.random() * 900,
    amount: 0
  })).map(item => ({
    ...item,
    amount: item.quantity * item.price
  }));
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  
  return {
    id: generateId(),
    customerId: mockCustomers[i % mockCustomers.length].id,
    customerName: mockCustomers[i % mockCustomers.length].name,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items,
    totalAmount,
    status: ['draft', 'sent', 'paid', 'overdue'][i % 4] as Invoice['status']
  };
});

// 模拟收据数据
export const mockReceipts: Receipt[] = Array.from({ length: 15 }, (_, i) => ({
  id: generateId(),
  customerId: mockCustomers[i % mockCustomers.length].id,
  customerName: mockCustomers[i % mockCustomers.length].name,
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  amount: 50 + Math.random() * 4950,
  paymentMethod: ['现金', '支付宝', '微信支付', '银行卡'][i % 4],
  description: `购买商品 ${i + 1}`
}));

// 仪表板数据
export const dashboardData = {
  totalRevenue: 589000,
  newCustomers: 34,
  pendingInvoices: 7,
  totalExpenses: 324500,
  salesTrend: [
    { name: '1月', value: 45000 },
    { name: '2月', value: 52000 },
    { name: '3月', value: 49000 },
    { name: '4月', value: 63000 },
    { name: '5月', value: 58000 },
    { name: '6月', value: 71000 },
    { name: '7月', value: 68000 },
    { name: '8月', value: 75000 },
    { name: '9月', value: 82000 },
    { name: '10月', value: 79000 },
    { name: '11月', value: 88000 },
    { name: '12月', value: 94000 }
  ],
  topCustomers: [
    { name: '顾客 5', value: 12500 },
    { name: '顾客 8', value: 10200 },
    { name: '顾客 3', value: 9800 },
    { name: '顾客 12', value: 8700 },
    { name: '顾客 15', value: 7600 }
  ]
};

// 模拟反馈数据
export const mockFeedbacks: Feedback[] = [
  {
    id: 'fb001',
    title: '系统加载速度慢',
    description: '在访问报表页面时，数据加载需要较长时间，建议优化查询性能。',
    images: [],
    createdAt: '2024-01-15',
    status: 'reviewed'
  },
  {
    id: 'fb002',
    title: '建议增加导出功能',
    description: '希望可以导出客户列表为 Excel 文件，方便离线查看和分析。',
    images: [],
    createdAt: '2024-01-18',
    status: 'pending'
  },
  {
    id: 'fb003',
    title: '发票详情页面显示异常',
    description: '在查看发票详情时，图片无法正常显示，附上截图。',
    images: [],
    createdAt: '2024-01-20',
    status: 'resolved'
  }
];

// 模拟公司数据
export const mockCompanies: Company[] = Array.from({ length: 5 }, (_, i) => ({
  id: generateId(),
  code: `COM${String(i + 1).padStart(3, '0')}`,
  name: `公司 ${i + 1}`,
  address: `北京市海淀区某某街道${i + 1}号`,
  phone: `010-8888${String(i).padStart(4, '0')}`,
  email: `company${i + 1}@example.com`,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: i % 4 === 0 ? 'inactive' : 'active'
}));

// 模拟项目数据
export const mockProjects: Project[] = Array.from({ length: 5 }, (_, i) => ({
  id: generateId(),
  code: `PRJ${String(i + 1).padStart(3, '0')}`,
  name: `项目 ${i + 1}`,
  companyId: mockCompanies[i % mockCompanies.length].id,
  companyName: mockCompanies[i % mockCompanies.length].name,
  startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: (['active', 'inactive', 'completed'] as const)[i % 3],
  description: `这是项目 ${i + 1} 的描述信息`
}));

// 模拟用户角色数据
export const mockUserRoles: UserRole[] = [
  {
    id: 'role001',
    name: '系统管理员',
    code: 'ADMIN',
    description: '拥有系统所有权限',
    permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'company.create', 'company.read', 'company.update', 'company.delete'],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'role002',
    name: '项目经理',
    code: 'PM',
    description: '管理项目和团队成员',
    permissions: ['project.create', 'project.read', 'project.update', 'user.read'],
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'role003',
    name: '普通用户',
    code: 'USER',
    description: '基本查看权限',
    permissions: ['project.read', 'company.read'],
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'role004',
    name: '财务人员',
    code: 'FINANCE',
    description: '管理财务相关数据',
    permissions: ['invoice.create', 'invoice.read', 'invoice.update', 'receipt.create', 'receipt.read', 'receipt.update'],
    createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

// 模拟用户数据
export const mockUsers: User[] = Array.from({ length: 5 }, (_, i) => ({
  id: generateId(),
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `1350013500${i}`,
  companyId: mockCompanies[i % mockCompanies.length].id,
  companyName: mockCompanies[i % mockCompanies.length].name,
  roleId: mockUserRoles[i % mockUserRoles.length].id,
  roleName: mockUserRoles[i % mockUserRoles.length].name,
  status: i % 5 === 0 ? 'inactive' : 'active',
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}));

// 模拟访问权限数据
export const mockAccessRights: AccessRight[] = [
  { id: generateId(), name: '创建用户', code: 'user.create', description: '创建新用户的权限', module: 'user', action: 'create', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '查看用户', code: 'user.read', description: '查看用户信息的权限', module: 'user', action: 'read', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '更新用户', code: 'user.update', description: '更新用户信息的权限', module: 'user', action: 'update', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '删除用户', code: 'user.delete', description: '删除用户的权限', module: 'user', action: 'delete', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '创建公司', code: 'company.create', description: '创建新公司的权限', module: 'company', action: 'create', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
];