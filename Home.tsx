import { Link } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <MainNavbar />

      <main className="home-hero">
        <div className="home-hero-inner">
          <section className="home-left-panel premium-card">
            <div className="home-badge badge">
              <span className="badge-dot"></span>
              Smart employee benefits ecosystem
            </div>

            <h1 className="home-title section-title">
              Digital Employee Benefits,
              <br />
              <span className="text-gradient">
                redesigned for a premium experience.
              </span>
            </h1>

            <p className="home-description section-subtitle">
              LunchPay modernizes the way companies distribute meal benefits
              through an elegant platform for enterprises, merchants, employees
              and administrators.
            </p>

            <div className="home-actions">
              <Link to="/register-company" className="btn-primary">
                Get Started
              </Link>

              <Link to="/login" className="btn-secondary">
                Access Dashboard
              </Link>
            </div>

            <div className="home-stats">
              <div className="home-stat-card glass-soft">
                <div className="home-stat-label">Companies</div>
                <div className="home-stat-value">120+</div>
                <div className="home-stat-sub">Growing business network</div>
              </div>

              <div className="home-stat-card glass-soft">
                <div className="home-stat-label">Transactions</div>
                <div className="home-stat-value">48K</div>
                <div className="home-stat-sub">Secure digital payments</div>
              </div>

              <div className="home-stat-card glass-soft">
                <div className="home-stat-label">Satisfaction</div>
                <div className="home-stat-value">98%</div>
                <div className="home-stat-sub">Smooth user experience</div>
              </div>
            </div>
          </section>

          <aside className="home-right-panel">
            <div className="home-feature-card home-feature-card-large premium-card">
              <div className="home-feature-kicker">Enterprise</div>
              <div className="home-feature-title">Employee Wallet Management</div>
              <p className="home-feature-text">
                Create employee profiles, fund wallets, track balances and monitor
                activity through a refined enterprise dashboard.
              </p>

              <div className="home-media-frame">
                <video
                  className="home-feature-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/videos/lunch123.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="home-mini-grid">
              <div className="home-feature-card premium-card">
                <div className="home-feature-kicker">Merchant</div>
                <div className="home-feature-title">QR Payment Validation</div>
                <p className="home-feature-text">
                  Fast validation flows for merchants with a secure and fluid
                  transaction process.
                </p>
              </div>

              <div className="home-feature-card premium-card">
                <div className="home-feature-kicker">Admin</div>
                <div className="home-feature-title">Full Platform Oversight</div>
                <p className="home-feature-text">
                  Supervise companies, users, merchants and financial activity from
                  one modern back-office.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <section className="home-role-section">
        <div className="home-role-section-inner">
          <div className="home-role-head">
            <div className="home-role-kicker">Choose your access</div>
            <h2 className="home-role-title">Built for both enterprises and merchants</h2>
            <p className="home-role-subtitle">
              Start with the access flow that matches your role in the LunchPay ecosystem.
            </p>
          </div>

          <div className="home-role-grid">
            <div className="home-role-card premium-card">
              <div className="home-role-badge">Enterprise</div>
              <h3>Manage employees and wallet allocations</h3>
              <p>
                Perfect for HR, finance and company operations teams that need a
                structured employee benefits workspace.
              </p>
              <Link to="/register-company" className="btn-primary">
                Register as Enterprise
              </Link>
            </div>

            <div className="home-role-card premium-card">
              <div className="home-role-badge">Merchant</div>
              <h3>Validate QR payments and merchant activity</h3>
              <p>
                Designed for merchants who need fast validation, secure access and
                clear activity monitoring.
              </p>
              <Link to="/register-merchant" className="btn-secondary">
                Register as Merchant
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="home-bottom-strip glass-soft">
        <div className="home-strip-text">
          A premium digital benefits solution designed for{" "}
          <span className="home-strip-highlight">performance</span>,{" "}
          <span className="home-strip-highlight">security</span> and{" "}
          <span className="home-strip-highlight">elegance</span>.
        </div>

        <Link to="/register-company" className="btn-primary">
          Launch Your Company Space
        </Link>
       
      </div>
      <MainFooter />
    </div>
  );
 
}
