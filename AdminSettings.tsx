import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getCompanyRequests,
  getMerchantRequests,
  getEmployees,
  getEmployeeCountChangeRequests,
} from "../../services/platformStore";

type ThemeMode = "dark" | "light" | "system";

type AdminSettingsState = {
  adminName: string;
  adminEmail: string;
  platformName: string;
  supportEmail: string;
  themeMode: ThemeMode;
  compactMode: boolean;
  dashboardAnimations: boolean;
};

const SETTINGS_KEY = "lp_admin_settings_v4";

const defaultSettings: AdminSettingsState = {
  adminName: "LunchPay Administrator",
  adminEmail: "admin@lunchpay.com",
  platformName: "LunchPay",
  supportEmail: "support@lunchpay.com",
  themeMode: "dark",
  compactMode: false,
  dashboardAnimations: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [saved, setSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const companyRequests = getCompanyRequests();
  const merchantRequests = getMerchantRequests();
  const employees = getEmployees();
  const employeeCountRequests = getEmployeeCountChangeRequests();

  const summary = useMemo(() => {
    const approvedCompanies = companyRequests.filter(
      (item) => item.status === "APPROVED"
    ).length;

    const approvedMerchants = merchantRequests.filter(
      (item) => item.status === "APPROVED"
    ).length;

    const pendingCompanyRequests = companyRequests.filter(
      (item) => item.status === "PENDING"
    ).length;

    const pendingMerchantRequests = merchantRequests.filter(
      (item) => item.status === "PENDING"
    ).length;

    const pendingEmployeeCountRequests = employeeCountRequests.filter(
      (item) => item.status === "PENDING"
    ).length;

    const totalTransferAmount = employees.reduce((sum, employee) => {
      return sum + Number(employee.transferAmount || 0);
    }, 0);

    return {
      approvedCompanies,
      approvedMerchants,
      pendingCompanyRequests,
      pendingMerchantRequests,
      pendingEmployeeCountRequests,
      totalEmployees: employees.length,
      totalTransferAmount,
    };
  }, [companyRequests, merchantRequests, employees, employeeCountRequests]);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      applyAppearance(defaultSettings.themeMode);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AdminSettingsState;
      setSettings(parsed);
      setSaved(true);
      applyAppearance(parsed.themeMode);
    } catch {
      setSettings(defaultSettings);
      applyAppearance(defaultSettings.themeMode);
    }
  }, []);

  useEffect(() => {
    if (settings.themeMode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: light)");

      const applySystemTheme = () => {
        applyAppearance("system");
      };

      media.addEventListener("change", applySystemTheme);
      return () => media.removeEventListener("change", applySystemTheme);
    }
  }, [settings.themeMode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleThemeModeChange(mode: ThemeMode) {
    setSettings((prev) => ({
      ...prev,
      themeMode: mode,
    }));
    applyAppearance(mode);
    setSaved(false);
  }

  function handleToggleChange(name: keyof AdminSettingsState) {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name] as never,
    }));
    setSaved(false);
  }

  function handleSaveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setLastSavedAt(new Date().toLocaleString());
    applyAppearance(settings.themeMode);
  }

  function handleExportSummary() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      settings,
      summary,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lunchpay-admin-settings-summary.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleResetSettings() {
    const confirmed = window.confirm(
      "Are you sure you want to reset the settings to default values?"
    );

    if (!confirmed) return;

    setSettings(defaultSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    setSaved(true);
    setLastSavedAt(new Date().toLocaleString());
    applyAppearance(defaultSettings.themeMode);
  }

  function handleClearDemoData() {
    const confirmed = window.confirm(
      "This will clear companies, merchants, employees and employee count requests from local storage. Do you want to continue?"
    );

    if (!confirmed) return;

    localStorage.removeItem("lp_company_requests");
    localStorage.removeItem("lp_merchant_requests");
    localStorage.removeItem("lp_employees");
    localStorage.removeItem("lp_employee_count_change_requests");
    localStorage.removeItem("lp_current_enterprise");

    alert("Demo platform data cleared. Refresh the page to see updated values.");
  }

  const appearancePreview = useMemo(() => {
    return {
      mode:
        settings.themeMode.charAt(0).toUpperCase() + settings.themeMode.slice(1),
    };
  }, [settings.themeMode]);

  return (
    <div style={pageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: "24px" }}
      >
        <div style={eyebrowStyle}>Admin · Settings Center</div>
        <h2 style={pageTitleStyle}>Platform Settings</h2>
        <p style={pageDescStyle}>
          Manage administrator profile, platform identity, theme preferences and
          admin tools from one clean settings center.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        style={statsGridStyle}
      >
        <StatCard label="Approved Companies" value={String(summary.approvedCompanies)} />
        <StatCard label="Approved Merchants" value={String(summary.approvedMerchants)} />
        <StatCard label="Registered Employees" value={String(summary.totalEmployees)} />
        <StatCard
          label="Allocated Amount"
          value={`${summary.totalTransferAmount.toFixed(2)} DT`}
        />
      </motion.div>

      <div className="admin-settings-main-grid" style={mainGridStyle}>
        <div style={{ display: "grid", gap: "18px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <h3 style={sectionTitleStyle}>Administrator Profile</h3>

            <div style={{ display: "grid", gap: "14px" }}>
              <Field
                label="Administrator name"
                name="adminName"
                value={settings.adminName}
                onChange={handleInputChange}
              />

              <Field
                label="Administrator email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleInputChange}
              />

              <Field
                label="Platform name"
                name="platformName"
                value={settings.platformName}
                onChange={handleInputChange}
              />

              <Field
                label="Support email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <h3 style={sectionTitleStyle}>Appearance</h3>

            <div style={{ display: "grid", gap: "18px" }}>
              <div>
                <div style={subLabelStyle}>Theme mode</div>
                <ThemeModeSwitch
                  value={settings.themeMode}
                  onChange={handleThemeModeChange}
                />
              </div>

              <ToggleCard
                title="Compact mode"
                description="Use denser spacing in cards and admin pages."
                checked={settings.compactMode}
                onToggle={() => handleToggleChange("compactMode")}
              />

              <ToggleCard
                title="Dashboard animations"
                description="Enable motion and transition effects in the admin dashboard."
                checked={settings.dashboardAnimations}
                onToggle={() => handleToggleChange("dashboardAnimations")}
              />
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
            <h3 style={sectionTitleStyle}>Settings Preview</h3>

            <div style={{ display: "grid", gap: "12px" }}>
              <Detail label="Current theme" value={appearancePreview.mode} />
              <Detail
                label="Pending company requests"
                value={String(summary.pendingCompanyRequests)}
              />
              <Detail
                label="Pending merchant requests"
                value={String(summary.pendingMerchantRequests)}
              />
              <Detail
                label="Pending employee count requests"
                value={String(summary.pendingEmployeeCountRequests)}
              />
              <Detail
                label="Save status"
                value={saved ? "Saved locally" : "Unsaved changes"}
              />
            </div>

            <div className="glass-soft" style={previewBoxStyle}>
              <div style={previewTitleStyle}>Live configuration summary</div>
              <div style={previewTextStyle}>
                {settings.platformName} is currently using{" "}
                <strong>{appearancePreview.mode.toLowerCase()}</strong> mode.
                The admin workspace is configured with{" "}
                <strong>{settings.compactMode ? "compact" : "comfortable"}</strong>{" "}
                spacing and{" "}
                <strong>{settings.dashboardAnimations ? "enabled" : "disabled"}</strong>{" "}
                animations.
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="premium-card"
            style={sectionCardStyle}
          >
            <h3 style={sectionTitleStyle}>Administrative Actions</h3>

            <div style={{ display: "grid", gap: "12px" }}>
              <button className="btn-primary" onClick={handleSaveSettings}>
                Save Settings
              </button>

              <button className="btn-secondary" onClick={handleExportSummary}>
                Export Platform Summary
              </button>

              <button className="btn-secondary" onClick={handleResetSettings}>
                Reset to Default
              </button>

              <button onClick={handleClearDemoData} style={dangerButtonStyle}>
                Clear Demo Data
              </button>
            </div>

            <div className="glass-soft" style={saveStatusBoxStyle}>
              <div style={saveStatusTitleStyle}>Save status</div>
              <div
                style={{
                  color: saved ? "var(--emerald)" : "var(--text-soft)",
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {saved
                  ? lastSavedAt
                    ? `Settings saved locally on ${lastSavedAt}.`
                    : "Settings currently match saved values."
                  : "You have unsaved changes."}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function applyAppearance(themeMode: ThemeMode) {
  const root = document.documentElement;

  const resolvedTheme =
    themeMode === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : themeMode;

  root.setAttribute("data-theme", resolvedTheme);
}

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
      />
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-soft" style={toggleCardStyle}>
      <div>
        <div style={toggleTitleStyle}>{title}</div>
        <div style={toggleDescriptionStyle}>{description}</div>
      </div>

      <button onClick={onToggle} style={getToggleButtonStyle(checked)}>
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}

function ThemeModeSwitch({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  const options: { key: ThemeMode; label: string }[] = [
    { key: "dark", label: "Dark" },
    { key: "light", label: "Light" },
    { key: "system", label: "System" },
  ];

  return (
    <div style={themeSwitchWrapStyle}>
      {options.map((option) => {
        const active = value === option.key;

        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            style={themeSwitchButtonStyle}
            type="button"
          >
            {active && (
              <motion.div
                layoutId="theme-mode-pill"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={themeSwitchActivePillStyle}
              />
            )}

            <span
              style={{
                ...themeSwitchLabelStyle,
                color: active ? "var(--text)" : "var(--text-soft)",
              }}
            >
              {option.label}
            </span>
          </button>
        );
      })}
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

function getToggleButtonStyle(checked: boolean): React.CSSProperties {
  return {
    minWidth: "88px",
    minHeight: "42px",
    borderRadius: "999px",
    fontWeight: 800,
    background: checked
      ? "linear-gradient(135deg, var(--accent-main), var(--accent-soft))"
      : "rgba(255,255,255,0.08)",
    color: checked ? "#081013" : "var(--text)",
    border: checked
      ? "1px solid color-mix(in srgb, var(--accent-main) 45%, transparent)"
      : "1px solid rgba(255,255,255,0.08)",
  };
}

const pageStyle: React.CSSProperties = {
  padding: "24px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: ".85rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".14em",
  marginBottom: "10px",
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

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
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
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent-main) 10%, transparent), transparent 28%), var(--card-bg)",
  border: "1px solid var(--border-soft)",
  boxShadow: "var(--shadow-card)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 800,
  marginBottom: "16px",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "var(--text)",
};

const toggleCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
};

const toggleTitleStyle: React.CSSProperties = {
  color: "var(--text)",
  fontWeight: 800,
  marginBottom: "6px",
};

const toggleDescriptionStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.6,
  fontSize: ".95rem",
};

const subLabelStyle: React.CSSProperties = {
  fontSize: ".82rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".12em",
  marginBottom: "10px",
};

const themeSwitchWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "8px",
  padding: "8px",
  borderRadius: "20px",
  background: "var(--bg-panel)",
  border: "1px solid var(--border-soft)",
  boxShadow: "inset 0 1px 0 color-mix(in srgb, white 4%, transparent)",
};

const themeSwitchButtonStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "52px",
  borderRadius: "14px",
  background: "transparent",
  border: "none",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
};

const themeSwitchActivePillStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "14px",
  background:
    "linear-gradient(135deg, color-mix(in srgb, var(--accent-main) 18%, transparent), color-mix(in srgb, white 5%, transparent))",
  border: "1px solid color-mix(in srgb, var(--accent-main) 30%, transparent)",
  boxShadow:
    "0 0 0 3px color-mix(in srgb, var(--accent-main) 12%, transparent), 0 12px 22px rgba(0,0,0,0.08)",
};

const themeSwitchLabelStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  fontSize: ".96rem",
  letterSpacing: "-0.01em",
};

const previewBoxStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "18px",
};

const previewTitleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "8px",
};

const previewTextStyle: React.CSSProperties = {
  color: "var(--text-soft)",
  lineHeight: 1.7,
};

const saveStatusBoxStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "18px",
};

const saveStatusTitleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "8px",
};

const statCardStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "22px",
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

const dangerButtonStyle: React.CSSProperties = {
  minHeight: "52px",
  borderRadius: "18px",
  color: "white",
  fontWeight: 700,
  background: "linear-gradient(135deg, #ff5c7a, #ff7a7a)",
};