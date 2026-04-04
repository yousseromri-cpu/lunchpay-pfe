import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import {
  canCompanyLogin,
  canMerchantLogin,
  setCurrentEnterprise,
} from "../../services/platformStore";
import "./Login.css";

type RoleType = "enterprise" | "merchant";

export default function Login() {
  const [role, setRole] = useState<RoleType>("enterprise");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (role === "enterprise") {
      const company = canCompanyLogin(emailOrPhone, password);

      if (company) {
        setCurrentEnterprise(company);
        alert(`Welcome ${company.companyName}`);
        navigate("/enterprise/dashboard");
        return;
      }
    }

    if (role === "merchant") {
      const merchant = canMerchantLogin(emailOrPhone, password);

      if (merchant) {
        setCurrentEnterprise(null);
        alert(`Welcome ${merchant.merchantName}`);
        navigate("/enterprise/dashboard");
        return;
      }
    }

    alert("Invalid credentials or account not approved yet.");
  }

  return (
    <div className="login-page">
      <MainNavbar />
      <div className="login-shell">
        <section className="login-brand-panel premium-card">
          <div className="login-brand-top">
            <div className="login-brand">
              <span>Lunch</span>Pay
            </div>

            <div className="login-badge">
              <span className="login-badge-dot"></span>
              Digital meal benefits platform
            </div>
          </div>

          <h1 className="login-title">
            Welcome to
            <br />
            <span className="text-gradient">LunchPay.</span>
          </h1>

          <p className="login-description">
            LunchPay helps companies manage employee meal benefits while enabling
            merchants to validate payments instantly through a connected digital
            platform.
          </p>
        </section>

        <section className="login-form-panel premium-card">
          <div className="login-form-head">
            <div className="login-form-kicker">Sign in</div>
            <h2 className="login-form-title">Login to LunchPay</h2>
            <p className="login-form-subtitle">
              Select your role and continue with your approved account.
            </p>
          </div>

          <div className="login-role-grid login-role-grid-two">
            <div
              className={`login-role-card ${role === "enterprise" ? "active" : ""}`}
              onClick={() => setRole("enterprise")}
            >
              <div className="login-role-top">
                <span className="login-role-name">Enterprise</span>
                <span className="login-role-dot"></span>
              </div>
              <div className="login-role-desc">
                HR, finance and company management access
              </div>
            </div>

            <div
              className={`login-role-card ${role === "merchant" ? "active" : ""}`}
              onClick={() => setRole("merchant")}
            >
              <div className="login-role-top">
                <span className="login-role-name">Merchant</span>
                <span className="login-role-dot"></span>
              </div>
              <div className="login-role-desc">
                Payment validation and merchant activity access
              </div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">Email or phone</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✦</span>
                <input
                  className="login-input"
                  type="text"
                  placeholder="name@company.com or +216..."
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">●</span>
                <input
                  className="login-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="login-row">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Keep me signed in
              </label>

              <Link to="/forgot-password" className="login-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary login-submit">
              Continue
            </button>
          </form>

          <div className="login-security-strip">
            Access is available only after account approval by the platform
            administrator.
          </div>

          <div className="login-footer-note">
            New to LunchPay?{" "}
            <Link to="/register-company" className="login-link">
              Request company access
            </Link>{" "}
            or{" "}
            <Link to="/register-merchant" className="login-link">
              request merchant access
            </Link>
            .
          </div>
        </section>
      </div>
    </div>
  );
}