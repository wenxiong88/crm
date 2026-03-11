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
  mockChargeTypes,
  mockChargeCodes,
  mockMenuItems,
  mockModuleItems,
  mockMenuAccess,
  mockTransactionCodes,
  mockPayrolls,
  mockDiscoverPosts,
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
  AccessRight,
  ChargeType,
  ChargeCode,
  MenuItem,
  ModuleItem,
  MenuAccess,
  TransactionCode,
  Payroll,
  DiscoverPost,
  DiscoverComment
} from './mockData';

// API基础地址 - 只需修改这里即可切换后端
const API_BASE_URL = 'https://localhost:7215/api';

// Demo模式检测 - 读取localStorage
export const isDemoMode = (): boolean => {
  try {
    const val = localStorage.getItem('crm-demo-mode');
    return val === null ? true : val === 'true'; // 默认开启Demo
  } catch {
    return true;
  }
};

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
    if (!isDemoMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/Master/GetCustomerList`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pFilter: '' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('[CustomerAPI] GetCustomerList response:', json);
        const items = json.response_details || [];
        return items.map((item: any) => ({
          id: String(item.customerID ?? ''),
          name: item.custName ?? '',
          contactPerson: item.custContactPer ?? '',
          email: item.custEmail ?? '',
          phone: item.custHP ?? '',
          block: item.custBlock ?? '',
          unitNo: item.custUnitNo ?? '',
          street: item.custStreet ?? '',
          building: item.custBuilding ?? '',
          postalCode: item.custPostal ?? '',
          country: (() => {
            const raw = String(item.countryName ?? '').trim();
            const parts = raw.split(/[\s\-–]+/);
            // If first token is a 2-3 letter uppercase code (e.g. "SG"), drop it
            if (parts.length > 1 && /^[A-Z]{2,3}$/.test(parts[0])) return parts.slice(1).join(' ');
            return raw;
          })(),
          countryId: Number(item.custCountryID) || 0,
          status: item.isActive ? 'active' : 'inactive' as const,
        }));
      } catch (err) {
        console.warn('[CustomerAPI] GetCustomerList failed, falling back to mock data:', err);
      }
    }
    // Demo mode or API fallback
    await delay();
    return [...mockCustomers];
  },
  getCustomer: async (id: string): Promise<Customer | undefined> => {
    await delay();
    return mockCustomers.find(cus => cus.id === id);
  },
  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    if (!isDemoMode()) {
      const payload: any = {
        customerID: 0,
        custName: customer.name ?? '',
        custContactPer: customer.contactPerson ?? '',
        custEmail: customer.email ?? '',
        custHP: customer.phone ?? '',
        custBlock: customer.block ?? '',
        custUnitNo: customer.unitNo ?? '',
        custStreet: customer.street ?? '',
        custBuilding: customer.building ?? '',
        custPostal: customer.postalCode ?? '',
        custCountryID: Number(customer.countryId) || 0,
        country: customer.country ?? '',
        isActive: customer.status === 'active',
      };
      const res = await fetch(`${API_BASE_URL}/Master/SaveCustomer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[CustomerAPI] SaveCustomer response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Save failed');
      }
      const newId = json.response_details?.customerID ?? json.customerID ?? Math.random().toString(36).substr(2, 9);
      return { ...customer, id: String(newId) };
    }
    await delay();
    const newCustomer = {
      ...customer,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },
  updateCustomer: async (id: string, customer: Partial<Customer>): Promise<Customer | undefined> => {
    if (!isDemoMode()) {
      const payload: any = {
        customerID: Number(id) || 0,
        custName: customer.name ?? '',
        custContactPer: customer.contactPerson ?? '',
        custEmail: customer.email ?? '',
        custHP: customer.phone ?? '',
        custBlock: customer.block ?? '',
        custUnitNo: customer.unitNo ?? '',
        custStreet: customer.street ?? '',
        custBuilding: customer.building ?? '',
        custPostal: customer.postalCode ?? '',
        custCountryID: Number(customer.countryId) || 0,
        country: customer.country ?? '',
        isActive: customer.status === 'active',
      };
      const res = await fetch(`${API_BASE_URL}/Master/UpdateCustomer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[CustomerAPI] UpdateCustomer response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Update failed');
      }
      return { id, ...customer } as Customer;
    }
    await delay();
    const index = mockCustomers.findIndex(cus => cus.id === id);
    if (index !== -1) {
      mockCustomers[index] = { ...mockCustomers[index], ...customer };
      return mockCustomers[index];
    }
    return undefined;
  },
  deleteCustomer: async (id: string): Promise<boolean> => {
    if (!isDemoMode()) {
      const res = await fetch(`${API_BASE_URL}/Master/RemoveCustomer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerID: Number(id) || 0 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[CustomerAPI] RemoveCustomer response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Delete failed');
      }
      return true;
    }
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
    if (!isDemoMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/Master/GetCompanyList`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pFilter: '' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('[CompanyAPI] GetCompanyList response:', json);
        const items = json.response_details || [];
        return items.map((item: any) => ({
          id: String(item.companyID ?? ''),
          code: item.companyCode ?? '',
          name: item.companyName ?? '',
          registeredNo: item.companyRegNo ?? '',
          registeredDate: (item.companyRegDate ?? '').split('T')[0],
          contactPerson: item.companyContactPer ?? '',
          phone: item.companyHP ?? '',
          fax: item.companyFax ?? '',
          website: item.companyWebsite ?? '',
          email: item.companyEmail ?? '',
          block: item.companyBlock ?? '',
          unitNo: item.companyUnitNo ?? '',
          street: item.companyStreet ?? '',
          building: item.companyBuilding ?? '',
          postalCode: item.companyPostal ?? '',
          country: String(item.countryName ?? '').trim(),
          countryId: Number(item.companyCountryID) || 0,
          createdAt: (item.createdDate ?? '').split('T')[0],
          status: item.isActive ? 'active' : 'inactive' as const,
        }));
      } catch (err) {
        console.warn('[CompanyAPI] GetCompanyList failed, falling back to mock data:', err);
      }
    }
    await delay();
    return [...mockCompanies];
  },
  getCompany: async (id: string): Promise<Company | undefined> => {
    await delay();
    return mockCompanies.find(comp => comp.id === id);
  },
  createCompany: async (company: Omit<Company, 'id'>): Promise<Company> => {
    if (!isDemoMode()) {
      const payload: any = {
        companyID: 0,
        companyCode: company.code ?? '',
        companyName: company.name ?? '',
        companyRegNo: company.registeredNo ?? '',
        companyRegDate: company.registeredDate || null,
        companyContactPer: company.contactPerson ?? '',
        companyHP: company.phone ?? '',
        companyFax: company.fax ?? '',
        companyWebsite: company.website ?? '',
        companyEmail: company.email ?? '',
        companyBlock: company.block ?? '',
        companyUnitNo: company.unitNo ?? '',
        companyStreet: company.street ?? '',
        companyBuilding: company.building ?? '',
        companyPostal: company.postalCode ?? '',
        companyCountryID: Number((company as any).countryId) || 0,
        isActive: company.status === 'active',
      };
      const res = await fetch(`${API_BASE_URL}/Master/SaveCompany`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[CompanyAPI] SaveCompany response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Save failed');
      }
      const newId = json.response_details?.companyID ?? json.companyID ?? Math.random().toString(36).substr(2, 9);
      return { ...company, id: String(newId) };
    }
    await delay();
    const newCompany = {
      ...company,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockCompanies.push(newCompany);
    return newCompany;
  },
  updateCompany: async (id: string, company: Partial<Company>): Promise<Company | undefined> => {
    if (!isDemoMode()) {
      const payload: any = {
        companyID: Number(id) || 0,
        companyCode: company.code ?? '',
        companyName: company.name ?? '',
        companyRegNo: company.registeredNo ?? '',
        companyRegDate: company.registeredDate || null,
        companyContactPer: company.contactPerson ?? '',
        companyHP: company.phone ?? '',
        companyFax: company.fax ?? '',
        companyWebsite: company.website ?? '',
        companyEmail: company.email ?? '',
        companyBlock: company.block ?? '',
        companyUnitNo: company.unitNo ?? '',
        companyStreet: company.street ?? '',
        companyBuilding: company.building ?? '',
        companyPostal: company.postalCode ?? '',
        companyCountryID: Number((company as any).countryId) || 0,
        isActive: company.status === 'active',
      };
      const res = await fetch(`${API_BASE_URL}/Master/UpdateCompany`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[CompanyAPI] UpdateCompany response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Update failed');
      }
      return { id, ...company } as Company;
    }
    await delay();
    const index = mockCompanies.findIndex(comp => comp.id === id);
    if (index !== -1) {
      mockCompanies[index] = { ...mockCompanies[index], ...company };
      return mockCompanies[index];
    }
    return undefined;
  },
  deleteCompany: async (id: string): Promise<boolean> => {
    if (!isDemoMode()) {
      const res = await fetch(`${API_BASE_URL}/Master/RemoveCompany`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyID: Number(id) || 0 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[CompanyAPI] RemoveCompany response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Delete failed');
      }
      return true;
    }
    await delay();
    const index = mockCompanies.findIndex(comp => comp.id === id);
    if (index !== -1) {
      mockCompanies.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 国家API
export interface CountryOption {
  id: number;
  name: string;
}

export const countryAPI = {
  getCountries: async (): Promise<CountryOption[]> => {
    if (!isDemoMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/Master/GetCountryList`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pFilter: '' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('[CountryAPI] GetCountryList response:', json);
        const items = json.response_details || [];
        return items.map((item: any) => ({
          id: Number(item.countryID) || 0,
          name: String(item.countryName ?? '').trim(),
        }));
      } catch (err) {
        console.warn('[CountryAPI] GetCountryList failed, falling back to defaults:', err);
      }
    }
    // Fallback defaults
    return [
      { id: 1, name: 'Singapore' },
      { id: 2, name: 'Malaysia' },
      { id: 3, name: 'China' },
      { id: 4, name: 'Japan' },
      { id: 5, name: 'Australia' },
    ];
  },
};

// 项目API
export const projectAPI = {
  getProjects: async (): Promise<Project[]> => {
    if (!isDemoMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/Master/GetProjectList`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pFilter: '' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('[ProjectAPI] GetProjectList response:', json);
        const items = json.response_details || [];
        return items.map((item: any) => ({
          id: String(item.projectID ?? ''),
          code: item.projectCode ?? '',
          name: item.projectName ?? '',
          companyId: String(item.companyID ?? ''),
          companyName: item.companyName ?? '',
          startDate: (item.startDate ?? '').split('T')[0],
          endDate: (item.endDate ?? '').split('T')[0],
          status: item.isCompleted ? 'completed' : item.isActive ? 'active' : 'inactive' as const,
          description: item.description ?? '',
        }));
      } catch (err) {
        console.warn('[ProjectAPI] GetProjectList failed, falling back to mock data:', err);
      }
    }
    await delay();
    return [...mockProjects];
  },
  getProject: async (id: string): Promise<Project | undefined> => {
    await delay();
    return mockProjects.find(proj => proj.id === id);
  },
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    if (!isDemoMode()) {
      const payload: any = {
        projectID: 0,
        projectCode: project.code ?? '',
        projectName: project.name ?? '',
        companyID: Number(project.companyId) || 0,
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        description: project.description ?? '',
        isActive: project.status === 'active' || project.status === 'completed',
        isCompleted: project.status === 'completed',
      };
      const res = await fetch(`${API_BASE_URL}/Master/SaveProject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[ProjectAPI] SaveProject response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Save failed');
      }
      const newId = json.response_details?.projectID ?? json.projectID ?? Math.random().toString(36).substr(2, 9);
      return { ...project, id: String(newId) };
    }
    await delay();
    const newProject = {
      ...project,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockProjects.push(newProject);
    return newProject;
  },
  updateProject: async (id: string, project: Partial<Project>): Promise<Project | undefined> => {
    if (!isDemoMode()) {
      const payload: any = {
        projectID: Number(id) || 0,
        projectCode: project.code ?? '',
        projectName: project.name ?? '',
        companyID: Number(project.companyId) || 0,
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        description: project.description ?? '',
        isActive: project.status === 'active' || project.status === 'completed',
        isCompleted: project.status === 'completed',
      };
      const res = await fetch(`${API_BASE_URL}/Master/UpdateProject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[ProjectAPI] UpdateProject response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Update failed');
      }
      return { id, ...project } as Project;
    }
    await delay();
    const index = mockProjects.findIndex(proj => proj.id === id);
    if (index !== -1) {
      mockProjects[index] = { ...mockProjects[index], ...project };
      return mockProjects[index];
    }
    return undefined;
  },
  deleteProject: async (id: string): Promise<boolean> => {
    if (!isDemoMode()) {
      const res = await fetch(`${API_BASE_URL}/Master/RemoveProject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectID: Number(id) || 0 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[ProjectAPI] RemoveProject response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Delete failed');
      }
      return true;
    }
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
    if (isDemoMode()) {
      await delay();
      return [...mockUsers];
    }
    const res = await fetch(`${API_BASE_URL}/Master/GetUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pFilter: '' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const items = json.response_details || [];
    // 建立 userID → userName 映射，用于解析 createdBy
    const idNameMap: Record<number, string> = {};
    for (const item of items) {
      idNameMap[item.userID] = item.userName || '';
    }
    return items.map((item: any) => ({
      id: String(item.userID),
      username: item.userName || '',
      email: item.userEmail || '',
      phone: item.userHP || '',
      effDate: item.effDate?.split('T')[0] || '',
      expDate: item.expDate?.split('T')[0] || '',
      status: item.isActive ? 'active' : 'inactive' as const,
      createdBy: idNameMap[item.createdBy] || String(item.createdBy ?? ''),
      createdAt: item.createdDate?.split('T')[0] || '',
      modifiedBy: idNameMap[item.modifiedBy] || String(item.modifiedBy ?? ''),
      modifiedAt: item.modifiedDate?.split('T')[0] || '',
      createdById: item.createdBy ?? 0,
      modifiedById: item.modifiedBy ?? 0,
    }));
  },
  getUser: async (id: string): Promise<User | undefined> => {
    await delay();
    return mockUsers.find(user => user.id === id);
  },
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    if (isDemoMode()) {
      await delay();
      const newUser = {
        ...user,
        id: Math.random().toString(36).substr(2, 9)
      };
      mockUsers.push(newUser);
      return newUser;
    }
    const res = await fetch(`${API_BASE_URL}/Master/SaveUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: user.username || '',
        userEmail: user.email || '',
        userHP: user.phone || '',
        effDate: user.effDate || null,
        expDate: user.expDate || null,
        isActive: user.status === 'active',
        createdBy: user.createdById ?? 0,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const saved = json.response_details || json;
    return {
      id: String(saved.userID ?? saved.id ?? ''),
      username: saved.userName ?? user.username ?? '',
      email: saved.userEmail ?? user.email ?? '',
      phone: saved.userHP ?? user.phone ?? '',
      effDate: (saved.effDate ?? user.effDate ?? '').split('T')[0],
      expDate: (saved.expDate ?? user.expDate ?? '').split('T')[0],
      status: saved.isActive !== undefined ? (saved.isActive ? 'active' : 'inactive') : (user.status || 'active'),
      createdBy: String(saved.createdBy ?? ''),
      createdAt: (saved.createdDate ?? '').split('T')[0] || new Date().toISOString().split('T')[0],
    };
  },
  updateUser: async (id: string, user: Partial<User>): Promise<User | undefined> => {
    if (isDemoMode()) {
      await delay();
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...user };
        return mockUsers[index];
      }
      return undefined;
    }
    const payload = {
      userID: Number(id) || 0,
      userName: user.username || '',
      userEmail: user.email || '',
      userHP: user.phone || '',
      effDate: user.effDate || null,
      expDate: user.expDate || null,
      isActive: user.status === 'active',
      createdBy: user.createdById ?? 0,
      modifiedBy: user.modifiedById ?? 0,
    };
    const res = await fetch(`${API_BASE_URL}/Master/UpdateUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
      throw new Error(json.response_message || 'Update failed');
    }
    const saved = json.response_details || json;
    return {
      id: String(saved.userID ?? id),
      username: saved.userName ?? user.username ?? '',
      email: saved.userEmail ?? user.email ?? '',
      phone: saved.userHP ?? user.phone ?? '',
      effDate: (saved.effDate ?? user.effDate ?? '').split('T')[0],
      expDate: (saved.expDate ?? user.expDate ?? '').split('T')[0],
      status: saved.isActive !== undefined ? (saved.isActive ? 'active' : 'inactive') : (user.status || 'active'),
      createdBy: String(saved.createdBy ?? ''),
      createdAt: (saved.createdDate ?? user.createdAt ?? '').split('T')[0],
    };
  },
  deleteUser: async (id: string, modifiedById?: number): Promise<boolean> => {
    if (isDemoMode()) {
      await delay();
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
        return true;
      }
      return false;
    }
    const res = await fetch(`${API_BASE_URL}/Master/RemoveUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userID: Number(id) || 0,
        modifiedBy: modifiedById ?? 0,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
      throw new Error(json.response_message || 'Delete failed');
    }
    return true;
  }
};

// 菜单API
export const menuAPI = {
  getMenuItems: async (): Promise<MenuItem[]> => { await delay(); return [...mockMenuItems]; },
  createMenuItem: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => { await delay(); const n = { ...item, id: Math.random().toString(36).substr(2, 9) }; mockMenuItems.push(n); return n; },
  updateMenuItem: async (id: string, item: Partial<MenuItem>): Promise<MenuItem | undefined> => { await delay(); const i = mockMenuItems.findIndex(r => r.id === id); if (i !== -1) { mockMenuItems[i] = { ...mockMenuItems[i], ...item }; return mockMenuItems[i]; } return undefined; },
  deleteMenuItem: async (id: string): Promise<boolean> => { await delay(); const i = mockMenuItems.findIndex(r => r.id === id); if (i !== -1) { mockMenuItems.splice(i, 1); return true; } return false; },
};

// 模块API
export const moduleAPI = {
  getModuleItems: async (): Promise<ModuleItem[]> => { await delay(); return [...mockModuleItems]; },
  createModuleItem: async (item: Omit<ModuleItem, 'id'>): Promise<ModuleItem> => { await delay(); const n = { ...item, id: Math.random().toString(36).substr(2, 9) }; mockModuleItems.push(n); return n; },
  updateModuleItem: async (id: string, item: Partial<ModuleItem>): Promise<ModuleItem | undefined> => { await delay(); const i = mockModuleItems.findIndex(r => r.id === id); if (i !== -1) { mockModuleItems[i] = { ...mockModuleItems[i], ...item }; return mockModuleItems[i]; } return undefined; },
  deleteModuleItem: async (id: string): Promise<boolean> => { await delay(); const i = mockModuleItems.findIndex(r => r.id === id); if (i !== -1) { mockModuleItems.splice(i, 1); return true; } return false; },
};

// 菜单权限API
export const menuAccessAPI = {
  getMenuAccess: async (): Promise<MenuAccess[]> => { await delay(); return [...mockMenuAccess]; },
  createMenuAccess: async (item: Omit<MenuAccess, 'id'>): Promise<MenuAccess> => { await delay(); const n = { ...item, id: Math.random().toString(36).substr(2, 9) }; mockMenuAccess.push(n); return n; },
  updateMenuAccess: async (id: string, item: Partial<MenuAccess>): Promise<MenuAccess | undefined> => { await delay(); const i = mockMenuAccess.findIndex(r => r.id === id); if (i !== -1) { mockMenuAccess[i] = { ...mockMenuAccess[i], ...item }; return mockMenuAccess[i]; } return undefined; },
  deleteMenuAccess: async (id: string): Promise<boolean> => { await delay(); const i = mockMenuAccess.findIndex(r => r.id === id); if (i !== -1) { mockMenuAccess.splice(i, 1); return true; } return false; },
};

// 交易代码API
export const transactionCodeAPI = {
  getTransactionCodes: async (): Promise<TransactionCode[]> => { await delay(); return [...mockTransactionCodes]; },
  createTransactionCode: async (item: Omit<TransactionCode, 'id'>): Promise<TransactionCode> => { await delay(); const n = { ...item, id: Math.random().toString(36).substr(2, 9) }; mockTransactionCodes.push(n); return n; },
  updateTransactionCode: async (id: string, item: Partial<TransactionCode>): Promise<TransactionCode | undefined> => { await delay(); const i = mockTransactionCodes.findIndex(r => r.id === id); if (i !== -1) { mockTransactionCodes[i] = { ...mockTransactionCodes[i], ...item }; return mockTransactionCodes[i]; } return undefined; },
  deleteTransactionCode: async (id: string): Promise<boolean> => { await delay(); const i = mockTransactionCodes.findIndex(r => r.id === id); if (i !== -1) { mockTransactionCodes.splice(i, 1); return true; } return false; },
};

// 费用类型API
export const chargeTypeAPI = {
  getChargeTypes: async (): Promise<ChargeType[]> => {
    await delay();
    return [...mockChargeTypes];
  },
  createChargeType: async (ct: Omit<ChargeType, 'id'>): Promise<ChargeType> => {
    await delay();
    const newItem = { ...ct, id: Math.random().toString(36).substr(2, 9) };
    mockChargeTypes.push(newItem);
    return newItem;
  },
  updateChargeType: async (id: string, ct: Partial<ChargeType>): Promise<ChargeType | undefined> => {
    await delay();
    const index = mockChargeTypes.findIndex(r => r.id === id);
    if (index !== -1) { mockChargeTypes[index] = { ...mockChargeTypes[index], ...ct }; return mockChargeTypes[index]; }
    return undefined;
  },
  deleteChargeType: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockChargeTypes.findIndex(r => r.id === id);
    if (index !== -1) { mockChargeTypes.splice(index, 1); return true; }
    return false;
  }
};

// 费用代码API
export const chargeCodeAPI = {
  getChargeCodes: async (): Promise<ChargeCode[]> => {
    await delay();
    return [...mockChargeCodes];
  },
  createChargeCode: async (cc: Omit<ChargeCode, 'id'>): Promise<ChargeCode> => {
    await delay();
    const newItem = { ...cc, id: Math.random().toString(36).substr(2, 9) };
    mockChargeCodes.push(newItem);
    return newItem;
  },
  updateChargeCode: async (id: string, cc: Partial<ChargeCode>): Promise<ChargeCode | undefined> => {
    await delay();
    const index = mockChargeCodes.findIndex(r => r.id === id);
    if (index !== -1) { mockChargeCodes[index] = { ...mockChargeCodes[index], ...cc }; return mockChargeCodes[index]; }
    return undefined;
  },
  deleteChargeCode: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockChargeCodes.findIndex(r => r.id === id);
    if (index !== -1) { mockChargeCodes.splice(index, 1); return true; }
    return false;
  }
};

// 用户角色API
export const userRoleAPI = {
  getUserRoles: async (): Promise<UserRole[]> => {
    if (!isDemoMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/Master/GetRoleList`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pFilter: '' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('[RoleAPI] GetRoleList response:', json);
        const items = json.response_details || [];
        return items.map((item: any) => ({
          id: String(item.roleID ?? ''),
          code: item.roleCode ?? '',
          name: item.roleName ?? '',
          description: item.roleDesc ?? '',
          permissions: [],
          createdAt: (item.createdDate ?? '').split('T')[0],
          status: item.isActive ? 'active' : 'inactive' as const,
        }));
      } catch (err) {
        console.warn('[RoleAPI] GetRoleList failed, falling back to mock data:', err);
      }
    }
    await delay();
    return [...mockUserRoles];
  },
  getUserRole: async (id: string): Promise<UserRole | undefined> => {
    await delay();
    return mockUserRoles.find(role => role.id === id);
  },
  createUserRole: async (role: Omit<UserRole, 'id'>): Promise<UserRole> => {
    if (!isDemoMode()) {
      const payload: any = {
        roleID: 0,
        roleCode: role.code ?? '',
        roleName: role.name ?? '',
        roleDesc: role.description ?? '',
        isActive: (role as any).status === 'active',
      };
      const res = await fetch(`${API_BASE_URL}/Master/SaveRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[RoleAPI] SaveRole response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Save failed');
      }
      const newId = json.response_details?.roleID ?? json.roleID ?? Math.random().toString(36).substr(2, 9);
      return { ...role, id: String(newId) };
    }
    await delay();
    const newRole = {
      ...role,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockUserRoles.push(newRole);
    return newRole;
  },
  updateUserRole: async (id: string, role: Partial<UserRole>): Promise<UserRole | undefined> => {
    if (!isDemoMode()) {
      const payload: any = {
        roleID: Number(id) || 0,
        roleCode: role.code ?? '',
        roleName: role.name ?? '',
        roleDesc: role.description ?? '',
        isActive: (role as any).status === 'active',
      };
      const res = await fetch(`${API_BASE_URL}/Master/UpdateRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[RoleAPI] UpdateRole response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Update failed');
      }
      return { id, ...role } as UserRole;
    }
    await delay();
    const index = mockUserRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockUserRoles[index] = { ...mockUserRoles[index], ...role };
      return mockUserRoles[index];
    }
    return undefined;
  },
  deleteUserRole: async (id: string): Promise<boolean> => {
    if (!isDemoMode()) {
      const res = await fetch(`${API_BASE_URL}/Master/RemoveRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleID: Number(id) || 0 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('[RoleAPI] RemoveRole response:', json);
      if (json.response_code !== undefined && json.response_code !== 0 && json.response_code !== 200) {
        throw new Error(json.response_message || 'Delete failed');
      }
      return true;
    }
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

// 薪资API
export const payrollAPI = {
  getPayrolls: async (): Promise<Payroll[]> => {
    await delay();
    return [...mockPayrolls];
  },
  getPayroll: async (id: string): Promise<Payroll | undefined> => {
    await delay();
    return mockPayrolls.find(p => p.id === id);
  },
  createPayroll: async (payroll: Omit<Payroll, 'id'>): Promise<Payroll> => {
    await delay();
    const newPayroll = {
      ...payroll,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockPayrolls.push(newPayroll);
    return newPayroll;
  },
  updatePayroll: async (id: string, payroll: Partial<Payroll>): Promise<Payroll | undefined> => {
    await delay();
    const index = mockPayrolls.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPayrolls[index] = { ...mockPayrolls[index], ...payroll };
      return mockPayrolls[index];
    }
    return undefined;
  },
  deletePayroll: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockPayrolls.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPayrolls.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 发现页API
export const discoverAPI = {
  getPosts: async (): Promise<DiscoverPost[]> => {
    await delay();
    return [...mockDiscoverPosts].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  createPost: async (post: { author: string; content: string; images: string[] }): Promise<DiscoverPost> => {
    await delay();
    const newPost: DiscoverPost = {
      id: Math.random().toString(36).substr(2, 9),
      author: post.author,
      content: post.content,
      images: post.images,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    mockDiscoverPosts.unshift(newPost);
    return newPost;
  },
  deletePost: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockDiscoverPosts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockDiscoverPosts.splice(index, 1);
      return true;
    }
    return false;
  },
  toggleLike: async (postId: string, userId: string): Promise<DiscoverPost | undefined> => {
    await delay(200);
    const post = mockDiscoverPosts.find(p => p.id === postId);
    if (!post) return undefined;
    const idx = post.likedBy.indexOf(userId);
    if (idx !== -1) {
      post.likedBy.splice(idx, 1);
    } else {
      post.likedBy.push(userId);
    }
    return { ...post };
  },
  addComment: async (postId: string, comment: { author: string; content: string }): Promise<DiscoverComment | undefined> => {
    await delay(300);
    const post = mockDiscoverPosts.find(p => p.id === postId);
    if (!post) return undefined;
    const newComment: DiscoverComment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      author: comment.author,
      content: comment.content,
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    return newComment;
  }
};