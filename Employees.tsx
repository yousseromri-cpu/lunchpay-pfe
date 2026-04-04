import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Wallet,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  getCurrentEnterprise,
  getEmployeesByCompany,
  createEmployee,
  deleteEmployee,
  createEmployeeCountChangeRequest,
} from "../../services/platformStore";
import type {
  CompanyRequest,
  EmployeeRecord,
} from "../../services/platformStore";

type EmployeeForm = {
  fullName: string;
  phone: string;
  email: string;
  position: string;
  transferAmount: string;
};

type ImportedEmployeeRow = {
  fullName: string;
  phone: string;
  email: string;
  position: string;
  transferAmount: string;
};

const PAGE_SIZE = 6;

export default function Employees() {
  const [company, setCompany] = useState<CompanyRequest | null>(null);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [form, setForm] = useState<EmployeeForm>({
    fullName: "",
    phone: "",
    email: "",
    position: "",
    transferAmount: "",
  });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const currentCompany = getCurrentEnterprise();
    setCompany(currentCompany);

    if (currentCompany) {
      setEmployees(getEmployeesByCompany(currentCompany.id));
    }
  }, []);

  function refreshEmployees(companyId: string) {
    setEmployees(getEmployeesByCompany(companyId));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function emailAlreadyExists(email: string) {
    return employees.some(
      (employee) =>
        employee.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!company) return;

    if (employees.length >= Number(company.employeesCount)) {
      alert(
        `You have reached the maximum authorized employee count (${company.employeesCount}). Please submit a change request from the dashboard.`
      );
      return;
    }

    if (emailAlreadyExists(form.email)) {
      alert("An employee with this email already exists.");
      return;
    }

    createEmployee({
      companyId: company.id,
      companyName: company.companyName,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      transferAmount: form.transferAmount.trim(),
    });

    refreshEmployees(company.id);

    setForm({
      fullName: "",
      phone: "",
      email: "",
      position: "",
      transferAmount: "",
    });

    alert("Employee added successfully.");
  }

  function handleDelete(id: string) {
    deleteEmployee(id);
    if (company) {
      refreshEmployees(company.id);
    }
  }

  function handleOpenImport() {
    fileInputRef.current?.click();
  }

  function parseCSV(content: string): ImportedEmployeeRow[] {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const fullNameIndex = headers.indexOf("fullname");
    const phoneIndex = headers.indexOf("phone");
    const emailIndex = headers.indexOf("email");
    const positionIndex = headers.indexOf("position");
    const transferAmountIndex = headers.indexOf("transferamount");

    if (
      fullNameIndex === -1 ||
      phoneIndex === -1 ||
      emailIndex === -1 ||
      positionIndex === -1 ||
      transferAmountIndex === -1
    ) {
      throw new Error(
        "Invalid CSV format. Required columns: fullName, phone, email, position, transferAmount"
      );
    }

    const rows: ImportedEmployeeRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      const row: ImportedEmployeeRow = {
        fullName: values[fullNameIndex] || "",
        phone: values[phoneIndex] || "",
        email: values[emailIndex] || "",
        position: values[positionIndex] || "",
        transferAmount: values[transferAmountIndex] || "",
      };

      const isValid =
        row.fullName &&
        row.phone &&
        row.email &&
        row.position &&
        row.transferAmount;

      if (isValid) {
        rows.push(row);
      }
    }

    return rows;
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || "");
        const importedRows = parseCSV(text);

        if (importedRows.length === 0) {
          alert("No valid employee rows found in the CSV file.");
          return;
        }

        const currentEmployeesCount = employees.length;
        const authorizedEmployeesCount = Number(company.employeesCount);

        const existingEmails = new Set(
          employees.map((employee) => employee.email.trim().toLowerCase())
        );

        const uniqueImportedRows: ImportedEmployeeRow[] = [];
        const duplicateEmails: string[] = [];
        const seenImportEmails = new Set<string>();

        for (const row of importedRows) {
          const normalizedEmail = row.email.trim().toLowerCase();

          if (
            existingEmails.has(normalizedEmail) ||
            seenImportEmails.has(normalizedEmail)
          ) {
            duplicateEmails.push(row.email);
            continue;
          }

          seenImportEmails.add(normalizedEmail);
          uniqueImportedRows.push(row);
        }

        const finalCountAfterImport =
          currentEmployeesCount + uniqueImportedRows.length;

        if (finalCountAfterImport > authorizedEmployeesCount) {
          createEmployeeCountChangeRequest({
            companyId: company.id,
            companyName: company.companyName,
            currentEmployeesCount: String(company.employeesCount),
            requestedEmployeesCount: String(finalCountAfterImport),
            reason: `CSV import request: current system count is ${currentEmployeesCount}, imported file contains ${uniqueImportedRows.length} valid new employee(s), which would raise the total to ${finalCountAfterImport}. Approval is required before adding more employees.`,
          });

          alert(
            `Import blocked. The file would exceed the authorized employee count (${authorizedEmployeesCount}). A change request has been created automatically for ${finalCountAfterImport} employees.`
          );
          return;
        }

        uniqueImportedRows.forEach((row) => {
          createEmployee({
            companyId: company.id,
            companyName: company.companyName,
            fullName: row.fullName,
            phone: row.phone,
            email: row.email,
            position: row.position,
            transferAmount: row.transferAmount,
          });
        });

        refreshEmployees(company.id);

        let message = `${uniqueImportedRows.length} employee(s) imported successfully.`;

        if (duplicateEmails.length > 0) {
          message += ` ${duplicateEmails.length} duplicate email(s) were skipped.`;
        }

        alert(message);
      } catch (error) {
        console.error(error);
        alert("Import failed. Please check the CSV format.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsText(file);
  }

  function handleExportCSV() {
    if (!company) return;

    const rows = getEmployeesByCompany(company.id);

    if (rows.length === 0) {
      alert("There are no employees to export.");
      return;
    }

    const csvHeaders = [
      "fullName",
      "phone",
      "email",
      "position",
      "transferAmount",
    ];

    const csvRows = rows.map((employee) =>
      [
        employee.fullName,
        employee.phone,
        employee.email,
        employee.position,
        employee.transferAmount,
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${company.companyName.replace(/\s+/g, "_")}_employees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function handleDownloadTemplate() {
    const template =
      "fullName,phone,email,position,transferAmount\n" +
      "John Doe,+21612345678,john@company.com,HR Manager,300\n" +
      "Jane Smith,+21698765432,jane@company.com,Engineer,450";

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "employees_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const totalTransfer = useMemo(() => {
    return employees.reduce((sum, employee) => {
      const value = Number(employee.transferAmount) || 0;
      return sum + value;
    }, 0);
  }, [employees]);

  const averageTransfer = useMemo(() => {
    if (employees.length === 0) return 0;
    return Math.round(totalTransfer / employees.length);
  }, [employees, totalTransfer]);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return employees;

    return employees.filter((employee) => {
      return (
        employee.fullName.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword) ||
        employee.phone.toLowerCase().includes(keyword) ||
        employee.position.toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredEmployees.slice(start, end);
  }, [filteredEmployees, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, employees.length]);

  if (!company) {
    return (
      <div style={pageShell}>
        <div style={bgOrbOne} />
        <div style={bgOrbTwo} />

        <div
          className="premium-card"
          style={{
            ...panelStyle,
            padding: "36px",
            borderRadius: "30px",
            maxWidth: "820px",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={topGlowLine} />
          <div style={sectionEyebrow}>Employees Management</div>
          <h1 style={pageTitleStyle}>No enterprise session found</h1>
          <p style={pageTextStyle}>
            Please log in with an approved enterprise account to manage employees.
          </p>
        </div>
      </div>
    );
  }

  const authorizedCount = Number(company.employeesCount);
  const remainingSlots = Math.max(authorizedCount - employees.length, 0);
  const quotaUsage = authorizedCount > 0 ? Math.min((employees.length / authorizedCount) * 100, 100) : 0;
  const isQuotaFull = employees.length >= authorizedCount;
  const isQuotaNearLimit = quotaUsage >= 80 && quotaUsage < 100;

  return (
    <div style={pageShell}>
      <div style={bgOrbOne} />
      <div style={bgOrbTwo} />

      {/* HERO */}
      <div
        className="premium-card"
        style={{
          ...panelStyle,
          padding: "30px",
          marginBottom: "22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={topGlowLine} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.25fr 0.95fr",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={sectionEyebrow}>Employees Management</div>

            <h1
              style={{
                ...pageTitleStyle,
                marginBottom: "12px",
              }}
            >
              {company.companyName} Employees
            </h1>

            <p style={{ ...pageTextStyle, marginBottom: "22px" }}>
              Add, import, export and manage employee records in a premium workspace
              designed for enterprise control, quota monitoring and benefit allocation.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <ActionButton
                onClick={handleDownloadTemplate}
                icon={<FileSpreadsheet size={16} />}
                label="Download Template"
                variant="secondary"
              />

              <ActionButton
                onClick={handleOpenImport}
                icon={<Upload size={16} />}
                label="Import CSV"
                variant="secondary"
              />

              <ActionButton
                onClick={handleExportCSV}
                icon={<Download size={16} />}
                label="Export CSV"
                variant="secondary"
              />

              <Link to="/enterprise/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportFile}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div
            className="glass-soft"
            style={{
              padding: "24px",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "flex-start",
                marginBottom: "18px",
              }}
            >
              <div>
                <div style={smallMutedLabel}>Quota utilization</div>
                <div
                  style={{
                    fontSize: "2.4rem",
                    fontWeight: 900,
                    color: "var(--text)",
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}
                >
                  {Math.round(quotaUsage)}%
                </div>
                <div style={{ color: "var(--text-soft)", lineHeight: 1.6 }}>
                  {employees.length} of {authorizedCount} employee slots currently used.
                </div>
              </div>

              <div style={heroIconWrap}>
                <CircleGauge size={20} strokeWidth={2.2} />
              </div>
            </div>

            <div
              style={{
                height: "12px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${quotaUsage}%`,
                  borderRadius: "999px",
                  background: isQuotaFull
                    ? "linear-gradient(90deg, #ff6b6b, #ff8b8b)"
                    : isQuotaNearLimit
                    ? "linear-gradient(90deg, #f6c453, #ffd98a)"
                    : "linear-gradient(90deg, #2ED3A8, #68f0cb)",
                  boxShadow: isQuotaFull
                    ? "0 0 18px rgba(255,107,107,0.35)"
                    : "0 0 18px rgba(46,211,168,0.30)",
                  transition: "width 0.35s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span style={softBadge}>
                <Sparkles size={14} />
                {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} remaining
              </span>

              <span
                style={
                  isQuotaFull
                    ? alertPill("danger")
                    : isQuotaNearLimit
                    ? alertPill("warning")
                    : alertPill("success")
                }
              >
                {isQuotaFull
                  ? "Quota reached"
                  : isQuotaNearLimit
                  ? "Quota almost full"
                  : "Quota healthy"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <KpiCard
          label="Current employees"
          value={String(employees.length)}
          icon={<Users size={18} strokeWidth={2.2} />}
          accent="primary"
        />
        <KpiCard
          label="Authorized employees"
          value={String(company.employeesCount)}
          icon={<ShieldCheck size={18} strokeWidth={2.2} />}
          accent="soft"
        />
        <KpiCard
          label="Remaining slots"
          value={String(remainingSlots)}
          icon={<UserPlus size={18} strokeWidth={2.2} />}
          accent="primary"
        />
        <KpiCard
          label="Total monthly transfer"
          value={`${totalTransfer} TND`}
          icon={<Wallet size={18} strokeWidth={2.2} />}
          accent="soft"
        />
        <KpiCard
          label="Average transfer"
          value={`${averageTransfer} TND`}
          icon={<Building2 size={18} strokeWidth={2.2} />}
          accent="primary"
        />
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.92fr 1.08fr",
          gap: "18px",
          marginBottom: "20px",
        }}
      >
        {/* ADD EMPLOYEE */}
        <div
          className="premium-card"
          style={{
            ...panelStyle,
            padding: "24px",
            borderRadius: "28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={sectionAccentLine} />

          <div style={sectionHeaderRow}>
            <div>
              <h2 style={cardTitleStyle}>Add employee</h2>
              <p style={cardSubTitleStyle}>
                Create a new employee benefit profile with allocation details.
              </p>
            </div>

            <div style={heroIconWrap}>
              <UserPlus size={18} strokeWidth={2.2} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
            <div>
              <label style={labelInlineStyle}>Full name</label>
              <div style={inputWrap}>
                <Users size={16} style={inputIconStyle} />
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter employee full name"
                  required
                  style={enhancedInputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelInlineStyle}>Phone number</label>
              <div style={inputWrap}>
                <Phone size={16} style={inputIconStyle} />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+216..."
                  required
                  style={enhancedInputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelInlineStyle}>Email address</label>
              <div style={inputWrap}>
                <Mail size={16} style={inputIconStyle} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@company.com"
                  required
                  style={enhancedInputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelInlineStyle}>Job position</label>
              <div style={inputWrap}>
                <BriefcaseBusiness size={16} style={inputIconStyle} />
                <input
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="e.g. HR Manager, Engineer, Analyst"
                  required
                  style={enhancedInputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelInlineStyle}>Transfer amount</label>
              <div style={inputWrap}>
                <Wallet size={16} style={inputIconStyle} />
                <input
                  type="number"
                  min="0"
                  name="transferAmount"
                  value={form.transferAmount}
                  onChange={handleChange}
                  placeholder="e.g. 300"
                  required
                  style={enhancedInputStyle}
                />
              </div>
            </div>

            <div style={quotaCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                <div>
                  <div style={smallMutedLabel}>Quota status</div>
                  <div
                    style={{
                      color: "var(--text)",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {employees.length} / {company.employeesCount} used
                  </div>
                </div>

                <span
                  style={
                    isQuotaFull
                      ? alertPill("danger")
                      : isQuotaNearLimit
                      ? alertPill("warning")
                      : alertPill("success")
                  }
                >
                  {isQuotaFull
                    ? "Full"
                    : isQuotaNearLimit
                    ? "Near limit"
                    : "Available"}
                </span>
              </div>

              <div
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${quotaUsage}%`,
                    borderRadius: "999px",
                    background: isQuotaFull
                      ? "linear-gradient(90deg, #ff6b6b, #ff8b8b)"
                      : isQuotaNearLimit
                      ? "linear-gradient(90deg, #f6c453, #ffd98a)"
                      : "linear-gradient(90deg, #2ED3A8, #68f0cb)",
                  }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Add Employee
            </button>
          </form>
        </div>

        {/* EMPLOYEES TABLE */}
        <div
          className="premium-card"
          style={{
            ...panelStyle,
            padding: "24px",
            borderRadius: "28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={sectionAccentLine} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "14px",
              marginBottom: "18px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={cardTitleStyle}>Employees list</h2>
              <p style={cardSubTitleStyle}>
                Browse, search and manage all employee records.
              </p>
            </div>

            <div style={searchWrap}>
              <Search size={16} style={inputIconStyle} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone or position"
                style={{
                  ...enhancedInputStyle,
                  minWidth: "260px",
                  width: "320px",
                  background: "transparent",
                  border: "none",
                  padding: "0",
                }}
              />
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyStateIcon}>
                <Users size={22} strokeWidth={2.2} />
              </div>
              <div
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "8px",
                }}
              >
                No employee found
              </div>
              <div style={{ color: "var(--text-soft)", lineHeight: 1.7, maxWidth: "520px" }}>
                No employee matches your search, or no employee has been added yet.
                Start by creating a new employee profile or importing a CSV file.
              </div>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Employee</th>
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Position</th>
                      <th style={thStyle}>Transfer</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEmployees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        style={{
                          ...trStyle,
                          background:
                            index % 2 === 0
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>
                            <div style={avatarStyle}>
                              {getInitials(employee.fullName)}
                            </div>
                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 800 }}>
                                {employee.fullName}
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                Employee profile
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <div style={tdInlineStyle}>
                            <Phone size={14} />
                            <span>{employee.phone}</span>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <div style={tdInlineStyle}>
                            <Mail size={14} />
                            <span>{employee.email}</span>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <span style={roleBadge}>{employee.position}</span>
                        </td>

                        <td style={tdStyle}>
                          <span style={moneyBadge}>{employee.transferAmount} TND</span>
                        </td>

                        <td style={tdStyle}>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            style={deleteButtonStyle}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ color: "var(--text-soft)" }}>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of{" "}
                  {filteredEmployees.length} employee(s)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={navButtonStyle}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div
                    className="glass-soft"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "14px",
                      minWidth: "94px",
                      textAlign: "center",
                      color: "var(--text)",
                      fontWeight: 800,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    style={navButtonStyle}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  variant = "secondary",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "secondary";
}) {
  return (
    <button
      type="button"
      className={variant === "secondary" ? "btn-secondary" : "btn-primary"}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "primary" | "soft";
}) {
  return (
    <div
      className="glass-soft"
      style={{
        ...kpiCardStyle,
        border:
          accent === "primary"
            ? "1px solid rgba(46,211,168,0.18)"
            : "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          accent === "primary"
            ? "0 10px 26px rgba(46,211,168,0.08)"
            : "0 10px 24px rgba(0,0,0,0.14)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            accent === "primary"
              ? "radial-gradient(circle at top right, rgba(46,211,168,0.12), transparent 42%)"
              : "radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 42%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={kpiLabelStyle}>{label}</div>
          <div style={kpiValueStyle}>{value}</div>
        </div>

        <div style={kpiIconStyle}>{icon}</div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function alertPill(type: "success" | "warning" | "danger"): React.CSSProperties {
  if (type === "danger") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 700,
      background: "rgba(255,107,107,0.12)",
      color: "#ff9b9b",
      border: "1px solid rgba(255,107,107,0.2)",
    };
  }

  if (type === "warning") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 700,
      background: "rgba(246,196,83,0.12)",
      color: "#ffd88c",
      border: "1px solid rgba(246,196,83,0.22)",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: 700,
    background: "rgba(76,217,153,0.12)",
    color: "#74ecbe",
    border: "1px solid rgba(76,217,153,0.22)",
  };
}

const pageShell: React.CSSProperties = {
  padding: "32px",
  position: "relative",
};

const panelStyle: React.CSSProperties = {
  borderRadius: "30px",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.20)",
};

const bgOrbOne: React.CSSProperties = {
  position: "absolute",
  top: "20px",
  right: "8%",
  width: "260px",
  height: "260px",
  borderRadius: "999px",
  background: "radial-gradient(circle, rgba(46,211,168,0.10), transparent 68%)",
  filter: "blur(8px)",
  pointerEvents: "none",
};

const bgOrbTwo: React.CSSProperties = {
  position: "absolute",
  top: "360px",
  left: "4%",
  width: "220px",
  height: "220px",
  borderRadius: "999px",
  background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 68%)",
  filter: "blur(8px)",
  pointerEvents: "none",
};

const topGlowLine: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "1px",
  background:
    "linear-gradient(90deg, transparent, rgba(46,211,168,0.55), transparent)",
};

const sectionAccentLine: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 24,
  right: 24,
  height: "1px",
  background:
    "linear-gradient(90deg, rgba(46,211,168,0), rgba(46,211,168,0.5), rgba(46,211,168,0))",
};

const sectionHeaderRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
};

const sectionEyebrow: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  marginBottom: "10px",
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: "clamp(2rem, 4vw, 3rem)",
  fontWeight: 900,
  lineHeight: 1.06,
  color: "var(--text)",
};

const pageTextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.75,
  maxWidth: "780px",
};

const smallMutedLabel: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "6px",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "1.32rem",
  fontWeight: 800,
  marginBottom: "6px",
  color: "var(--text)",
};

const cardSubTitleStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
  margin: 0,
};

const heroIconWrap: React.CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  display: "grid",
  placeItems: "center",
  background:
    "linear-gradient(135deg, rgba(46,211,168,0.18), rgba(14,122,98,0.14))",
  border: "1px solid rgba(46,211,168,0.22)",
  color: "#2ED3A8",
  boxShadow: "0 0 0 1px rgba(46,211,168,0.08), 0 10px 24px rgba(46,211,168,0.12)",
  flexShrink: 0,
};

const softBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text-soft)",
  fontSize: "0.82rem",
  fontWeight: 600,
};

const kpiCardStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "20px",
  borderRadius: "22px",
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "8px",
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: "1.28rem",
  fontWeight: 800,
  color: "var(--text)",
  lineHeight: 1.3,
};

const kpiIconStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "16px",
  display: "grid",
  placeItems: "center",
  background:
    "linear-gradient(135deg, rgba(46,211,168,0.18), rgba(14,122,98,0.14))",
  border: "1px solid rgba(46,211,168,0.22)",
  color: "#2ED3A8",
  boxShadow: "0 0 0 1px rgba(46,211,168,0.08), 0 10px 24px rgba(46,211,168,0.12)",
  flexShrink: 0,
};

const labelInlineStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 700,
  color: "var(--text)",
};

const inputWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  padding: "0 14px",
  minHeight: "52px",
};

const inputIconStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  flexShrink: 0,
};

const enhancedInputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "52px",
  background: "transparent",
  border: "none",
  outline: "none",
  color: "var(--text)",
  fontSize: "0.98rem",
};

const quotaCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  background:
    "linear-gradient(135deg, rgba(46,211,168,0.08), rgba(255,255,255,0.03))",
  border: "1px solid rgba(46,211,168,0.16)",
};

const searchWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  padding: "0 14px",
  minHeight: "50px",
};

const emptyStateStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "34px 20px",
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  textAlign: "center",
  display: "grid",
  placeItems: "center",
};

const emptyStateIcon: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "18px",
  display: "grid",
  placeItems: "center",
  marginBottom: "14px",
  background:
    "linear-gradient(135deg, rgba(46,211,168,0.18), rgba(14,122,98,0.14))",
  border: "1px solid rgba(46,211,168,0.22)",
  color: "#2ED3A8",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 14px",
  color: "var(--text-muted)",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  color: "var(--text)",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  verticalAlign: "middle",
};

const trStyle: React.CSSProperties = {
  transition: "all 0.2s ease",
};

const tdInlineStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "var(--text-soft)",
};

const avatarStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  display: "grid",
  placeItems: "center",
  background:
    "linear-gradient(135deg, rgba(46,211,168,0.18), rgba(14,122,98,0.14))",
  border: "1px solid rgba(46,211,168,0.22)",
  color: "#84f4d2",
  fontWeight: 800,
  flexShrink: 0,
};

const roleBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text)",
  fontWeight: 700,
  fontSize: "0.86rem",
};

const moneyBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: "999px",
  border: "1px solid rgba(46,211,168,0.18)",
  background: "rgba(46,211,168,0.08)",
  color: "#7bf0ca",
  fontWeight: 800,
  fontSize: "0.86rem",
};

const navButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const deleteButtonStyle: React.CSSProperties = {
  minHeight: "38px",
  borderRadius: "12px",
  padding: "0 12px",
  color: "white",
  fontWeight: 700,
  background: "linear-gradient(135deg, #ff5c7a, #ff7a7a)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};