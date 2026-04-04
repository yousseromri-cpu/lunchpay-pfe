import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getApprovedCompanies,
  getEmployeesByCompany,
} from "../../services/platformStore";
import type {
  CompanyRequest,
  EmployeeRecord,
} from "../../services/platformStore";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts";

type ClusterMode = "sector" | "city" | "size" | "quota";
type QuickFilter = "all" | "quotaReached" | "almostFull" | "empty" | "large";

const CHART_PALETTE = [
  "#2ED3A8",
  "#1FAE8E",
  "#0E7A62",
  "#7CE8CD",
  "#A8F3E1",
  "#5BE0BC",
];

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<CompanyRequest[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRequest | null>(null);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [clusterMode, setClusterMode] = useState<ClusterMode>("sector");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  useEffect(() => {
    const approvedCompanies = getApprovedCompanies();
    setCompanies(approvedCompanies);

    if (approvedCompanies.length > 0) {
      setSelectedCompany(approvedCompanies[0]);
      setEmployees(getEmployeesByCompany(approvedCompanies[0].id));
    }
  }, []);

  function handleSelectCompany(company: CompanyRequest) {
    setSelectedCompany(company);
    setEmployees(getEmployeesByCompany(company.id));
  }

  function getCompanyEmployees(companyId: string): EmployeeRecord[] {
    return getEmployeesByCompany(companyId);
  }

  function getDeclaredEmployees(company: CompanyRequest): number {
    return Number(company.employeesCount) || 0;
  }

  function getAddedEmployees(company: CompanyRequest): number {
    return getCompanyEmployees(company.id).length;
  }

  function getFillRate(company: CompanyRequest): number {
    const declared = getDeclaredEmployees(company);
    const added = getAddedEmployees(company);
    if (declared <= 0) return 0;
    return Math.min(100, Math.round((added / declared) * 100));
  }

  function getCompanySizeLabel(company: CompanyRequest) {
    const declared = getDeclaredEmployees(company);
    if (declared <= 50) return "Small Companies";
    if (declared <= 200) return "Medium Companies";
    return "Large Companies";
  }

  function getQuotaLabel(company: CompanyRequest) {
    const declared = getDeclaredEmployees(company);
    const added = getAddedEmployees(company);

    if (declared === 0) return "No declared quota";
    if (added === 0) return "No employees added";
    if (added >= declared) return "Quota reached";
    if (added >= declared * 0.7) return "Almost full";
    return "Quota available";
  }

  function getClusterValue(company: CompanyRequest) {
    switch (clusterMode) {
      case "sector":
        return company.sector || "Other sectors";
      case "city":
        return company.city || "Other cities";
      case "size":
        return getCompanySizeLabel(company);
      case "quota":
        return getQuotaLabel(company);
      default:
        return "Other";
    }
  }

  const totalEmployees = useMemo(() => {
    return companies.reduce((acc, company) => acc + getAddedEmployees(company), 0);
  }, [companies]);

  const totalDeclaredEmployees = useMemo(() => {
    return companies.reduce((acc, company) => acc + getDeclaredEmployees(company), 0);
  }, [companies]);

  const averageQuotaUsage = useMemo(() => {
    if (companies.length === 0) return 0;
    const total = companies.reduce((acc, company) => acc + getFillRate(company), 0);
    return Math.round(total / companies.length);
  }, [companies]);

  const quotaReachedCompanies = useMemo(() => {
    return companies.filter((company) => getQuotaLabel(company) === "Quota reached").length;
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let base = companies;

    if (keyword) {
      base = base.filter((company) => {
        return (
          company.companyName.toLowerCase().includes(keyword) ||
          company.sector.toLowerCase().includes(keyword) ||
          company.city.toLowerCase().includes(keyword) ||
          company.country.toLowerCase().includes(keyword) ||
          company.contactName.toLowerCase().includes(keyword)
        );
      });
    }

    if (quickFilter === "quotaReached") {
      base = base.filter((company) => getQuotaLabel(company) === "Quota reached");
    }
    if (quickFilter === "almostFull") {
      base = base.filter((company) => getQuotaLabel(company) === "Almost full");
    }
    if (quickFilter === "empty") {
      base = base.filter((company) => getAddedEmployees(company) === 0);
    }
    if (quickFilter === "large") {
      base = base.filter((company) => getCompanySizeLabel(company) === "Large Companies");
    }

    return base;
  }, [companies, search, quickFilter]);

  const clusteredCompanies = useMemo(() => {
    const groups: Record<string, CompanyRequest[]> = {};

    filteredCompanies.forEach((company) => {
      const key = getClusterValue(company);
      if (!groups[key]) groups[key] = [];
      groups[key].push(company);
    });

    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredCompanies, clusterMode]);

  const sectorChartData = useMemo(() => {
    const map = new Map<string, number>();

    companies.forEach((company) => {
      const key = company.sector || "Other";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [companies]);

  const cityChartData = useMemo(() => {
    const map = new Map<string, number>();

    companies.forEach((company) => {
      const key = company.city || "Other";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [companies]);

  const quotaChartData = useMemo(() => {
    const buckets = [
      { name: "Quota reached", value: 0, fill: "#ff7a8f" },
      { name: "Almost full", value: 0, fill: "#f4c46b" },
      { name: "Quota available", value: 0, fill: "#2ED3A8" },
      { name: "No employees added", value: 0, fill: "#7CE8CD" },
    ];

    companies.forEach((company) => {
      const label = getQuotaLabel(company);
      const bucket = buckets.find((item) => item.name === label);
      if (bucket) bucket.value += 1;
    });

    return buckets.filter((item) => item.value > 0);
  }, [companies]);

  const topCompaniesByEmployees = useMemo(() => {
    return [...companies]
      .sort((a, b) => getAddedEmployees(b) - getAddedEmployees(a))
      .slice(0, 5);
  }, [companies]);

  return (
    <div style={pageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{ marginBottom: "24px" }}
      >
        <div style={eyebrowStyle}>Admin · Companies Intelligence</div>
        <h2 style={pageTitleStyle}>Approved Companies Portfolio</h2>
        <p style={pageDescStyle}>
          Monitor the approved companies portfolio, analyze onboarding progress,
          track employee quota usage and review strategic company insights from one premium dashboard.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={statsGridStyle}
      >
        <AnimatedCard>
          <StatCard label="Approved Companies" value={String(companies.length)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Employees Added" value={String(totalEmployees)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Declared Capacity" value={String(totalDeclaredEmployees)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Avg. Quota Usage" value={`${averageQuotaUsage}%`} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Quota Reached" value={String(quotaReachedCompanies)} />
        </AnimatedCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="premium-card"
        style={filtersCardStyle}
      >
        <div style={{ minWidth: "260px", flex: 1 }}>
          <label style={labelStyle}>Search companies</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, city, sector, contact..."
          />
        </div>

        <div style={{ minWidth: "240px" }}>
          <label style={labelStyle}>Cluster by</label>
          <select
            value={clusterMode}
            onChange={(e) => setClusterMode(e.target.value as ClusterMode)}
          >
            <option value="sector">Sector</option>
            <option value="city">City</option>
            <option value="size">Company Size</option>
            <option value="quota">Quota Status</option>
          </select>
        </div>

        <div style={{ minWidth: "240px" }}>
          <label style={labelStyle}>Quick filter</label>
          <select
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value as QuickFilter)}
          >
            <option value="all">All companies</option>
            <option value="quotaReached">Quota reached</option>
            <option value="almostFull">Almost full</option>
            <option value="empty">No employees added</option>
            <option value="large">Large companies</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={chartsGridStyle}
      >
        <AnimatedCard>
          <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.22 }} className="premium-card" style={premiumChartCardStyle}>
            <h3 style={premiumChartTitleStyle}>Companies by Sector</h3>

            <div style={{ position: "relative", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={4}
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth={2}
                  >
                    {sectorChartData.map((_, index) => (
                      <Cell key={index} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PremiumTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ChartCenterLabel title="Sectors" value={String(companies.length)} />
            </div>

            <div style={chartLegendWrapStyle}>
              {sectorChartData.map((item, index) => (
                <div key={item.name} style={chartLegendItemStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        ...legendDotStyle,
                        background: CHART_PALETTE[index % CHART_PALETTE.length],
                      }}
                    />
                    <span style={{ color: "#B9B0A5" }}>{item.name}</span>
                  </div>
                  <strong style={{ color: "#E9E1D3" }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedCard>

        <AnimatedCard>
          <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.22 }} className="premium-card" style={premiumChartCardStyle}>
            <h3 style={premiumChartTitleStyle}>Top Cities</h3>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cityChartData}
                  margin={{ top: 10, right: 10, left: -18, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="barPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#44e3bb" />
                      <stop offset="100%" stopColor="#0E7A62" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(233,225,211,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#B9B0A5", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#B9B0A5", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="url(#barPremium)"
                    radius={[14, 14, 6, 6]}
                    barSize={38}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={chartSubtitleStyle}>
              Geographic concentration of approved companies across the most represented cities.
            </div>
          </motion.div>
        </AnimatedCard>

        <AnimatedCard>
          <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.22 }} className="premium-card" style={premiumChartCardStyle}>
            <h3 style={premiumChartTitleStyle}>Quota Status</h3>

            <div style={{ position: "relative", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="25%"
                  outerRadius="95%"
                  barSize={16}
                  data={quotaChartData}
                >
                  <RadialBar
                 
              
                    background={{ fill: "rgba(255,255,255,0.06)" }}
                    dataKey="value"
                    cornerRadius={12}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>

              <ChartCenterLabel title="Companies" value={String(companies.length)} />
            </div>

            <div style={chartLegendWrapStyle}>
              {quotaChartData.map((item) => (
                <div key={item.name} style={chartLegendItemStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ ...legendDotStyle, background: item.fill }} />
                    <span style={{ color: "#B9B0A5" }}>{item.name}</span>
                  </div>
                  <strong style={{ color: "#E9E1D3" }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedCard>
      </motion.div>

      <div style={mainGridStyle}>
        <div style={{ display: "grid", gap: "18px" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={cardTitleStyle}>Clustered Companies</h3>
              <span style={{ color: "var(--text-muted)", fontSize: ".92rem" }}>
                {filteredCompanies.length} result(s)
              </span>
            </div>

            {clusteredCompanies.length === 0 ? (
              <EmptyState text="No approved companies match the current search." />
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {clusteredCompanies.map(([groupName, groupCompanies], groupIndex) => (
                  <motion.div
                    key={groupName}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: groupIndex * 0.04 }}
                  >
                    <div style={groupHeaderStyle}>
                      <div style={groupTitleStyle}>{groupName}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: ".88rem" }}>
                        {groupCompanies.length} compan{groupCompanies.length > 1 ? "ies" : "y"}
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      {groupCompanies.map((company, index) => {
                        const isActive = selectedCompany?.id === company.id;
                        const addedEmployees = getAddedEmployees(company);
                        const fillRate = getFillRate(company);

                        return (
                          <motion.button
                            key={company.id}
                            onClick={() => handleSelectCompany(company)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28, delay: index * 0.03 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            whileTap={{ scale: 0.995 }}
                            style={{
                              ...companyCardStyle,
                              border: isActive
                                ? "1px solid rgba(46, 211, 168, 0.35)"
                                : "1px solid rgba(255,255,255,0.08)",
                              background: isActive
                                ? "linear-gradient(180deg, rgba(46,211,168,0.14), rgba(255,255,255,0.04))"
                                : "rgba(255,255,255,0.03)",
                              boxShadow: isActive
                                ? "0 0 0 4px rgba(46,211,168,0.08), 0 18px 36px rgba(0,0,0,0.18)"
                                : "0 10px 30px rgba(0,0,0,0.10)",
                            }}
                          >
                            <div style={companyTopRowStyle}>
                              <div>
                                <div style={companyNameStyle}>{company.companyName}</div>
                                <div style={companyMetaStyle}>
                                  {company.sector} · {company.city}, {company.country}
                                </div>
                              </div>

                              <StatusChip label={getQuotaLabel(company)} />
                            </div>

                            <div style={miniMetricsGridStyle}>
                              <MiniMetric label="Added" value={String(addedEmployees)} />
                              <MiniMetric label="Declared" value={String(company.employeesCount)} />
                              <MiniMetric label="Usage" value={`${fillRate}%`} />
                            </div>

                            <div style={progressTrackStyle}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fillRate}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={progressFillStyle}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <h3 style={cardTitleStyle}>Top Companies by Added Employees</h3>

            {topCompaniesByEmployees.length === 0 ? (
              <EmptyState text="No companies available." />
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {topCompaniesByEmployees.map((company, index) => {
                  const added = getAddedEmployees(company);
                  const declared = getDeclaredEmployees(company);
                  const fillRate = getFillRate(company);

                  return (
                    <motion.div
                      key={company.id}
                      className="glass-soft"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.28, delay: index * 0.05 }}
                      whileHover={{ y: -2, scale: 1.005 }}
                      style={rankingCardStyle}
                    >
                      <div style={rankingTopRowStyle}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={rankBadgeStyle}>{index + 1}</div>

                          <div>
                            <div style={{ fontWeight: 800, color: "var(--text)" }}>
                              {company.companyName}
                            </div>
                            <div style={{ color: "var(--text-soft)", fontSize: ".92rem" }}>
                              {company.sector} · {company.city}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: "var(--text)" }}>
                            {added} / {declared}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: ".86rem" }}>
                            {fillRate}% usage
                          </div>
                        </div>
                      </div>

                      <div style={progressTrackStyle}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fillRate}%` }}
                          transition={{ duration: 0.85, ease: "easeOut" }}
                          style={progressFillStyle}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <motion.div
            key={selectedCompany?.id || "empty-selection"}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
            className="premium-card"
            style={selectedCardStyle}
          >
            <h3 style={cardTitleStyle}>Selected Company Intelligence</h3>

            {!selectedCompany ? (
              <EmptyState text="Select a company to display its information." />
            ) : (
              <>
                <div style={selectedHeaderStyle}>
                  <div>
                    <div style={selectedCompanyNameStyle}>{selectedCompany.companyName}</div>
                    <div style={{ color: "var(--text-soft)" }}>
                      {selectedCompany.sector} · {selectedCompany.city}, {selectedCompany.country}
                    </div>
                  </div>

                  <StatusChip label={getQuotaLabel(selectedCompany)} />
                </div>

                <div style={selectedDetailsGridStyle}>
                  <Detail label="Contact person" value={selectedCompany.contactName} />
                  <Detail label="Work email" value={selectedCompany.workEmail} />
                  <Detail label="Phone" value={selectedCompany.phone} />
                  <Detail label="Status" value={selectedCompany.status} />
                  <Detail label="Declared employees" value={selectedCompany.employeesCount} />
                  <Detail
                    label="Employees added"
                    value={String(getAddedEmployees(selectedCompany))}
                  />
                  <Detail label="Company size" value={getCompanySizeLabel(selectedCompany)} />
                  <Detail label="Cluster category" value={getClusterValue(selectedCompany)} />
                </div>

                <div className="glass-soft" style={quotaBoxStyle}>
                  <div style={quotaHeaderRowStyle}>
                    <span style={{ color: "var(--text-soft)" }}>Quota utilization</span>
                    <strong>{getFillRate(selectedCompany)}%</strong>
                  </div>

                  <div style={{ ...progressTrackStyle, height: "10px" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getFillRate(selectedCompany)}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      style={{ ...progressFillStyle, height: "100%" }}
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <h3 style={cardTitleStyle}>Employees List</h3>

            {!selectedCompany ? (
              <EmptyState text="Select a company to view its employees." />
            ) : employees.length === 0 ? (
              <EmptyState text="No employees have been added for this company yet." />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Position</th>
                      <th>Transfer Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, index) => (
                      <motion.tr
                        key={employee.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                      >
                        <td>{employee.fullName}</td>
                        <td>{employee.phone}</td>
                        <td>{employee.email}</td>
                        <td>{employee.position}</td>
                        <td>{employee.transferAmount}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
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

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="glass-soft"
      style={{
        padding: "22px",
        borderRadius: "20px",
        color: "var(--text-soft)",
        textAlign: "center",
        lineHeight: 1.7,
        background:
          "radial-gradient(circle at top, rgba(46,211,168,0.06), transparent 50%), rgba(255,255,255,0.02)",
      }}
    >
      {text}
    </div>
  );
}

function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "rgba(11, 15, 18, 0.94)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "12px 14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      {label && (
        <div
          style={{
            color: "#E9E1D3",
            fontWeight: 800,
            marginBottom: "6px",
            fontSize: ".92rem",
          }}
        >
          {label}
        </div>
      )}

      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#B9B0A5",
            fontSize: ".88rem",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: entry.color || entry.fill,
              display: "inline-block",
            }}
          />
          <span>{entry.name}:</span>
          <strong style={{ color: "#E9E1D3" }}>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ChartCenterLabel({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: "#B9B0A5",
            fontSize: ".78rem",
            textTransform: "uppercase",
            letterSpacing: ".12em",
            marginBottom: "6px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#E9E1D3",
            fontSize: "1.6rem",
            fontWeight: 900,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft" style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft" style={detailCardStyle}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{value}</div>
    </div>
  );
}

function StatusChip({ label }: { label: string }) {
  const styles = getChipStyle(label);

  return (
    <div
      style={{
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: ".78rem",
        fontWeight: 800,
        border: styles.border,
        background: styles.background,
        color: styles.color,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      {label}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft" style={miniMetricStyle}>
      <div style={miniMetricLabelStyle}>{label}</div>
      <div style={miniMetricValueStyle}>{value}</div>
    </div>
  );
}

function getChipStyle(label: string) {
  if (label === "Quota reached") {
    return {
      background: "rgba(255, 92, 122, 0.12)",
      border: "1px solid rgba(255, 92, 122, 0.28)",
      color: "#ffd6dd",
    };
  }

  if (label === "Almost full") {
    return {
      background: "rgba(255, 180, 0, 0.12)",
      border: "1px solid rgba(255, 180, 0, 0.28)",
      color: "#ffe3a3",
    };
  }

  if (label === "Quota available") {
    return {
      background: "rgba(46, 211, 168, 0.12)",
      border: "1px solid rgba(46, 211, 168, 0.28)",
      color: "#d8fff3",
    };
  }

  return {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--text)",
  };
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

const pageTitleStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 900,
  marginBottom: "10px",
};

const pageDescStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.7,
  maxWidth: "980px",
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

const filtersCardStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "24px",
  marginBottom: "20px",
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  alignItems: "end",
  background:
    "radial-gradient(circle at top right, rgba(46,211,168,0.10), transparent 28%), rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
};

const chartsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "18px",
  marginBottom: "22px",
};

const mainGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
  gap: "18px",
};

const sectionCardStyle: React.CSSProperties = {
  padding: "22px",
  borderRadius: "26px",
  background:
    "radial-gradient(circle at top left, rgba(46,211,168,0.06), transparent 28%), rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
};

const selectedCardStyle: React.CSSProperties = {
  padding: "22px",
  borderRadius: "26px",
  background:
    "radial-gradient(circle at top right, rgba(46,211,168,0.09), transparent 26%), rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const groupHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const groupTitleStyle: React.CSSProperties = {
  fontSize: "0.92rem",
  fontWeight: 800,
  color: "var(--text)",
  textTransform: "uppercase",
  letterSpacing: ".08em",
};

const companyCardStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px",
  borderRadius: "18px",
  cursor: "pointer",
};

const companyTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: "12px",
  marginBottom: "8px",
  flexWrap: "wrap",
};

const companyNameStyle: React.CSSProperties = {
  fontSize: "1.03rem",
  fontWeight: 800,
  color: "var(--text)",
  marginBottom: "5px",
};

const companyMetaStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
};

const miniMetricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
  marginTop: "12px",
};

const rankingCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  background:
    "radial-gradient(circle at left top, rgba(46,211,168,0.05), transparent 35%), rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
};

const rankingTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  marginBottom: "8px",
};

const rankBadgeStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  background: "rgba(46,211,168,0.14)",
  boxShadow: "0 10px 20px rgba(46,211,168,0.10)",
};

const selectedHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "start",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const selectedCompanyNameStyle: React.CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 900,
  marginBottom: "6px",
};

const selectedDetailsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginBottom: "14px",
};

const quotaBoxStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
};

const quotaHeaderRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
  gap: "12px",
};

const progressTrackStyle: React.CSSProperties = {
  marginTop: "14px",
  height: "8px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(90deg, rgba(46,211,168,0.98), rgba(14,122,98,0.95))",
  boxShadow: "0 0 18px rgba(46,211,168,0.24)",
};

const statCardStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "22px",
  background:
    "radial-gradient(circle at top left, rgba(46,211,168,0.08), transparent 32%), rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.15)",
};

const statLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: ".82rem",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: ".12em",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 900,
};

const detailCardStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "6px",
};

const detailValueStyle: React.CSSProperties = {
  color: "var(--text)",
  fontWeight: 700,
  lineHeight: 1.5,
};

const miniMetricStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.04)",
};

const miniMetricLabelStyle: React.CSSProperties = {
  fontSize: ".74rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".1em",
  marginBottom: "4px",
};

const miniMetricValueStyle: React.CSSProperties = {
  fontWeight: 800,
  color: "var(--text)",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: 800,
  marginBottom: "14px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "var(--text)",
};

const premiumChartCardStyle: React.CSSProperties = {
  padding: "22px",
  borderRadius: "28px",
  background:
    "radial-gradient(circle at top left, rgba(46,211,168,0.10), transparent 32%), rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 46px rgba(0,0,0,0.20)",
};

const premiumChartTitleStyle: React.CSSProperties = {
  fontSize: "1.16rem",
  fontWeight: 900,
  marginBottom: "10px",
  color: "#E9E1D3",
};

const chartSubtitleStyle: React.CSSProperties = {
  marginTop: "6px",
  color: "#B9B0A5",
  fontSize: ".9rem",
  lineHeight: 1.6,
};

const chartLegendWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
  marginTop: "8px",
};

const chartLegendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  padding: "8px 10px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.03)",
};

const legendDotStyle: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  display: "inline-block",
  flexShrink: 0,
};