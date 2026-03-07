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
  contactPerson: string;
  email: string;
  phone: string;
  block: string;
  unitNo: string;
  street: string;
  building: string;
  postalCode: string;
  country: string;
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
  invoiceNo: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
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
  receiptNo: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNo: string;
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
  avatar?: string;
  email: string;
  phone: string;
  effDate: string;
  expDate: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
  createdById?: number;
  modifiedById?: number;
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

// 发现页评论类型
export interface DiscoverComment {
  id: string;
  postId: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

// 发现页动态类型
export interface DiscoverPost {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  images: string[];
  likedBy: string[];
  comments: DiscoverComment[];
  createdAt: string;
}

// 薪资数据类型
export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'pending' | 'processed' | 'paid';
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
  contactPerson: [`张三`, `李四`, `王五`, `赵六`, `陈七`, `林八`, `黄九`, `周十`, `吴明`, `郑华`, `孙杰`, `马丽`, `刘洋`, `杨帆`, `朱伟`][i],
  email: `customer${i + 1}@example.com`,
  phone: `1390013900${i}`,
  block: `${100 + i}`,
  unitNo: `#${String(Math.floor(i / 3) + 1).padStart(2, '0')}-${String(i * 7 + 1).padStart(2, '0')}`,
  street: [`Orchard Road`, `Marina Bay`, `Raffles Place`, `Bugis Street`, `Clementi Ave`][i % 5],
  building: [`Tower ${i + 1}`, `Plaza ${i + 1}`, `Centre ${i + 1}`][i % 3],
  postalCode: `${String(100000 + i * 1111).slice(0, 6)}`,
  country: [`Singapore`, `Malaysia`, `China`, `Japan`, `Australia`][i % 5]
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
    invoiceNo: `INV-${String(i + 1).padStart(4, '0')}`,
    customerId: mockCustomers[i % mockCustomers.length].id,
    customerName: mockCustomers[i % mockCustomers.length].name,
    contactPerson: mockCustomers[i % mockCustomers.length].contactPerson,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items,
    totalAmount,
    status: ['draft', 'sent', 'paid', 'overdue'][i % 4] as Invoice['status']
  };
});

// 模拟收据数据
export const mockReceipts: Receipt[] = Array.from({ length: 15 }, (_, i) => {
  const inv = mockInvoices[i % mockInvoices.length];
  return {
    id: generateId(),
    receiptNo: `REC-${String(i + 1).padStart(4, '0')}`,
    customerId: mockCustomers[i % mockCustomers.length].id,
    customerName: mockCustomers[i % mockCustomers.length].name,
    invoiceId: inv.id,
    invoiceNo: inv.invoiceNo,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 50 + Math.random() * 4950,
    paymentMethod: ['现金', '支付宝', '微信支付', '银行卡'][i % 4],
    description: `购买商品 ${i + 1}`
  };
});

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
export const mockUsers: User[] = Array.from({ length: 5 }, (_, i) => {
  const effDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  const expDate = new Date(effDate.getTime() + (365 + Math.random() * 730) * 24 * 60 * 60 * 1000);
  return {
    id: generateId(),
    username: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `1350013500${i}`,
    effDate: effDate.toISOString().split('T')[0],
    expDate: expDate.toISOString().split('T')[0],
    status: i % 5 === 0 ? 'inactive' : 'active',
    createdBy: 'admin',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
});

// 模拟访问权限数据
export const mockAccessRights: AccessRight[] = [
  { id: generateId(), name: '创建用户', code: 'user.create', description: '创建新用户的权限', module: 'user', action: 'create', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '查看用户', code: 'user.read', description: '查看用户信息的权限', module: 'user', action: 'read', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '更新用户', code: 'user.update', description: '更新用户信息的权限', module: 'user', action: 'update', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '删除用户', code: 'user.delete', description: '删除用户的权限', module: 'user', action: 'delete', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: generateId(), name: '创建公司', code: 'company.create', description: '创建新公司的权限', module: 'company', action: 'create', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
];

// 模拟薪资数据
export const mockPayrolls: Payroll[] = Array.from({ length: 12 }, (_, i) => {
  const emp = mockEmployees[i % mockEmployees.length];
  const baseSalary = Math.round((8000 + Math.random() * 12000) * 100) / 100;
  const bonus = Math.round(Math.random() * 5000 * 100) / 100;
  const deductions = Math.round((500 + Math.random() * 2000) * 100) / 100;
  return {
    id: generateId(),
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    position: emp.position,
    month: `2025-${String((i % 12) + 1).padStart(2, '0')}`,
    baseSalary,
    bonus,
    deductions,
    netSalary: Math.round((baseSalary + bonus - deductions) * 100) / 100,
    paymentDate: new Date(2025, i % 12, 15 + Math.floor(Math.random() * 10)).toISOString().split('T')[0],
    status: (['pending', 'processed', 'paid'] as const)[i % 3]
  };
});

// 每日名言数据
export interface DailyQuote {
  text: string;
  author: string;
}

export const dailyQuotes: DailyQuote[] = [
  { text: '千里之行，始于足下。', author: '老子' },
  { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
  { text: '天行健，君子以自强不息。', author: '《周易》' },
  { text: '知之者不如好之者，好之者不如乐之者。', author: '孔子' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
  { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
  { text: '锲而不舍，金石可镂。', author: '荀子' },
  { text: '三人行，必有我师焉。', author: '孔子' },
  { text: '工欲善其事，必先利其器。', author: '孔子' },
  { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '《警世贤文》' },
  { text: '海内存知己，天涯若比邻。', author: '王勃' },
  { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
  { text: '天生我材必有用，千金散尽还复来。', author: '李白' },
  { text: '会当凌绝顶，一览众山小。', author: '杜甫' },
  { text: '读书破万卷，下笔如有神。', author: '杜甫' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
  { text: '博观而约取，厚积而薄发。', author: '苏轼' },
  { text: '老骥伏枥，志在千里；烈士暮年，壮心不已。', author: '曹操' },
  { text: '先天下之忧而忧，后天下之乐而乐。', author: '范仲淹' },
  { text: '世上无难事，只怕有心人。', author: '谚语' },
  { text: '己所不欲，勿施于人。', author: '孔子' },
  { text: '满招损，谦受益。', author: '《尚书》' },
  { text: '少壮不努力，老大徒伤悲。', author: '《长歌行》' },
  { text: '黑发不知勤学早，白首方悔读书迟。', author: '颜真卿' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Be the change that you wish to see in the world.', author: 'Mahatma Gandhi' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'What you get by achieving your goals is not as important as what you become.', author: 'Zig Ziglar' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Everything you have ever wanted is on the other side of fear.', author: 'George Addair' },
  { text: 'Opportunities don\'t happen, you create them.', author: 'Chris Grosser' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Your time is limited, don\'t waste it living someone else\'s life.', author: 'Steve Jobs' },
  { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
  { text: 'Dream big and dare to fail.', author: 'Norman Vaughan' },
  { text: 'What we achieve inwardly will change outer reality.', author: 'Plutarch' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: '谚语' },
];

// 根据日期和用户ID获取每日名言（确定性哈希）
export function getDailyQuote(userId: string): DailyQuote {
  const today = new Date().toISOString().split('T')[0];
  const seed = `${today}-${userId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % dailyQuotes.length;
  return dailyQuotes[index];
}

// 模拟发现页动态数据
export const mockDiscoverPosts: DiscoverPost[] = [
  {
    id: 'dp001',
    author: 'admin',
    content: '今天团队完成了新版CRM系统的第一个里程碑，大家辛苦了！接下来我们会继续优化用户体验，争取下个月正式上线。🎉',
    images: ['https://picsum.photos/seed/crm1/600/400'],
    likedBy: ['张三', '李四', '王五'],
    comments: [
      { id: 'dc001', postId: 'dp001', author: '张三', content: '太棒了，期待上线！', createdAt: '2025-03-15T10:30:00' },
      { id: 'dc002', postId: 'dp001', author: '李四', content: '辛苦大家了，继续加油💪', createdAt: '2025-03-15T11:00:00' }
    ],
    createdAt: '2025-03-15T09:00:00'
  },
  {
    id: 'dp002',
    author: '张三',
    content: '分享一下今天参加的行业峰会笔记：\n1. AI驱动的客户关系管理是未来趋势\n2. 数据安全合规越来越重要\n3. 移动端体验需要优先考虑',
    images: ['https://picsum.photos/seed/summit1/600/400', 'https://picsum.photos/seed/summit2/600/400'],
    likedBy: ['admin', '王五', '赵六', '陈七'],
    comments: [
      { id: 'dc003', postId: 'dp002', author: 'admin', content: '笔记很详细，感谢分享！', createdAt: '2025-03-14T15:20:00' }
    ],
    createdAt: '2025-03-14T14:00:00'
  },
  {
    id: 'dp003',
    author: '李四',
    content: '新的办公室装修完成啦！环境非常舒适，欢迎大家来参观。新的工位区域还配备了站立式办公桌。',
    images: ['https://picsum.photos/seed/office1/600/400', 'https://picsum.photos/seed/office2/600/400', 'https://picsum.photos/seed/office3/600/400'],
    likedBy: ['admin', '张三'],
    comments: [],
    createdAt: '2025-03-13T16:30:00'
  },
  {
    id: 'dp004',
    author: '王五',
    content: '本月销售数据出炉：相比上月增长了15%！特别感谢销售团队的努力，客户满意度也创下了新高。',
    images: [],
    likedBy: ['admin', '张三', '李四', '赵六', '陈七', '林八'],
    comments: [
      { id: 'dc004', postId: 'dp004', author: '赵六', content: '数据太漂亮了！', createdAt: '2025-03-12T10:00:00' },
      { id: 'dc005', postId: 'dp004', author: 'admin', content: '非常棒的成绩，继续保持！', createdAt: '2025-03-12T10:30:00' },
      { id: 'dc006', postId: 'dp004', author: '陈七', content: '下个月争取突破20%！', createdAt: '2025-03-12T11:15:00' }
    ],
    createdAt: '2025-03-12T09:00:00'
  },
  {
    id: 'dp005',
    author: '赵六',
    content: '推荐一个非常好用的项目管理方法论——OKR。我们团队已经实践了一个季度，效果显著：\n\n- 目标更加清晰\n- 团队协作效率提升30%\n- 每个人都能看到自己的贡献',
    images: [],
    likedBy: ['张三', '李四'],
    comments: [
      { id: 'dc007', postId: 'dp005', author: '张三', content: '我们部门也在考虑引入OKR，可以交流一下经验吗？', createdAt: '2025-03-11T14:00:00' }
    ],
    createdAt: '2025-03-11T11:00:00'
  },
  {
    id: 'dp006',
    author: 'admin',
    content: '公司年度团建活动照片来了！今年我们去了千岛湖，风景超美，大家玩得都很开心。期待明年的活动！',
    images: ['https://picsum.photos/seed/teamb1/600/400', 'https://picsum.photos/seed/teamb2/600/400'],
    likedBy: ['张三', '李四', '王五', '赵六', '陈七'],
    comments: [
      { id: 'dc008', postId: 'dp006', author: '李四', content: '玩得太开心了，明年还要去！', createdAt: '2025-03-10T18:00:00' },
      { id: 'dc009', postId: 'dp006', author: '王五', content: '照片拍得好棒！', createdAt: '2025-03-10T18:30:00' }
    ],
    createdAt: '2025-03-10T15:00:00'
  },
  {
    id: 'dp007',
    author: '陈七',
    content: '今天客户回访收到了很多正面反馈，客户对我们的售后服务非常满意。服务质量就是我们最好的名片！',
    images: [],
    likedBy: ['admin', '王五'],
    comments: [],
    createdAt: '2025-03-09T10:00:00'
  }
];