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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Building2,
  Store,
  Users,
  Wallet,
  ArrowLeft,
  Brain,
  Activity,
} from "lucide-react";
import {
  getCompanyRequests,
  getMerchantRequests,
  getApprovedCompanies,
  getEmployees,
  getEmployeeCountChangeRequests,
} from "../../services/platformStore";

const PIE_COLORS = ["#2ED3A8", "#7CE8CD", "#D6A94D", "#FF7A8F"];

type CompanyPrediction = {
  companyId: string;
  companyName: string;
  sector: string;
  city: string;
  authorizedEmployees: number;
  currentEmployees: number;
  utilizationRate: number;
  totalTransfer: number;
  averageTransfer: number;
  pendingQuotaRequests: number;
  predictedNeededEmployees: number;
  projectedMonthlyTransfer: number;
  demandScore: number;
  riskLevel: "Low" | "Medium" | "High";
};

type MerchantPrediction = {
  merchantId: string;
  merchantName: string;
  city: string;
  status: string;
  demandScore: number;
  projectedTraffic: number;
  riskLevel: "Low" | "Medium" | "High";
};

export default function AdminPredictionSystem() {
  const companyRequests = getCompanyRequests();
  const merchantRequests = getMerchantRequests();
  const approvedCompanies = getApprovedCompanies();
  const employees = getEmployees();
  const employeeCountRequests = getEmployeeCountChangeRequests();

  const companyPredictions: CompanyPrediction[] = approvedCompanies
    .map((company: any) => {
      const companyEmployees = employees.filter(
        (employee: any) => employee.companyId === company.id
      );

      const companyQuotaRequests = employeeCountRequests.filter(
        (request: any) =>
          request.companyId === company.id &&
          String(request.status || "").toUpperCase() === "PENDING"
      );

      const authorizedEmployees = Number(company.employeesCount) || 0;
      const currentEmployees = companyEmployees.length;

      const totalTransfer = companyEmployees.reduce((sum: number, employee: any) => {
        return sum + Number(employee.transferAmount || 0);
      }, 0);

      const averageTransfer =
        currentEmployees > 0 ? Math.round(totalTransfer / currentEmployees) : 0;

      const utilizationRate =
        authorizedEmployees > 0
          ? Math.round((currentEmployees / authorizedEmployees) * 100)
          : 0;

      const latestRequestedCount =
        companyQuotaRequests.length > 0
          ? Math.max(
              ...companyQuotaRequests.map(
                (request: any) => Number(request.requestedEmployeesCount) || 0
              )
            )
          : currentEmployees;

      const requestGrowthSignal = Math.max(
        latestRequestedCount - currentEmployees,
        0
      );

      const pressureBoost =
        utilizationRate >= 95
          ? 18
          : utilizationRate >= 85
          ? 12
          : utilizationRate >= 70
          ? 6
          : 0;

      const predictedNeededEmployees =
        currentEmployees +
        Math.max(
          requestGrowthSignal,
          Math.round(currentEmployees * 0.08 + pressureBoost / 2)
        );

      const projectedGrowthFactor = Math.min(
        0.18,
        utilizationRate / 100 * 0.08 +
          companyQuotaRequests.length * 0.03 +
          (requestGrowthSignal > 0 ? 0.04 : 0)
      );

      const projectedMonthlyTransfer = Math.round(
        totalTransfer * (1 + projectedGrowthFactor)
      );

      const demandScore = Math.min(
        100,
        Math.round(
          utilizationRate * 0.5 +
            companyQuotaRequests.length * 10 +
            Math.min(requestGrowthSignal, 25) * 1.2
        )
      );

      const riskLevel: CompanyPrediction["riskLevel"] =
        demandScore >= 75 ? "High" : demandScore >= 45 ? "Medium" : "Low";

      return {
        companyId: company.id,
        companyName: company.companyName,
        sector: company.sector || "N/A",
        city: company.city || "N/A",
        authorizedEmployees,
        currentEmployees,
        utilizationRate,
        totalTransfer,
        averageTransfer,
        pendingQuotaRequests: companyQuotaRequests.length,
        predictedNeededEmployees,
        projectedMonthlyTransfer,
        demandScore,
        riskLevel,
      };
    })
    .sort((a, b) => b.demandScore - a.demandScore);

  const merchantPredictions: MerchantPrediction[] = merchantRequests
    .filter((merchant: any) => String(merchant.status || "").toUpperCase() === "APPROVED")
    .map((merchant: any) => {
      const projectedTraffic =
        Math.max(10, Math.round(employees.length / Math.max(1, merchantRequests.length))) +
        Math.round(companyPredictions.length * 0.8);

      const demandScore = Math.min(
        100,
        Math.round(projectedTraffic * 1.5 + companyPredictions.length * 2)
      );

      const riskLevel: MerchantPrediction["riskLevel"] =
        demandScore >= 75 ? "High" : demandScore >= 45 ? "Medium" : "Low";

      return {
        merchantId: merchant.id,
        merchantName: merchant.businessName || merchant.merchantName || "Merchant",
        city: merchant.city || "N/A",
        status: merchant.status || "APPROVED",
        demandScore,
        projectedTraffic,
        riskLevel,
      };
    })
    .sort((a, b) => b.demandScore - a.demandScore);

  const totalProjectedTransfer = companyPredictions.reduce(
    (sum, item) => sum + item.projectedMonthlyTransfer,
    0
  );

  const totalCurrentTransfer = companyPredictions.reduce(
    (sum, item) => sum + item.totalTransfer,
    0
  );

  const highRiskCompanies = companyPredictions.filter(
    (item) => item.riskLevel === "High"
  ).length;

  const highRiskMerchants = merchantPredictions.filter(
    (item) => item.riskLevel === "High"
  ).length;

  const averageUtilization =
    companyPredictions.length > 0
      ? Math.round(
          companyPredictions.reduce((sum, item) => sum + item.utilizationRate, 0) /
            companyPredictions.length
        )
      : 0;

  const predictionAreaData = companyPredictions.slice(0, 6).map((item) => ({
    name: item.companyName,
    current: item.totalTransfer,
    projected: item.projectedMonthlyTransfer,
  }));

  const riskDistributionData = [
    {
      name: "High Risk Companies",
      value: companyPredictions.filter((item) => item.riskLevel === "High").length,
    },
    {
      name: "Medium Risk Companies",
      value: companyPredictions.filter((item) => item.riskLevel === "Medium").length,
    },
    {
      name: "Low Risk Companies",
      value: companyPredictions.filter((item) => item.riskLevel === "Low").length,
    },
  ].filter((item) => item.value > 0);

  const operationalPredictionBars = [
    {
      name: "Projected Transfer",
      value: totalProjectedTransfer,
    },
    {
      name: "Current Transfer",
      value: totalCurrentTransfer,
    },
    {
      name: "High Risk Companies",
      value: highRiskCompanies,
    },
    {
      name: "High Risk Merchants",
      value: highRiskMerchants,
    },
  ];

  return (
    <div style={pageStyle}>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="premium-card"
        style={heroCardStyle}
      >
        <div style={heroGridStyle}>
          <div>
            <div style={eyebrowStyle}>Admin · Prediction System</div>
            <h1 style={heroTitleStyle}>LunchPay Intelligence Forecast</h1>
            <p style={heroTextStyle}>
              Anticipate operational pressure, projected transfer volume, quota
              demand and merchant activity using the real platform records already
              stored in LunchPay.
            </p>

            <div style={heroHighlightsStyle}>
              <HeroBadge text={`${highRiskCompanies} high-risk companies`} />
              <HeroBadge text={`${averageUtilization}% average utilization`} />
              <HeroBadge text={`${totalProjectedTransfer} DT projected volume`} />
            </div>

            <div style={{ marginTop: "18px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link
                to="/admin/dashboard"
                className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <ArrowLeft size={16} />
                Back to Admin Dashboard
              </Link>
            </div>
          </div>

          <div className="glass-soft" style={heroInsightBoxStyle}>
            <div style={miniEyebrowStyle}>Prediction snapshot</div>
            <div style={heroInsightNumberStyle}>{totalProjectedTransfer} DT</div>
            <div style={heroInsightTextStyle}>
              Estimated next-cycle transfer volume based on company utilization,
              employee records and pending quota signals.
            </div>

            <div style={heroMiniStatsGridStyle}>
              <MiniSnapshot label="Companies analyzed" value={String(companyPredictions.length)} />
              <MiniSnapshot label="Merchants analyzed" value={String(merchantPredictions.length)} />
              <MiniSnapshot label="High-risk merchants" value={String(highRiskMerchants)} />
              <MiniSnapshot label="Projected growth" value={`${Math.max(totalProjectedTransfer - totalCurrentTransfer, 0)} DT`} />
            </div>
          </div>
        </div>
      </motion.section>

      <div style={statsGridStyle}>
        <KpiCard
          label="Projected Monthly Transfer"
          value={`${totalProjectedTransfer} DT`}
          subtext="Estimated from real employee and quota data"
          accent="primary"
          icon={<Wallet size={18} />}
        />
        <KpiCard
          label="High Risk Companies"
          value={String(highRiskCompanies)}
          subtext="Need admin attention soon"
          accent="neutral"
          icon={<TriangleAlert size={18} />}
        />
        <KpiCard
          label="Average Utilization"
          value={`${averageUtilization}%`}
          subtext="Quota occupancy across approved companies"
          accent="neutral"
          icon={<Users size={18} />}
        />
        <KpiCard
          label="Merchant Load"
          value={String(highRiskMerchants)}
          subtext="Merchants likely to absorb high future traffic"
          accent="neutral"
          icon={<Store size={18} />}
        />
      </div>

      <div style={mainGridStyle}>
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="premium-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Company Forecast</h3>
              <span style={sectionMetaStyle}>Transfer evolution</span>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={predictionAreaData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="predictedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-main)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--accent-main)" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D6A94D" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#D6A94D" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>

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
                  />
                  <YAxis
                    tick={{ fill: "var(--text-soft)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#D6A94D"
                    strokeWidth={2.4}
                    fill="url(#currentFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="var(--accent-main)"
                    strokeWidth={3}
                    fill="url(#predictedFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="premium-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Priority Watchlist</h3>
              <span style={sectionMetaStyle}>Top demand score</span>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {companyPredictions.slice(0, 5).map((company) => (
                <PriorityCard
                  key={company.companyId}
                  title={company.companyName}
                  value={`${company.demandScore}/100`}
                  description={`${company.currentEmployees}/${company.authorizedEmployees} employees · ${company.utilizationRate}% utilization · projected ${company.projectedMonthlyTransfer} DT`}
                  risk={company.riskLevel}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <div className="premium-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Risk Distribution</h3>
              <span style={sectionMetaStyle}>Company risk spread</span>
            </div>

            <div style={{ position: "relative", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
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
                    {riskDistributionData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PremiumTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <CenterLabel
                title="Companies"
                value={String(companyPredictions.length)}
              />
            </div>
          </div>

          <div className="premium-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Prediction Summary</h3>
              <span style={sectionMetaStyle}>System signals</span>
            </div>

            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={operationalPredictionBars}
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
                    angle={-6}
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
                    fill="url(#predictionBarGradient)"
                    barSize={36}
                  />
                  <defs>
                    <linearGradient id="predictionBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-soft)" />
                      <stop offset="100%" stopColor="var(--accent-main)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card" style={bottomSectionStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Executive Prediction Insight</h3>
          <span style={sectionMetaStyle}>Auto-generated overview</span>
        </div>

        <div className="glass-soft" style={insightBoxStyle}>
          <p style={insightTextStyle}>
            Based on approved companies, employee allocation records and pending
            employee quota requests, LunchPay projects a next-cycle transfer
            volume of <strong>{totalProjectedTransfer} DT</strong>. The system
            currently flags <strong>{highRiskCompanies}</strong> companies and
            <strong> {highRiskMerchants}</strong> merchants as high-priority
            monitoring targets.
          </p>
        </div>
      </div>
    </div>
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
  icon,
}: {
  label: string;
  value: string;
  subtext: string;
  accent: "primary" | "neutral";
  icon: React.ReactNode;
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
      <div style={metricIconWrap}>{icon}</div>
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
  risk,
}: {
  title: string;
  value: string;
  description: string;
  risk: "Low" | "Medium" | "High";
}) {
  return (
    <div className="glass-soft" style={priorityCardStyle}>
      <div style={priorityHeaderStyle}>
        <div>
          <div style={priorityTitleStyle}>{title}</div>
          <div style={priorityRiskStyle(risk)}>{risk}</div>
        </div>
        <div style={priorityValueStyle}>{value}</div>
      </div>
      <div style={priorityDescriptionStyle}>{description}</div>
    </div>
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

const metricIconWrap: React.CSSProperties = {
  width: "46px",
  height: "46px",
  borderRadius: "14px",
  display: "grid",
  placeItems: "center",
  marginBottom: "12px",
  background: "color-mix(in srgb, var(--accent-main) 14%, transparent)",
  color: "var(--text)",
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

const priorityRiskStyle = (risk: "Low" | "Medium" | "High"): React.CSSProperties => ({
  display: "inline-flex",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: ".76rem",
  fontWeight: 700,
  marginTop: "6px",
  background:
    risk === "High"
      ? "rgba(255,107,107,0.12)"
      : risk === "Medium"
      ? "rgba(255,204,102,0.10)"
      : "rgba(76,217,153,0.12)",
  color:
    risk === "High"
      ? "#ff9c9c"
      : risk === "Medium"
      ? "#ffd789"
      : "#6ce8b5",
  border:
    risk === "High"
      ? "1px solid rgba(255,107,107,0.22)"
      : risk === "Medium"
      ? "1px solid rgba(255,204,102,0.22)"
      : "1px solid rgba(76,217,153,0.22)",
});

const priorityValueStyle: React.CSSProperties = {
  minWidth: "74px",
  minHeight: "42px",
  display: "grid",
  placeItems: "center",
  borderRadius: "14px",
  background: "color-mix(in srgb, var(--accent-main) 14%, transparent)",
  color: "var(--text)",
  fontWeight: 900,
};

const priorityDescriptionStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
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