import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getMerchantRequests } from "../../services/platformStore";
import type { MerchantRequest } from "../../services/platformStore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from "recharts";

type MerchantClusterMode = "category" | "city" | "branchScale" | "networkType";
type MerchantQuickFilter = "all" | "multiBranch" | "singleBranch" | "food" | "topCities";

const CATEGORY_COLORS = [
  "#2ED3A8",
  "#1FAE8E",
  "#0E7A62",
  "#7CE8CD",
  "#A8F3E1",
  "#5BE0BC",
];

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState<MerchantRequest[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantRequest | null>(null);
  const [search, setSearch] = useState("");
  const [clusterMode, setClusterMode] = useState<MerchantClusterMode>("category");
  const [quickFilter, setQuickFilter] = useState<MerchantQuickFilter>("all");

  useEffect(() => {
    const approvedMerchants = getMerchantRequests().filter(
      (merchant) => merchant.status === "APPROVED"
    );

    setMerchants(approvedMerchants);

    if (approvedMerchants.length > 0) {
      setSelectedMerchant(approvedMerchants[0]);
    }
  }, []);

  function getBranchesCount(merchant: MerchantRequest): number {
    return Number(merchant.branchesCount || 0);
  }

  function getMerchantScaleLabel(merchant: MerchantRequest): string {
    const branches = getBranchesCount(merchant);

    if (branches <= 1) return "Single Branch";
    if (branches <= 5) return "Growing Network";
    return "Large Network";
  }

  function getNetworkTypeLabel(merchant: MerchantRequest): string {
    const branches = getBranchesCount(merchant);

    if (branches <= 1) return "Independent Merchant";
    if (branches <= 3) return "Local Chain";
    return "Multi-Branch Brand";
  }

  function getClusterValue(merchant: MerchantRequest): string {
    switch (clusterMode) {
      case "category":
        return merchant.category || "Other categories";
      case "city":
        return merchant.city || "Other cities";
      case "branchScale":
        return getMerchantScaleLabel(merchant);
      case "networkType":
        return getNetworkTypeLabel(merchant);
      default:
        return "Other";
    }
  }

  function isFoodCategory(merchant: MerchantRequest): boolean {
    const category = (merchant.category || "").toLowerCase();
    return (
      category.includes("restaurant") ||
      category.includes("food") ||
      category.includes("café") ||
      category.includes("cafe") ||
      category.includes("snack") ||
      category.includes("bakery")
    );
  }

  const totalBranches = useMemo(() => {
    return merchants.reduce((sum, merchant) => sum + getBranchesCount(merchant), 0);
  }, [merchants]);

  const averageBranches = useMemo(() => {
    if (merchants.length === 0) return 0;
    return (totalBranches / merchants.length).toFixed(1);
  }, [merchants, totalBranches]);

  const categoriesCount = useMemo(() => {
    return new Set(merchants.map((merchant) => merchant.category)).size;
  }, [merchants]);

  const multiBranchCount = useMemo(() => {
    return merchants.filter((merchant) => getBranchesCount(merchant) > 1).length;
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let base = merchants;

    if (keyword) {
      base = base.filter((merchant) => {
        return (
          merchant.merchantName.toLowerCase().includes(keyword) ||
          merchant.category.toLowerCase().includes(keyword) ||
          merchant.city.toLowerCase().includes(keyword) ||
          merchant.country.toLowerCase().includes(keyword) ||
          merchant.contactName.toLowerCase().includes(keyword)
        );
      });
    }

    if (quickFilter === "multiBranch") {
      base = base.filter((merchant) => getBranchesCount(merchant) > 1);
    }

    if (quickFilter === "singleBranch") {
      base = base.filter((merchant) => getBranchesCount(merchant) <= 1);
    }

    if (quickFilter === "food") {
      base = base.filter((merchant) => isFoodCategory(merchant));
    }

    if (quickFilter === "topCities") {
      const topCities = getTopCityNames(merchants, 3);
      base = base.filter((merchant) => topCities.includes(merchant.city));
    }

    return base;
  }, [merchants, search, quickFilter]);

  const clusteredMerchants = useMemo(() => {
    const groups: Record<string, MerchantRequest[]> = {};

    filteredMerchants.forEach((merchant) => {
      const key = getClusterValue(merchant);
      if (!groups[key]) groups[key] = [];
      groups[key].push(merchant);
    });

    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredMerchants, clusterMode]);

  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();

    merchants.forEach((merchant) => {
      const key = merchant.category || "Other";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [merchants]);

  const cityAreaData = useMemo(() => {
    const map = new Map<string, number>();

    merchants.forEach((merchant) => {
      const key = merchant.city || "Other";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, merchantsCount]) => ({ name, merchantsCount }))
      .sort((a, b) => b.merchantsCount - a.merchantsCount)
      .slice(0, 6);
  }, [merchants]);

  const branchesRankingData = useMemo(() => {
    return [...merchants]
      .sort((a, b) => getBranchesCount(b) - getBranchesCount(a))
      .slice(0, 6)
      .map((merchant) => ({
        name: merchant.merchantName,
        branches: getBranchesCount(merchant),
      }));
  }, [merchants]);

  const topMerchantsByBranches = useMemo(() => {
    return [...merchants]
      .sort((a, b) => getBranchesCount(b) - getBranchesCount(a))
      .slice(0, 5);
  }, [merchants]);

  return (
    <div style={pageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{ marginBottom: "24px" }}
      >
        <div style={eyebrowStyle}>Admin · Merchant Network Intelligence</div>
        <h2 style={pageTitleStyle}>Approved Merchants Portfolio</h2>
        <p style={pageDescStyle}>
          Explore the approved merchant ecosystem through business category,
          geographic footprint, branch structure and network scale to support
          better merchant portfolio monitoring.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={statsGridStyle}
      >
        <AnimatedCard>
          <StatCard label="Approved Merchants" value={String(merchants.length)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Total Branches" value={String(totalBranches)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Merchant Categories" value={String(categoriesCount)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Avg. Branches / Merchant" value={String(averageBranches)} />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard label="Multi-Branch Networks" value={String(multiBranchCount)} />
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
          <label style={labelStyle}>Search merchants</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant, city, category, contact..."
          />
        </div>

        <div style={{ minWidth: "240px" }}>
          <label style={labelStyle}>Cluster by</label>
          <select
            value={clusterMode}
            onChange={(e) => setClusterMode(e.target.value as MerchantClusterMode)}
          >
            <option value="category">Category</option>
            <option value="city">City</option>
            <option value="branchScale">Branch Scale</option>
            <option value="networkType">Network Type</option>
          </select>
        </div>

        <div style={{ minWidth: "240px" }}>
          <label style={labelStyle}>Quick filter</label>
          <select
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value as MerchantQuickFilter)}
          >
            <option value="all">All merchants</option>
            <option value="multiBranch">Multi-branch only</option>
            <option value="singleBranch">Single-branch only</option>
            <option value="food">Food-related merchants</option>
            <option value="topCities">Top city merchants</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={chartsGridStyle}
      >
        {/* CATEGORY DISTRIBUTION */}
        <AnimatedCard>
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.22 }}
            className="premium-card"
            style={premiumChartCardStyle}
          >
            <h3 style={premiumChartTitleStyle}>Merchant Categories</h3>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 12, left: 10, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(233,225,211,0.06)"
                    horizontal
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#B9B0A5", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "#B9B0A5", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Bar dataKey="value" radius={[0, 14, 14, 0]} barSize={20}>
                    {categoryChartData.map((_, index) => (
                      <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={chartSubtitleStyle}>
              Category composition of the approved merchant ecosystem.
            </div>
          </motion.div>
        </AnimatedCard>

        {/* CITY FOOTPRINT */}
        <AnimatedCard>
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.22 }}
            className="premium-card"
            style={premiumChartCardStyle}
          >
            <h3 style={premiumChartTitleStyle}>City Footprint</h3>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cityAreaData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="merchantAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2ED3A8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#2ED3A8" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(233,225,211,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#B9B0A5", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#B9B0A5", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="merchantsCount"
                    stroke="#2ED3A8"
                    strokeWidth={3}
                    fill="url(#merchantAreaFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={chartSubtitleStyle}>
              Geographic concentration of approved merchants across the main operating cities.
            </div>
          </motion.div>
        </AnimatedCard>

        {/* BRANCH RANKING */}
        <AnimatedCard>
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.22 }}
            className="premium-card"
            style={premiumChartCardStyle}
          >
            <h3 style={premiumChartTitleStyle}>Branch Leaders</h3>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branchesRankingData}
                  margin={{ top: 10, right: 10, left: -8, bottom: 24 }}
                >
                  <defs>
                    <linearGradient id="branchesBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7CE8CD" />
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
                    tick={{ fill: "#B9B0A5", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "#B9B0A5", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PremiumTooltip />} />
                  <Bar
                    dataKey="branches"
                    fill="url(#branchesBar)"
                    radius={[14, 14, 6, 6]}
                    barSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={chartSubtitleStyle}>
              Merchant ranking by declared branch footprint.
            </div>
          </motion.div>
        </AnimatedCard>
      </motion.div>

      <div className="admin-merchants-main-grid" style={mainGridStyle}>
        <div style={{ display: "grid", gap: "18px" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <div style={sectionHeaderStyle}>
              <h3 style={cardTitleStyle}>Clustered Merchants</h3>
              <span style={{ color: "var(--text-muted)", fontSize: ".92rem" }}>
                {filteredMerchants.length} result(s)
              </span>
            </div>

            {clusteredMerchants.length === 0 ? (
              <EmptyState text="No approved merchants match the current search." />
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {clusteredMerchants.map(([groupName, groupMerchants], groupIndex) => (
                  <motion.div
                    key={groupName}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: groupIndex * 0.04 }}
                  >
                    <div style={groupHeaderStyle}>
                      <div style={groupTitleStyle}>{groupName}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: ".88rem" }}>
                        {groupMerchants.length} merchant{groupMerchants.length > 1 ? "s" : ""}
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      {groupMerchants.map((merchant, index) => {
                        const isActive = selectedMerchant?.id === merchant.id;
                        const branches = getBranchesCount(merchant);

                        return (
                          <motion.button
                            key={merchant.id}
                            onClick={() => setSelectedMerchant(merchant)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28, delay: index * 0.03 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            whileTap={{ scale: 0.995 }}
                            style={{
                              ...merchantCardStyle,
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
                            <div style={merchantTopRowStyle}>
                              <div>
                                <div style={merchantNameStyle}>{merchant.merchantName}</div>
                                <div style={merchantMetaStyle}>
                                  {merchant.category} · {merchant.city}, {merchant.country}
                                </div>
                              </div>

                              <MerchantStatusChip label={getNetworkTypeLabel(merchant)} />
                            </div>

                            <div style={merchantMiniGridStyle}>
                              <MiniMetric label="Branches" value={String(branches)} />
                              <MiniMetric label="Category" value={merchant.category} />
                              <MiniMetric label="Scale" value={getMerchantScaleLabel(merchant)} />
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
            <h3 style={cardTitleStyle}>Top Merchants by Branch Count</h3>

            {topMerchantsByBranches.length === 0 ? (
              <EmptyState text="No merchants available." />
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {topMerchantsByBranches.map((merchant, index) => {
                  const branches = getBranchesCount(merchant);
                  const score = merchants.length > 0 ? Math.min(100, Math.round((branches / Math.max(...merchants.map((m) => getBranchesCount(m) || 1))) * 100)) : 0;

                  return (
                    <motion.div
                      key={merchant.id}
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
                              {merchant.merchantName}
                            </div>
                            <div style={{ color: "var(--text-soft)", fontSize: ".92rem" }}>
                              {merchant.category} · {merchant.city}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: "var(--text)" }}>
                            {branches} branches
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: ".86rem" }}>
                            {getNetworkTypeLabel(merchant)}
                          </div>
                        </div>
                      </div>

                      <div style={progressTrackStyle}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
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
            key={selectedMerchant?.id || "empty-selection"}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
            className="premium-card"
            style={selectedCardStyle}
          >
            <h3 style={cardTitleStyle}>Selected Merchant Intelligence</h3>

            {!selectedMerchant ? (
              <EmptyState text="Select a merchant to display its information." />
            ) : (
              <>
                <div style={selectedHeaderStyle}>
                  <div>
                    <div style={selectedEntityNameStyle}>{selectedMerchant.merchantName}</div>
                    <div style={{ color: "var(--text-soft)" }}>
                      {selectedMerchant.category} · {selectedMerchant.city}, {selectedMerchant.country}
                    </div>
                  </div>

                  <MerchantStatusChip label={getNetworkTypeLabel(selectedMerchant)} />
                </div>

                <div style={selectedDetailsGridStyle}>
                  <Detail label="Merchant name" value={selectedMerchant.merchantName} />
                  <Detail label="Category" value={selectedMerchant.category} />
                  <Detail label="Contact person" value={selectedMerchant.contactName} />
                  <Detail label="Work email" value={selectedMerchant.workEmail} />
                  <Detail label="Phone" value={selectedMerchant.phone} />
                  <Detail
                    label="Location"
                    value={`${selectedMerchant.city}, ${selectedMerchant.country}`}
                  />
                  <Detail label="Branches count" value={selectedMerchant.branchesCount} />
                  <Detail label="Scale" value={getMerchantScaleLabel(selectedMerchant)} />
                  <Detail label="Network type" value={getNetworkTypeLabel(selectedMerchant)} />
                  <Detail label="Status" value={selectedMerchant.status} />
                  <Detail
                    label="Submitted at"
                    value={formatDate(selectedMerchant.submittedAt)}
                  />
                  <Detail label="Cluster category" value={getClusterValue(selectedMerchant)} />
                </div>

                <div className="glass-soft" style={summaryBoxStyle}>
                  <div style={summaryTitleStyle}>Merchant summary</div>
                  <div style={summaryTextStyle}>
                    {selectedMerchant.merchantName} is an approved merchant in the{" "}
                    {selectedMerchant.category.toLowerCase()} segment, operating in{" "}
                    {selectedMerchant.city} with {selectedMerchant.branchesCount} branch
                    {Number(selectedMerchant.branchesCount) > 1 ? "es" : ""}. It is currently
                    classified as a {getNetworkTypeLabel(selectedMerchant).toLowerCase()} with a{" "}
                    {getMerchantScaleLabel(selectedMerchant).toLowerCase()} footprint.
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getTopCityNames(merchants: MerchantRequest[], limit: number): string[] {
  const map = new Map<string, number>();

  merchants.forEach((merchant) => {
    const key = merchant.city || "Other";
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
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
          <span>{entry.name || entry.dataKey}:</span>
          <strong style={{ color: "#E9E1D3" }}>{entry.value}</strong>
        </div>
      ))}
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

function MerchantStatusChip({ label }: { label: string }) {
  const styles = getMerchantChipStyle(label);

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

function getMerchantChipStyle(label: string) {
  if (label === "Multi-Branch Brand") {
    return {
      background: "rgba(46, 211, 168, 0.12)",
      border: "1px solid rgba(46, 211, 168, 0.28)",
      color: "#d8fff3",
    };
  }

  if (label === "Local Chain") {
    return {
      background: "rgba(244, 196, 107, 0.12)",
      border: "1px solid rgba(244, 196, 107, 0.28)",
      color: "#ffe3a3",
    };
  }

  return {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--text)",
  };
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
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

const merchantCardStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px",
  borderRadius: "18px",
  cursor: "pointer",
};

const merchantTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: "12px",
  marginBottom: "8px",
  flexWrap: "wrap",
};

const merchantNameStyle: React.CSSProperties = {
  fontSize: "1.03rem",
  fontWeight: 800,
  color: "var(--text)",
  marginBottom: "5px",
};

const merchantMetaStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
};

const merchantMiniGridStyle: React.CSSProperties = {
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

const selectedEntityNameStyle: React.CSSProperties = {
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

const summaryBoxStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
};

const summaryTitleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "8px",
};

const summaryTextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.7,
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