export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO";

export type CompanyRequest = {
  id: string;
  type: "company";
  companyName: string;
  sector: string;
  contactName: string;
  workEmail: string;
  phone: string;
  country: string;
  city: string;
  employeesCount: string;
  password: string;
  message: string;
  submittedAt: string;
  status: RequestStatus;
};

export type MerchantRequest = {
  id: string;
  type: "merchant";
  merchantName: string;
  category: string;
  contactName: string;
  workEmail: string;
  phone: string;
  country: string;
  city: string;
  branchesCount: string;
  password: string;
  message: string;
  submittedAt: string;
  status: RequestStatus;
};

export type EmployeeCountChangeStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type EmployeeCountChangeRequest = {
  id: string;
  companyId: string;
  companyName: string;
  currentEmployeesCount: string;
  requestedEmployeesCount: string;
  reason: string;
  requestedAt: string;
  status: EmployeeCountChangeStatus;
};

export type EmployeeRecord = {
  id: string;
  companyId: string;
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  position: string;
  transferAmount: string;
  walletBalance: string;
  createdAt: string;
};

export type FundingTransactionRecord = {
  id: string;
  companyId: string;
  companyName: string;
  employeeId: string;
  employeeName: string;
  amount: string;
  reason: string;
  previousBalance: string;
  newBalance: string;
  createdAt: string;
};

const COMPANY_REQUESTS_KEY = "lp_company_requests";
const MERCHANT_REQUESTS_KEY = "lp_merchant_requests";
const CURRENT_ENTERPRISE_KEY = "lp_current_enterprise";
const EMPLOYEE_COUNT_REQUESTS_KEY = "lp_employee_count_change_requests";
const EMPLOYEES_KEY = "lp_employees";
const FUNDING_TRANSACTIONS_KEY = "lp_funding_transactions";

function read<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/* =========================
   COMPANY REQUESTS
========================= */

export function getCompanyRequests(): CompanyRequest[] {
  return read<CompanyRequest>(COMPANY_REQUESTS_KEY);
}

export function createCompanyRequest(
  payload: Omit<CompanyRequest, "id" | "type" | "submittedAt" | "status">
) {
  const requests = getCompanyRequests();

  const newRequest: CompanyRequest = {
    id: generateId("COMP"),
    type: "company",
    ...payload,
    submittedAt: new Date().toISOString(),
    status: "PENDING",
  };

  write(COMPANY_REQUESTS_KEY, [newRequest, ...requests]);
  return newRequest;
}

export function updateCompanyRequestStatus(id: string, status: RequestStatus) {
  const updated = getCompanyRequests().map((item) =>
    item.id === id ? { ...item, status } : item
  );

  write(COMPANY_REQUESTS_KEY, updated);
  return updated;
}

export function getApprovedCompanies(): CompanyRequest[] {
  return getCompanyRequests().filter((company) => company.status === "APPROVED");
}

/* =========================
   MERCHANT REQUESTS
========================= */

export function getMerchantRequests(): MerchantRequest[] {
  return read<MerchantRequest>(MERCHANT_REQUESTS_KEY);
}

export function createMerchantRequest(
  payload: Omit<MerchantRequest, "id" | "type" | "submittedAt" | "status">
) {
  const requests = getMerchantRequests();

  const newRequest: MerchantRequest = {
    id: generateId("MERCH"),
    type: "merchant",
    ...payload,
    submittedAt: new Date().toISOString(),
    status: "PENDING",
  };

  write(MERCHANT_REQUESTS_KEY, [newRequest, ...requests]);
  return newRequest;
}

export function updateMerchantRequestStatus(id: string, status: RequestStatus) {
  const updated = getMerchantRequests().map((item) =>
    item.id === id ? { ...item, status } : item
  );

  write(MERCHANT_REQUESTS_KEY, updated);
  return updated;
}

/* =========================
   LOGIN CHECKS
========================= */

export function canCompanyLogin(email: string, password: string) {
  return getCompanyRequests().find(
    (item) =>
      item.workEmail.toLowerCase() === email.toLowerCase() &&
      item.password === password &&
      item.status === "APPROVED"
  );
}

export function canMerchantLogin(email: string, password: string) {
  return getMerchantRequests().find(
    (item) =>
      item.workEmail.toLowerCase() === email.toLowerCase() &&
      item.password === password &&
      item.status === "APPROVED"
  );
}

/* =========================
   CURRENT ENTERPRISE SESSION
========================= */

export function setCurrentEnterprise(company: CompanyRequest | null) {
  if (!company) {
    localStorage.removeItem(CURRENT_ENTERPRISE_KEY);
    return;
  }

  localStorage.setItem(CURRENT_ENTERPRISE_KEY, JSON.stringify(company));
}

export function getCurrentEnterprise(): CompanyRequest | null {
  const raw = localStorage.getItem(CURRENT_ENTERPRISE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CompanyRequest;
  } catch {
    return null;
  }
}

export function clearCurrentEnterprise() {
  localStorage.removeItem(CURRENT_ENTERPRISE_KEY);
}

/* =========================
   EMPLOYEE COUNT CHANGE REQUESTS
========================= */

export function getEmployeeCountChangeRequests(): EmployeeCountChangeRequest[] {
  return read<EmployeeCountChangeRequest>(EMPLOYEE_COUNT_REQUESTS_KEY);
}

export function createEmployeeCountChangeRequest(payload: {
  companyId: string;
  companyName: string;
  currentEmployeesCount: string;
  requestedEmployeesCount: string;
  reason: string;
}) {
  const requests = getEmployeeCountChangeRequests();

  const newRequest: EmployeeCountChangeRequest = {
    id: generateId("EMP-COUNT"),
    ...payload,
    requestedAt: new Date().toISOString(),
    status: "PENDING",
  };

  write(EMPLOYEE_COUNT_REQUESTS_KEY, [newRequest, ...requests]);
  return newRequest;
}

export function updateEmployeeCountChangeRequestStatus(
  id: string,
  status: EmployeeCountChangeStatus
) {
  const requests = getEmployeeCountChangeRequests();
  const request = requests.find((item) => item.id === id);

  const updatedRequests = requests.map((item) =>
    item.id === id ? { ...item, status } : item
  );

  write(EMPLOYEE_COUNT_REQUESTS_KEY, updatedRequests);

  if (request && status === "APPROVED") {
    const companies = getCompanyRequests().map((company) =>
      company.id === request.companyId
        ? { ...company, employeesCount: request.requestedEmployeesCount }
        : company
    );

    write(COMPANY_REQUESTS_KEY, companies);

    const current = getCurrentEnterprise();
    if (current && current.id === request.companyId) {
      const updatedCurrent =
        companies.find((company) => company.id === request.companyId) || null;
      setCurrentEnterprise(updatedCurrent);
    }
  }

  return updatedRequests;
}

export function getEmployeeCountRequestsByCompany(companyId: string) {
  return getEmployeeCountChangeRequests().filter(
    (item) => item.companyId === companyId
  );
}

/* =========================
   EMPLOYEES
========================= */

export function getEmployees(): EmployeeRecord[] {
  return read<EmployeeRecord>(EMPLOYEES_KEY);
}

export function getEmployeesByCompany(companyId: string): EmployeeRecord[] {
  return getEmployees().filter((item) => item.companyId === companyId);
}

export function createEmployee(
  payload: Omit<EmployeeRecord, "id" | "createdAt" | "walletBalance">
) {
  const employees = getEmployees();

  const newEmployee: EmployeeRecord = {
    id: generateId("EMP"),
    ...payload,
    walletBalance: payload.transferAmount,
    createdAt: new Date().toISOString(),
  };

  write(EMPLOYEES_KEY, [newEmployee, ...employees]);
  return newEmployee;
}

export function deleteEmployee(id: string) {
  const updated = getEmployees().filter((item) => item.id !== id);
  write(EMPLOYEES_KEY, updated);
  return updated;
}

/* =========================
   FUNDING TRANSACTIONS
========================= */

export function getFundingTransactions(): FundingTransactionRecord[] {
  return read<FundingTransactionRecord>(FUNDING_TRANSACTIONS_KEY);
}

export function getFundingTransactionsByCompany(companyId: string) {
  return getFundingTransactions().filter((item) => item.companyId === companyId);
}

export function getFundingTransactionsByEmployee(employeeId: string) {
  return getFundingTransactions().filter((item) => item.employeeId === employeeId);
}

export function createFundingTransaction(payload: {
  companyId: string;
  companyName: string;
  employeeId: string;
  amount: string;
  reason: string;
}) {
  const employees = getEmployees();
  const transactions = getFundingTransactions();

  const employee = employees.find((item) => item.id === payload.employeeId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const amountNumber = Number(payload.amount);

  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const previousBalance = Number(employee.walletBalance || 0);
  const newBalance = previousBalance + amountNumber;

  const updatedEmployees = employees.map((item) =>
    item.id === employee.id
      ? {
          ...item,
          walletBalance: String(newBalance),
          transferAmount: String(Number(item.transferAmount || 0) + amountNumber),
        }
      : item
  );

  write(EMPLOYEES_KEY, updatedEmployees);

  const newTransaction: FundingTransactionRecord = {
    id: generateId("FUND"),
    companyId: payload.companyId,
    companyName: payload.companyName,
    employeeId: employee.id,
    employeeName: employee.fullName,
    amount: String(amountNumber),
    reason: payload.reason,
    previousBalance: String(previousBalance),
    newBalance: String(newBalance),
    createdAt: new Date().toISOString(),
  };

  write(FUNDING_TRANSACTIONS_KEY, [newTransaction, ...transactions]);
  return newTransaction;
}