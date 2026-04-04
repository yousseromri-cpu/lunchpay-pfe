import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  BarChart3,
  Users,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

import {
  getCurrentEnterprise,
  createEmployeeCountChangeRequest,
  getEmployeeCountRequestsByCompany,
  getEmployeesByCompany,
} from "../../services/platformStore";
import type {
  CompanyRequest,
  EmployeeCountChangeRequest,
  EmployeeRecord,
} from "../../services/platformStore";

export default function Dashboard() {
  const [company, setCompany] = useState<CompanyRequest | null>(null);
  const [employeeRequests, setEmployeeRequests] = useState<
    EmployeeCountChangeRequest[]
  >([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [requestedEmployeesCount, setRequestedEmployeesCount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const currentCompany = getCurrentEnterprise();
    setCompany(currentCompany);

    if (currentCompany) {
      const requests = getEmployeeCountRequestsByCompany(currentCompany.id);
      setEmployeeRequests(requests);

      const companyEmployees = getEmployeesByCompany(currentCompany.id);
      setEmployees(companyEmployees);
    }
  }, []);

  function refreshDashboardData(companyId: string) {
    setEmployeeRequests(getEmployeeCountRequestsByCompany(companyId));
    setEmployees(getEmployeesByCompany(companyId));
  }

  function handleEmployeeCountRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!company) return;

    if (!requestedEmployeesCount.trim()) {
      alert("Please enter the requested employee count.");
      return;
    }

    createEmployeeCountChangeRequest({
      companyId: company.id,
      companyName: company.companyName,
      currentEmployeesCount: String(realEmployeesCount),
      requestedEmployeesCount,
      reason,
    });

    refreshDashboardData(company.id);

    setRequestedEmployeesCount("");
    setReason("");

    alert("Employee count change request submitted for admin review.");
  }

  const pendingCount = useMemo(
    () =>
      employeeRequests.filter(
        (request) => request.status?.toLowerCase() === "pending"
      ).length,
    [employeeRequests]
  );

  const approvedCount = useMemo(
    () =>
      employeeRequests.filter(
        (request) => request.status?.toLowerCase() === "approved"
      ).length,
    [employeeRequests]
  );

  const rejectedCount = useMemo(
    () =>
      employeeRequests.filter(
        (request) => request.status?.toLowerCase() === "rejected"
      ).length,
    [employeeRequests]
  );

  const realEmployeesCount = employees.length;

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

  const remainingSlots = useMemo(() => {
    if (!company) return 0;
    return Math.max(Number(company.employeesCount) - employees.length, 0);
  }, [company, employees]);

  if (!company) {
    return (
      <div style={pageStyle}>
        <div style={bgOrbOne} />
        <div style={bgOrbTwo} />

        <div
          className="premium-card"
          style={{
            ...panelStyle,
            maxWidth: "860px",
            margin: "0 auto",
            padding: "38px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={topGlowLine} />

          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: "12px",
            }}
          >
            Enterprise Dashboard
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              marginBottom: "14px",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            No enterprise session found
          </h1>

          <p
            style={{
              color: "var(--text-soft)",
              lineHeight: 1.8,
              maxWidth: "660px",
              fontSize: "1rem",
            }}
          >
            Please log in with an approved enterprise account to access your
            company workspace, employee management tools, and onboarding
            requests.
          </p>

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span style={softBadge}>Secure enterprise area</span>
            <span style={softBadge}>Admin-reviewed requests</span>
            <span style={softBadge}>Employee management</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={bgOrbOne} />
      <div style={bgOrbTwo} />

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
            gridTemplateColumns: "1.4fr 0.9fr",
            gap: "22px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                marginBottom: "12px",
              }}
            >
              Enterprise Dashboard
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 900,
                marginBottom: "12px",
                lineHeight: 1.05,
                color: "var(--text)",
              }}
            >
              Welcome, {company.companyName}
            </h1>

            <p
              style={{
                color: "var(--text-soft)",
                lineHeight: 1.8,
                maxWidth: "820px",
                marginBottom: "22px",
              }}
            >
              Manage your enterprise profile, review employee count requests,
              and keep your LunchPay onboarding information organized in one
              premium workspace.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link to="/enterprise/employees" className="btn-primary">
                Manage Employees
              </Link>

              <Link
                to="/enterprise/recommendations"
                className="btn-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={16} />
                Recommendation System
              </Link>

              <span style={statusPill(company.status)}>
                {company.status || "Unknown"}
              </span>
            </div>
          </div>

          <div
            className="glass-soft"
            style={{
              padding: "22px",
              borderRadius: "24px",
              minHeight: "190px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            }}
          >
            <div>
              <div style={smallMutedLabel}>Company snapshot</div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  color: "var(--text)",
                  lineHeight: 1,
                  marginBottom: "12px",
                }}
              >
                {realEmployeesCount}
              </div>
              <div style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                Real employees currently added to your company workspace.
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
              }}
            >
              <MiniMetric label="Pending" value={String(pendingCount)} />
              <MiniMetric label="Approved" value={String(approvedCount)} />
              <MiniMetric label="Rejected" value={String(rejectedCount)} />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <InfoCard
          label="Company name"
          value={company.companyName}
          icon={<Building2 size={18} strokeWidth={2.2} />}
          accent="primary"
        />
        <InfoCard
          label="Sector"
          value={company.sector}
          icon={<BarChart3 size={18} strokeWidth={2.2} />}
          accent="soft"
        />
        <InfoCard
          label="Current employees"
          value={String(realEmployeesCount)}
          icon={<Users size={18} strokeWidth={2.2} />}
          accent="primary"
        />
        <InfoCard
          label="Approval status"
          value={company.status}
          icon={<BadgeCheck size={18} strokeWidth={2.2} />}
          accent="soft"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <InsightCard
          title="Total requests"
          value={String(employeeRequests.length)}
          subtitle="Submitted employee count updates"
        />
        <InsightCard
          title="Total monthly transfer"
          value={`${totalTransfer} TND`}
          subtitle="Real transfer amount from employee records"
        />
        <InsightCard
          title="Average transfer"
          value={`${averageTransfer} TND`}
          subtitle="Average transfer per employee"
        />
        <InsightCard
          title="Remaining slots"
          value={String(remainingSlots)}
          subtitle="Available employee slots before quota limit"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: "18px",
          marginBottom: "22px",
        }}
      >
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
              <h2 style={sectionTitle}>Company profile</h2>
              <p style={sectionSubtitle}>
                Registered company identity and onboarding details.
              </p>
            </div>

            <span style={softBadge}>Verified workspace</span>
          </div>

          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            <Detail label="Contact person" value={company.contactName} />
            <Detail label="Work email" value={company.workEmail} />
            <Detail label="Phone" value={company.phone} />
            <Detail label="Country" value={company.country} />
            <Detail label="City" value={company.city} />
            <Detail
              label="Submitted at"
              value={formatDate(company.submittedAt)}
            />
          </div>

          <div
            style={{
              marginTop: "22px",
              padding: "16px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={smallMutedLabel}>Employees workspace</div>
              <div style={{ color: "var(--text-soft)" }}>
                Add, review and organize your employee data.
              </div>
            </div>

            <Link to="/enterprise/employees" className="btn-primary">
              Manage Employees
            </Link>
          </div>
        </div>

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
              <h2 style={sectionTitle}>Request employee count change</h2>
              <p style={sectionSubtitle}>
                Submit a formal update request for admin approval.
              </p>
            </div>

            <span style={softBadge}>Approval workflow</span>
          </div>

          <form
            onSubmit={handleEmployeeCountRequest}
            style={{ display: "grid", gap: "14px", marginTop: "18px" }}
          >
            <div>
              <label style={labelInput}>Current employee count</label>
              <input
                value={realEmployeesCount}
                disabled
                style={inputStyle(true)}
              />
            </div>

            <div>
              <label style={labelInput}>Requested employee count</label>
              <input
                type="number"
                min="1"
                placeholder="Enter the new employee count"
                value={requestedEmployeesCount}
                onChange={(e) => setRequestedEmployeesCount(e.target.value)}
                required
                style={inputStyle()}
              />
            </div>

            {requestedEmployeesCount.trim() && (
              <div style={livePreviewCard}>
                <div style={smallMutedLabel}>Live impact preview</div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    marginTop: "4px",
                  }}
                >
                  {Number(requestedEmployeesCount) > realEmployeesCount
                    ? `Increase of +${
                        Number(requestedEmployeesCount) - realEmployeesCount
                      } employees`
                    : Number(requestedEmployeesCount) < realEmployeesCount
                    ? `Decrease of ${
                        realEmployeesCount - Number(requestedEmployeesCount)
                      } employees`
                    : "No change detected"}
                </div>
              </div>
            )}

            <div>
              <label style={labelInput}>Reason for change</label>
              <textarea
                rows={4}
                placeholder="Explain why the employee count needs to be changed"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={textareaStyle}
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit request for approval
            </button>
          </form>
        </div>
      </div>

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
            <h2 style={sectionTitle}>Employee count change requests</h2>
            <p style={sectionSubtitle}>
              Track all submitted requests and their approval status.
            </p>
          </div>

          <span style={softBadge}>{employeeRequests.length} total</span>
        </div>

        {employeeRequests.length === 0 ? (
          <div
            style={{
              marginTop: "18px",
              padding: "28px",
              borderRadius: "22px",
              textAlign: "center",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-soft)",
            }}
          >
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              No requests submitted yet
            </div>
            <div>
              Once you submit an employee count change, it will appear here for
              tracking.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Request ID</th>
                  <th style={thStyle}>Current Count</th>
                  <th style={thStyle}>Requested Count</th>
                  <th style={thStyle}>Difference</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Requested At</th>
                </tr>
              </thead>

              <tbody>
                {employeeRequests
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.requestedAt).getTime() -
                      new Date(a.requestedAt).getTime()
                  )
                  .map((request, index) => {
                    const diff =
                      Number(request.requestedEmployeesCount) -
                      Number(request.currentEmployeesCount);

                    return (
                      <tr
                        key={request.id}
                        style={{
                          ...trStyle,
                          background:
                            index % 2 === 0
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td style={tdStyle}>
                          <span style={idBadge}>#{request.id}</span>
                        </td>
                        <td style={tdStyle}>{request.currentEmployeesCount}</td>
                        <td style={tdStyle}>{request.requestedEmployeesCount}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              ...variationBadge,
                              color:
                                diff > 0
                                  ? "#67e8b3"
                                  : diff < 0
                                  ? "#ff9a9a"
                                  : "var(--text-soft)",
                              border:
                                diff > 0
                                  ? "1px solid rgba(103,232,179,0.25)"
                                  : diff < 0
                                  ? "1px solid rgba(255,154,154,0.25)"
                                  : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, minWidth: "260px" }}>
                          {request.reason || "—"}
                        </td>
                        <td style={tdStyle}>
                          <span style={statusBadge(request.status)}>
                            {request.status}
                          </span>
                        </td>
                        <td style={tdStyle}>{formatDate(request.requestedAt)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: "0.74rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "var(--text)",
          fontWeight: 800,
          fontSize: "1.05rem",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div
      className="glass-soft"
      style={{
        padding: "20px",
        borderRadius: "22px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={smallMutedLabel}>{title}</div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 900,
          color: "var(--text)",
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div style={{ color: "var(--text-soft)", lineHeight: 1.6 }}>
        {subtitle}
      </div>
    </div>
  );
}

function InfoCard({
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
        ...cardStyle,
        position: "relative",
        overflow: "hidden",
        border:
          accent === "primary"
            ? "1px solid rgba(46, 211, 168, 0.18)"
            : "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          accent === "primary"
            ? "0 8px 30px rgba(46, 211, 168, 0.08)"
            : "0 8px 24px rgba(0,0,0,0.14)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            accent === "primary"
              ? "radial-gradient(circle at top right, rgba(46,211,168,0.12), transparent 45%)"
              : "radial-gradient(circle at top right, rgba(255,255,255,0.06), transparent 45%)",
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
          <div style={labelStyle}>{label}</div>
          <div style={valueStyle}>{value}</div>
        </div>

        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg, rgba(46,211,168,0.18), rgba(14,122,98,0.14))",
            border: "1px solid rgba(46,211,168,0.22)",
            color: "#2ED3A8",
            boxShadow:
              "0 0 0 1px rgba(46,211,168,0.08), 0 10px 24px rgba(46,211,168,0.12)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="glass-soft"
      style={{
        padding: "14px 16px",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "var(--text)",
          fontWeight: 700,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

function statusBadge(status: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "approved") {
    return {
      padding: "7px 12px",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 700,
      background: "rgba(76, 217, 153, 0.12)",
      color: "#6ce8b5",
      border: "1px solid rgba(76, 217, 153, 0.22)",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    } as React.CSSProperties;
  }

  if (normalized === "rejected") {
    return {
      padding: "7px 12px",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 700,
      background: "rgba(255, 107, 107, 0.12)",
      color: "#ff9c9c",
      border: "1px solid rgba(255, 107, 107, 0.22)",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    } as React.CSSProperties;
  }

  return {
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: 700,
    background: "rgba(255, 204, 102, 0.10)",
    color: "#ffd789",
    border: "1px solid rgba(255, 204, 102, 0.22)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  } as React.CSSProperties;
}

function statusPill(status: string) {
  return {
    ...statusBadge(status),
    backdropFilter: "blur(12px)",
  } as React.CSSProperties;
}

function inputStyle(disabled = false): React.CSSProperties {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: disabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.03)",
    color: "var(--text)",
    outline: "none",
    fontSize: "0.98rem",
    boxSizing: "border-box",
  };
}

const pageStyle: React.CSSProperties = {
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
  top: "340px",
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

const sectionTitle: React.CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 800,
  marginBottom: "6px",
  color: "var(--text)",
};

const sectionSubtitle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "22px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "8px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 800,
  color: "var(--text)",
  lineHeight: 1.3,
};

const smallMutedLabel: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "6px",
};

const labelInput: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 700,
  color: "var(--text)",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  color: "var(--text)",
  outline: "none",
  fontSize: "0.98rem",
  boxSizing: "border-box",
  resize: "vertical",
};

const softBadge: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text-soft)",
  fontSize: "0.82rem",
  fontWeight: 600,
};

const livePreviewCard: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: "18px",
  background:
    "linear-gradient(135deg, rgba(46,211,168,0.10), rgba(255,255,255,0.03))",
  border: "1px solid rgba(46,211,168,0.18)",
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
  verticalAlign: "top",
};

const trStyle: React.CSSProperties = {
  transition: "all 0.2s ease",
};

const idBadge: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 700,
};

const variationBadge: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "12px",
  fontWeight: 700,
  background: "rgba(255,255,255,0.04)",
};