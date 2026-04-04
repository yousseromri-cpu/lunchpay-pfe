import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  getCompanyRequests,
  getMerchantRequests,
  getApprovedCompanies,
  getEmployees,
  getEmployeeCountChangeRequests,
} from "../../services/platformStore";

const PIE_COLORS = ["#2ED3A8", "#7CE8CD", "#D6A94D", "#FF7A8F"];

type MetricAccent = "primary" | "neutral";

type TopMetric = {
  label: string;
  value: number;
  subtext: string;
  accent: MetricAccent;
};

export default function AdminDashboard() {
  const companyRequests = getCompanyRequests();
  const merchantRequests = getMerchantRequests();
  const approvedCompanies = getApprovedCompanies();
  const employees = getEmployees();
  const employeeCountRequests = getEmployeeCountChangeRequests();

  const pendingCompanyRequests = companyRequests.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approvedCompanyRequests = companyRequests.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejectedCompanyRequests = companyRequests.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const pendingMerchantRequests = merchantRequests.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approvedMerchants = merchantRequests.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejectedMerchants = merchantRequests.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const totalPendingRequests = pendingCompanyRequests + pendingMerchantRequests;
  const activeCompanies = approvedCompanies.length;
  const totalEmployees = employees.length;

  const pendingEmployeeCountRequests = employeeCountRequests.filter(
    (item) => item.status === "PENDING"
  ).length;

  const totalAllocatedAmount = employees.reduce((sum, employee) => {
    return sum + Number(employee.transferAmount || 0);
  }, 0);

  const averageAllocation =
    totalEmployees > 0 ? Math.round(totalAllocatedAmount / totalEmployees) : 0;

  const companyApprovalRate =
    companyRequests.length > 0
      ? Math.round((approvedCompanyRequests / companyRequests.length) * 100)
      : 0;

  const merchantApprovalRate =
    merchantRequests.length > 0
      ? Math.round((approvedMerchants / merchantRequests.length) * 100)
      : 0;

  const requestMixData = [
    { name: "Pending Companies", value: pendingCompanyRequests },
    { name: "Approved Companies", value: approvedCompanyRequests },
    { name: "Pending Merchants", value: pendingMerchantRequests },
    { name: "Approved Merchants", value: approvedMerchants },
  ].filter((item) => item.value > 0);

  const operationalBarsData = [
    { name: "Pending Company", value: pendingCompanyRequests },
    { name: "Pending Merchant", value: pendingMerchantRequests },
    { name: "Pending Employee Quota", value: pendingEmployeeCountRequests },
    { name: "Rejected Company", value: rejectedCompanyRequests },
    { name: "Rejected Merchant", value: rejectedMerchants },
  ];

  const trendAreaData = [
    { name: "Companies", count: approvedCompanyRequests },
    { name: "Merchants", count: approvedMerchants },
    { name: "Employees", count: totalEmployees },
    { name: "Quota Requests", count: employeeCountRequests.length },
  ];

  const topMetrics: TopMetric[] = [
    {
      label: "Pending Requests",
      value: totalPendingRequests,
      subtext: "Items needing admin review",
      accent: "primary",
    },
    {
      label: "Active Companies",
      value: activeCompanies,
      subtext: "Approved enterprise accounts",
      accent: "neutral",
    },
    {
      label: "Approved Merchants",
      value: approvedMerchants,
      subtext: "Approved merchant accounts",
      accent: "neutral",
    },
    {
      label: "Total Employees",
      value: totalEmployees,
      subtext: "Employee records in the platform",
      accent: "neutral",
    },
  ];

  return (
    <div style={pageStyle}>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="premium-card"
        style={heroCardStyle}
      >
        <div style={heroGridStyle}>
          <div>
            <div style={eyebrowStyle}>Admin · Executive Overview</div>
            <h1 style={heroTitleStyle}>LunchPay Control Center</h1>
            <p style={heroTextStyle}>
              Monitor onboarding activity, platform growth, employee allocation
              footprint and operational pressure points from one executive dashboard.
            </p>

            <div style={heroHighlightsStyle}>
              <HeroBadge text={`${totalPendingRequests} requests awaiting action`} />
              <HeroBadge text={`${companyApprovalRate}% company approval rate`} />
              <HeroBadge text={`${merchantApprovalRate}% merchant approval rate`} />
            </div>
          </div>

          <div className="glass-soft" style={heroInsightBoxStyle}>
            <div style={miniEyebrowStyle}>Platform snapshot</div>
            <div style={heroInsightNumberStyle}>
              {totalAllocatedAmount.toFixed(0)} DT
            </div>
            <div style={heroInsightTextStyle}>
              Total employee allocation currently managed by the platform
            </div>

            <div style={heroMiniStatsGridStyle}>
              <MiniSnapshot label="Avg allocation" value={`${averageAllocation} DT`} />
              <MiniSnapshot
                label="Quota requests"
                value={String(pendingEmployeeCountRequests)}
              />
              <MiniSnapshot label="Active companies" value={String(activeCompanies)} />
              <MiniSnapshot label="Merchants" value={String(approvedMerchants)} />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={statsGridStyle}
      >
        {topMetrics.map((metric) => (
          <AnimatedCard key={metric.label}>
            <KpiCard
              label={metric.label}
              value={metric.value}
              subtext={metric.subtext}
              accent={metric.accent}
            />
          </AnimatedCard>
        ))}
      </motion.div>

      <div className="admin-dashboard-main-grid" style={mainGridStyle}>
        <div style={{ display: "grid", gap: "18px" }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Back-office Priorities</h3>
              <span style={sectionMetaStyle}>Operational focus</span>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <PriorityCard
                title="Company requests"
                value={pendingCompanyRequests}
                description="Enterprise onboarding requests currently awaiting review."
              />
              <PriorityCard
                title="Merchant requests"
                value={pendingMerchantRequests}
                description="Merchant applications waiting for admin decision."
              />
              <PriorityCard
                title="Employee quota requests"
                value={pendingEmployeeCountRequests}
                description="Employee count change requests pending admin action."
              />
              <PriorityCard
                title="Employee records"
                value={totalEmployees}
                description="Registered employee records currently active across approved companies."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Approval Health</h3>
              <span style={sectionMetaStyle}>Platform performance</span>
            </div>

            <div style={healthGridStyle}>
              <HealthCard
                title="Company approval rate"
                value={`${companyApprovalRate}%`}
                description={`${approvedCompanyRequests} approved out of ${companyRequests.length || 0} total company requests.`}
              />
              <HealthCard
                title="Merchant approval rate"
                value={`${merchantApprovalRate}%`}
                description={`${approvedMerchants} approved out of ${merchantRequests.length || 0} total merchant requests.`}
              />
            </div>

            <div style={{ marginTop: "18px", height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={operationalBarsData}
                  margin={{ top: 8, right: 10, left: -10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(233,225,211,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text-soft)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-8}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-soft)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Bar
                    dataKey="value"
                    radius={[12, 12, 4, 4]}
                    fill="url(#dashboardBarGradient)"
                    barSize={36}
                  />
                  <defs>
                    <linearGradient id="dashboardBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-soft)" />
                      <stop offset="100%" stopColor="var(--accent-main)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Request Mix</h3>
              <span style={sectionMetaStyle}>Portfolio composition</span>
            </div>

            <div style={{ position: "relative", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestMixData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth={2}
                  >
                    {requestMixData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PremiumTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <CenterLabel
                title="Total tracked"
                value={String(
                  requestMixData.reduce((sum, item) => sum + item.value, 0)
                )}
              />
            </div>

            <div style={legendWrapStyle}>
              {requestMixData.map((item, index) => (
                <LegendItem
                  key={item.name}
                  color={PIE_COLORS[index % PIE_COLORS.length]}
                  label={item.name}
                  value={item.value}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Platform Volume</h3>
              <span style={sectionMetaStyle}>Growth blocks</span>
            </div>

            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendAreaData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dashboardAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-main)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--accent-main)" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(233,225,211,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text-soft)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-soft)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--accent-main)"
                    strokeWidth={3}
                    fill="url(#dashboardAreaFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Quick Actions</h3>
              <span style={sectionMetaStyle}>Go faster</span>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <QuickAction
                to="/admin/company-requests"
                title="Review Company Requests"
                description="Open the company review pipeline"
                primary
              />
              <QuickAction
                to="/admin/merchant-requests"
                title="Review Merchant Requests"
                description="Open the merchant review pipeline"
              />
              <QuickAction
                to="/admin/companies"
                title="Open Companies"
                description="Browse approved company accounts"
              />
              <QuickAction
                to="/admin/merchants"
                title="Open Merchants"
                description="Browse approved merchant accounts"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22 }}
        className="premium-card"
        style={bottomSectionStyle}
      >
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Executive Insight</h3>
          <span style={sectionMetaStyle}>Auto-generated overview</span>
        </div>

        <div className="glass-soft" style={insightBoxStyle}>
          <p style={insightTextStyle}>
            LunchPay currently tracks <strong>{activeCompanies}</strong> active companies,
            <strong> {approvedMerchants}</strong> approved merchants and
            <strong> {totalEmployees}</strong> registered employees. There are
            <strong> {totalPendingRequests}</strong> onboarding requests still awaiting review,
            while employee allocation volume has reached
            <strong> {totalAllocatedAmount.toFixed(2)} DT</strong> across the platform.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function HeroBadge({ text }: { text: string }) {
  return (
    <div className="glass-soft" style={heroBadgeStyle}>
      {text}
    </div>
  );
}

function MiniSnapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft" style={miniSnapshotStyle}>
      <div style={miniSnapshotLabelStyle}>{label}</div>
      <div style={miniSnapshotValueStyle}>{value}</div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  accent,
}: {
  label: string;
  value: number;
  subtext: string;
  accent: MetricAccent;
}) {
  return (
    <div
      className="glass-soft"
      style={{
        ...kpiCardStyle,
        background:
          accent === "primary"
            ? "linear-gradient(180deg, color-mix(in srgb, var(--accent-main) 16%, transparent), var(--bg-panel))"
            : "var(--bg-panel)",
      }}
    >
      <div style={kpiLabelStyle}>{label}</div>
      <div style={kpiValueStyle}>{value}</div>
      <div style={kpiSubtextStyle}>{subtext}</div>
    </div>
  );
}

function PriorityCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="glass-soft" style={priorityCardStyle}>
      <div style={priorityHeaderStyle}>
        <div style={priorityTitleStyle}>{title}</div>
        <div style={priorityValueStyle}>{value}</div>
      </div>
      <div style={priorityDescriptionStyle}>{description}</div>
    </div>
  );
}

function HealthCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="glass-soft" style={healthCardStyle}>
      <div style={healthTitleStyle}>{title}</div>
      <div style={healthValueStyle}>{value}</div>
      <div style={healthDescriptionStyle}>{description}</div>
    </div>
  );
}

function QuickAction({
  to,
  title,
  description,
  primary = false,
}: {
  to: string;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={primary ? "btn-primary" : "btn-secondary"}
      style={{
        ...quickActionStyle,
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={quickActionTitleStyle}>{title}</div>
        <div style={quickActionDescriptionStyle}>{description}</div>
      </div>
      <span style={quickActionArrowStyle}>→</span>
    </Link>
  );
}

function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={tooltipStyle}>
      {label && <div style={tooltipTitleStyle}>{label}</div>}
      {payload.map((entry: any, index: number) => (
        <div key={index} style={tooltipRowStyle}>
          <span
            style={{
              ...tooltipDotStyle,
              background: entry.color || entry.fill || "var(--accent-main)",
            }}
          />
          <span>{entry.name || entry.dataKey}:</span>
          <strong style={{ color: "var(--text)" }}>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

function CenterLabel({ title, value }: { title: string; value: string }) {
  return (
    <div style={centerLabelWrapStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={centerLabelTitleStyle}>{title}</div>
        <div style={centerLabelValueStyle}>{value}</div>
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div style={legendItemStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ ...legendDotStyle, background: color }} />
        <span style={{ color: "var(--text-soft)" }}>{label}</span>
      </div>
      <strong style={{ color: "var(--text)" }}>{value}</strong>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const pageStyle: React.CSSProperties = {
  padding: "24px",
};

const heroCardStyle: React.CSSProperties = {
  padding: "26px",
  borderRadius: "30px",
  marginBottom: "22px",
  background:
    "radial-gradient(circle at top right, color-mix(in srgb, var(--accent-main) 14%, transparent), transparent 28%), var(--card-bg)",
  border: "1px solid var(--border-soft)",
  boxShadow: "var(--shadow-card)",
};

const heroGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
  gap: "20px",
  alignItems: "stretch",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "2.2rem",
  fontWeight: 900,
  letterSpacing: "-0.04em",
  marginBottom: "10px",
};

const heroTextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.7,
  maxWidth: "760px",
  marginBottom: "18px",
};

const heroHighlightsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const heroBadgeStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "999px",
  border: "1px solid var(--border-soft)",
  color: "var(--text-soft)",
  fontWeight: 600,
};

const heroInsightBoxStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "24px",
  display: "grid",
  gap: "14px",
  background:
    "linear-gradient(180deg, color-mix(in srgb, white 5%, transparent), transparent), var(--bg-panel)",
};

const miniEyebrowStyle: React.CSSProperties = {
  fontSize: ".8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".14em",
};

const heroInsightNumberStyle: React.CSSProperties = {
  fontSize: "2.3rem",
  fontWeight: 900,
  lineHeight: 1,
};

const heroInsightTextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
};

const heroMiniStatsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const miniSnapshotStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "16px",
};

const miniSnapshotLabelStyle: React.CSSProperties = {
  fontSize: ".74rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".1em",
  marginBottom: "4px",
};

const miniSnapshotValueStyle: React.CSSProperties = {
  fontWeight: 800,
  color: "var(--text)",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: ".85rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".14em",
  marginBottom: "10px",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "22px",
};

const kpiCardStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid var(--border-soft)",
  boxShadow: "var(--shadow-soft)",
};

const kpiLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: ".82rem",
  marginBottom: "10px",
  textTransform: "uppercase",
  letterSpacing: ".12em",
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 900,
  marginBottom: "6px",
};

const kpiSubtextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.5,
};

const mainGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
  gap: "18px",
  marginBottom: "18px",
};

const sectionCardStyle: React.CSSProperties = {
  padding: "22px",
  borderRadius: "26px",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent-main) 10%, transparent), transparent 28%), var(--card-bg)",
  border: "1px solid var(--border-soft)",
  boxShadow: "var(--shadow-card)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.18rem",
  fontWeight: 800,
};

const sectionMetaStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: ".9rem",
};

const priorityCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  border: "1px solid var(--border-soft)",
  background: "var(--bg-panel)",
};

const priorityHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  marginBottom: "8px",
};

const priorityTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  color: "var(--text)",
};

const priorityValueStyle: React.CSSProperties = {
  minWidth: "42px",
  minHeight: "42px",
  display: "grid",
  placeItems: "center",
  borderRadius: "50%",
  background: "color-mix(in srgb, var(--accent-main) 14%, transparent)",
  color: "var(--text)",
  fontWeight: 900,
};

const priorityDescriptionStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
};

const healthGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const healthCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  background: "var(--bg-panel)",
  border: "1px solid var(--border-soft)",
};

const healthTitleStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: ".82rem",
  textTransform: "uppercase",
  letterSpacing: ".12em",
  marginBottom: "8px",
};

const healthValueStyle: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 900,
  marginBottom: "6px",
};

const healthDescriptionStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
};

const quickActionStyle: React.CSSProperties = {
  minHeight: "72px",
  borderRadius: "18px",
  padding: "14px 18px",
  textDecoration: "none",
};

const quickActionTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: "4px",
};

const quickActionDescriptionStyle: React.CSSProperties = {
  color: "inherit",
  opacity: 0.82,
  fontSize: ".92rem",
};

const quickActionArrowStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 900,
};

const bottomSectionStyle: React.CSSProperties = {
  padding: "22px",
  borderRadius: "26px",
  background:
    "radial-gradient(circle at top right, color-mix(in srgb, var(--accent-main) 9%, transparent), transparent 26%), var(--card-bg)",
  border: "1px solid var(--border-soft)",
  boxShadow: "var(--shadow-card)",
};

const insightBoxStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "18px",
};

const insightTextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.8,
  margin: 0,
};

const tooltipStyle: React.CSSProperties = {
  background: "rgba(11, 15, 18, 0.94)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "12px 14px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
};

const tooltipTitleStyle: React.CSSProperties = {
  color: "var(--text)",
  fontWeight: 800,
  marginBottom: "6px",
  fontSize: ".92rem",
};

const tooltipRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "var(--text-soft)",
  fontSize: ".88rem",
  lineHeight: 1.6,
};

const tooltipDotStyle: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  display: "inline-block",
};

const centerLabelWrapStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
};

const centerLabelTitleStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: ".78rem",
  textTransform: "uppercase",
  letterSpacing: ".12em",
  marginBottom: "6px",
};

const centerLabelValueStyle: React.CSSProperties = {
  color: "var(--text)",
  fontSize: "1.6rem",
  fontWeight: 900,
};

const legendWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
  marginTop: "10px",
};

const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  padding: "8px 10px",
  borderRadius: "12px",
  background: "var(--bg-panel)",
};

const legendDotStyle: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  display: "inline-block",
};