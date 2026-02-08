import {
  mockEmployees,
  mockCustomers,
  mockSuppliers,
  mockInvoices,
  mockReceipts,
  mockFeedbacks,
  mockCompanies,
  mockProjects,
  mockUsers,
  mockUserRoles,
  mockAccessRights,
  Employee,
  Customer,
  Supplier,
  Invoice,
  Receipt,
  InvoiceItem,
  Feedback,
  Company,
  Project,
  User,
  UserRole,
  AccessRight
} from './mockData';

// 模拟API延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 员工API
export const employeeAPI = {
  getEmployees: async (): Promise<Employee[]> => {
    await delay();
    return [...mockEmployees];
  },
  getEmployee: async (id: string): Promise<Employee | undefined> => {
    await delay();
    return mockEmployees.find(emp => emp.id === id);
  },
  createEmployee: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    await delay();
    const newEmployee = {
      ...employee,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockEmployees.push(newEmployee);
    return newEmployee;
  },
  updateEmployee: async (id: string, employee: Partial<Employee>): Promise<Employee | undefined> => {
    await delay();
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...employee };
      return mockEmployees[index];
    }
    return undefined;
  },
  deleteEmployee: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 顾客API
export const customerAPI = {
  getCustomers: async (): Promise<Customer[]> => {
    await delay();
    return [...mockCustomers];
  },
  getCustomer: async (id: string): Promise<Customer | undefined> => {
    await delay();
    return mockCustomers.find(cus => cus.id === id);
  },
  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    await delay();
    const newCustomer = {
      ...customer,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },
  updateCustomer: async (id: string, customer: Partial<Customer>): Promise<Customer | undefined> => {
    await delay();
    const index = mockCustomers.findIndex(cus => cus.id === id);
    if (index !== -1) {
      mockCustomers[index] = { ...mockCustomers[index], ...customer };
      return mockCustomers[index];
    }
    return undefined;
  },
  deleteCustomer: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockCustomers.findIndex(cus => cus.id === id);
    if (index !== -1) {
      mockCustomers.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 供应商API
export const supplierAPI = {
  getSuppliers: async (): Promise<Supplier[]> => {
    await delay();
    return [...mockSuppliers];
  },
  getSupplier: async (id: string): Promise<Supplier | undefined> => {
    await delay();
    return mockSuppliers.find(sup => sup.id === id);
  },
  createSupplier: async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    await delay();
    const newSupplier = {
      ...supplier,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },
  updateSupplier: async (id: string, supplier: Partial<Supplier>): Promise<Supplier | undefined> => {
    await delay();
    const index = mockSuppliers.findIndex(sup => sup.id === id);
    if (index !== -1) {
      mockSuppliers[index] = { ...mockSuppliers[index], ...supplier };
      return mockSuppliers[index];
    }
    return undefined;
  },
  deleteSupplier: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockSuppliers.findIndex(sup => sup.id === id);
    if (index !== -1) {
      mockSuppliers.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 发票API
export const invoiceAPI = {
  getInvoices: async (): Promise<Invoice[]> => {
    await delay();
    return [...mockInvoices];
  },
  getInvoice: async (id: string): Promise<Invoice | undefined> => {
    await delay();
    return mockInvoices.find(inv => inv.id === id);
  },
  createInvoice: async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    await delay();
    const newInvoice = {
      ...invoice,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  },
  updateInvoice: async (id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined> => {
    await delay();
    const index = mockInvoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      mockInvoices[index] = { ...mockInvoices[index], ...invoice };
      return mockInvoices[index];
    }
    return undefined;
  },
  deleteInvoice: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockInvoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      mockInvoices.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 收据API
export const receiptAPI = {
  getReceipts: async (): Promise<Receipt[]> => {
    await delay();
    return [...mockReceipts];
  },
  getReceipt: async (id: string): Promise<Receipt | undefined> => {
    await delay();
    return mockReceipts.find(rec => rec.id === id);
  },
  createReceipt: async (receipt: Omit<Receipt, 'id'>): Promise<Receipt> => {
    await delay();
    const newReceipt = {
      ...receipt,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockReceipts.push(newReceipt);
    return newReceipt;
  },
  updateReceipt: async (id: string, receipt: Partial<Receipt>): Promise<Receipt | undefined> => {
    await delay();
    const index = mockReceipts.findIndex(rec => rec.id === id);
    if (index !== -1) {
      mockReceipts[index] = { ...mockReceipts[index], ...receipt };
      return mockReceipts[index];
    }
    return undefined;
  },
  deleteReceipt: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockReceipts.findIndex(rec => rec.id === id);
    if (index !== -1) {
      mockReceipts.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 反馈API
export const feedbackAPI = {
  getFeedbacks: async (): Promise<Feedback[]> => {
    await delay();
    return [...mockFeedbacks].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getFeedback: async (id: string): Promise<Feedback | undefined> => {
    await delay();
    return mockFeedbacks.find(fb => fb.id === id);
  },
  createFeedback: async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Promise<Feedback> => {
    await delay();
    const newFeedback: Feedback = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    mockFeedbacks.push(newFeedback);
    return newFeedback;
  },
  updateFeedback: async (id: string, feedback: Partial<Feedback>): Promise<Feedback | undefined> => {
    await delay();
    const index = mockFeedbacks.findIndex(fb => fb.id === id);
    if (index !== -1) {
      mockFeedbacks[index] = { ...mockFeedbacks[index], ...feedback };
      return mockFeedbacks[index];
    }
    return undefined;
  },
  deleteFeedback: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockFeedbacks.findIndex(fb => fb.id === id);
    if (index !== -1) {
      mockFeedbacks.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 公司API
export const companyAPI = {
  getCompanies: async (): Promise<Company[]> => {
    await delay();
    return [...mockCompanies];
  },
  getCompany: async (id: string): Promise<Company | undefined> => {
    await delay();
    return mockCompanies.find(comp => comp.id === id);
  },
  createCompany: async (company: Omit<Company, 'id'>): Promise<Company> => {
    await delay();
    const newCompany = {
      ...company,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockCompanies.push(newCompany);
    return newCompany;
  },
  updateCompany: async (id: string, company: Partial<Company>): Promise<Company | undefined> => {
    await delay();
    const index = mockCompanies.findIndex(comp => comp.id === id);
    if (index !== -1) {
      mockCompanies[index] = { ...mockCompanies[index], ...company };
      return mockCompanies[index];
    }
    return undefined;
  },
  deleteCompany: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockCompanies.findIndex(comp => comp.id === id);
    if (index !== -1) {
      mockCompanies.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 项目API
export const projectAPI = {
  getProjects: async (): Promise<Project[]> => {
    await delay();
    return [...mockProjects];
  },
  getProject: async (id: string): Promise<Project | undefined> => {
    await delay();
    return mockProjects.find(proj => proj.id === id);
  },
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    await delay();
    const newProject = {
      ...project,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockProjects.push(newProject);
    return newProject;
  },
  updateProject: async (id: string, project: Partial<Project>): Promise<Project | undefined> => {
    await delay();
    const index = mockProjects.findIndex(proj => proj.id === id);
    if (index !== -1) {
      mockProjects[index] = { ...mockProjects[index], ...project };
      return mockProjects[index];
    }
    return undefined;
  },
  deleteProject: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockProjects.findIndex(proj => proj.id === id);
    if (index !== -1) {
      mockProjects.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 用户API
export const userAPI = {
  getUsers: async (): Promise<User[]> => {
    await delay();
    return [...mockUsers];
  },
  getUser: async (id: string): Promise<User | undefined> => {
    await delay();
    return mockUsers.find(user => user.id === id);
  },
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    await delay();
    const newUser = {
      ...user,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockUsers.push(newUser);
    return newUser;
  },
  updateUser: async (id: string, user: Partial<User>): Promise<User | undefined> => {
    await delay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...user };
      return mockUsers[index];
    }
    return undefined;
  },
  deleteUser: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 用户角色API
export const userRoleAPI = {
  getUserRoles: async (): Promise<UserRole[]> => {
    await delay();
    return [...mockUserRoles];
  },
  getUserRole: async (id: string): Promise<UserRole | undefined> => {
    await delay();
    return mockUserRoles.find(role => role.id === id);
  },
  createUserRole: async (role: Omit<UserRole, 'id'>): Promise<UserRole> => {
    await delay();
    const newRole = {
      ...role,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockUserRoles.push(newRole);
    return newRole;
  },
  updateUserRole: async (id: string, role: Partial<UserRole>): Promise<UserRole | undefined> => {
    await delay();
    const index = mockUserRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockUserRoles[index] = { ...mockUserRoles[index], ...role };
      return mockUserRoles[index];
    }
    return undefined;
  },
  deleteUserRole: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockUserRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockUserRoles.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 访问权限API
export const accessRightAPI = {
  getAccessRights: async (): Promise<AccessRight[]> => {
    await delay();
    return [...mockAccessRights];
  },
  getAccessRight: async (id: string): Promise<AccessRight | undefined> => {
    await delay();
    return mockAccessRights.find(right => right.id === id);
  },
  createAccessRight: async (right: Omit<AccessRight, 'id'>): Promise<AccessRight> => {
    await delay();
    const newRight = {
      ...right,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockAccessRights.push(newRight);
    return newRight;
  },
  updateAccessRight: async (id: string, right: Partial<AccessRight>): Promise<AccessRight | undefined> => {
    await delay();
    const index = mockAccessRights.findIndex(r => r.id === id);
    if (index !== -1) {
      mockAccessRights[index] = { ...mockAccessRights[index], ...right };
      return mockAccessRights[index];
    }
    return undefined;
  },
  deleteAccessRight: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockAccessRights.findIndex(r => r.id === id);
    if (index !== -1) {
      mockAccessRights.splice(index, 1);
      return true;
    }
    return false;
  }
};