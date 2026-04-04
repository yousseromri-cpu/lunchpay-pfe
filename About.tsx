import { Link } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import {
  Building2,
  Store,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
} from "lucide-react";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <MainNavbar />

      <div className="about-shell">
        <section className="about-hero premium-card">
          <div className="about-hero-glow"></div>

          <div className="about-badge">
            <span className="about-badge-dot"></span>
            About LunchPay
          </div>

          <h1 className="about-title">
            A smarter way to manage
            <br />
            <span className="text-gradient">employee meal benefits.</span>
          </h1>

          <p className="about-description">
            LunchPay is a digital platform designed to modernize the management
            of employee meal benefits through a connected ecosystem linking
            companies, merchants and administrators in one seamless, secure and
            premium experience.
          </p>

          <div className="about-actions">
            <Link to="/login" className="btn-primary">
              Access Platform
            </Link>

            <Link to="/register-company" className="btn-secondary">
              Request Company Access
            </Link>
          </div>

          <div className="about-hero-proof">
            <div className="about-proof-pill">
              <CheckCircle2 size={15} />
              Secure onboarding
            </div>
            <div className="about-proof-pill">
              <CheckCircle2 size={15} />
              Enterprise control
            </div>
            <div className="about-proof-pill">
              <CheckCircle2 size={15} />
              Merchant validation
            </div>
          </div>
        </section>

        <section className="about-stats">
          <div className="about-stat-card glass-soft">
            <div className="about-stat-label">Companies</div>
            <div className="about-stat-value">120+</div>
            <div className="about-stat-sub">Growing business network</div>
          </div>

          <div className="about-stat-card glass-soft">
            <div className="about-stat-label">Transactions</div>
            <div className="about-stat-value">48K</div>
            <div className="about-stat-sub">Secure digital operations</div>
          </div>

          <div className="about-stat-card glass-soft">
            <div className="about-stat-label">Satisfaction</div>
            <div className="about-stat-value">98%</div>
            <div className="about-stat-sub">Smooth user experience</div>
          </div>

          <div className="about-stat-card glass-soft">
            <div className="about-stat-label">Platform Model</div>
            <div className="about-stat-value">B2B2C</div>
            <div className="about-stat-sub">Connected ecosystem approach</div>
          </div>
        </section>

        <section className="about-grid">
          <div className="about-card glass-soft">
            <div className="about-card-kicker">Our Mission</div>
            <h2 className="about-card-title">Simplify benefit management</h2>
            <p className="about-card-text">
              LunchPay helps companies distribute and manage meal benefits
              through a digital interface that is simpler, faster and more
              transparent than traditional methods.
            </p>
          </div>

          <div className="about-card glass-soft">
            <div className="about-card-kicker">Our Vision</div>
            <h2 className="about-card-title">A connected benefits ecosystem</h2>
            <p className="about-card-text">
              We envision a platform where employers, employees, merchants and
              administrators interact through one secure and efficient digital
              ecosystem.
            </p>
          </div>

          <div className="about-card glass-soft">
            <div className="about-card-kicker">Why LunchPay</div>
            <h2 className="about-card-title">Modern, secure and scalable</h2>
            <p className="about-card-text">
              LunchPay is built to support secure onboarding, controlled account
              approval, merchant integration, enterprise management and
              administrative oversight.
            </p>
          </div>
        </section>

        <section className="about-features premium-card">
          <div className="about-section-head">
            <div className="about-section-kicker">Platform Value</div>
            <h2 className="about-section-title">What LunchPay offers</h2>
            <p className="about-section-subtitle">
              A premium benefits platform designed for visibility, governance,
              speed and secure digital operations.
            </p>
          </div>

          <div className="about-feature-grid">
            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Building2 size={18} />
              </div>
              <div>
                <h3>For Companies</h3>
                <p>
                  Manage enterprise access, monitor employee benefit allocation,
                  submit change requests and oversee company-level operations.
                </p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Store size={18} />
              </div>
              <div>
                <h3>For Merchants</h3>
                <p>
                  Join the network, validate payments and manage merchant activity
                  through a dedicated merchant portal.
                </p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3>For Administrators</h3>
                <p>
                  Review requests, approve accounts, monitor platform activity and
                  ensure proper governance of the system.
                </p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Wallet size={18} />
              </div>
              <div>
                <h3>For the Ecosystem</h3>
                <p>
                  Create a modern digital environment where benefits management,
                  onboarding and oversight are structured and connected.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-audience premium-card">
          <div className="about-section-head">
            <div className="about-section-kicker">Who it serves</div>
            <h2 className="about-section-title">Built for every actor in the chain</h2>
          </div>

          <div className="about-audience-grid">
            <div className="about-audience-card glass-soft">
              <Users size={18} />
              <h3>Employees</h3>
              <p>Access meal benefit value through a simplified digital experience.</p>
            </div>

            <div className="about-audience-card glass-soft">
              <Building2 size={18} />
              <h3>Enterprises</h3>
              <p>Control allocations, employee management and operational visibility.</p>
            </div>

            <div className="about-audience-card glass-soft">
              <Store size={18} />
              <h3>Merchants</h3>
              <p>Validate transactions quickly and join a digital payment ecosystem.</p>
            </div>

            <div className="about-audience-card glass-soft">
              <BarChart3 size={18} />
              <h3>Administrators</h3>
              <p>Monitor requests, approvals, user flows and platform governance.</p>
            </div>
          </div>
        </section>

        <section className="about-process premium-card">
          <div className="about-section-head">
            <div className="about-section-kicker">How it works</div>
            <h2 className="about-section-title">A controlled onboarding journey</h2>
            <p className="about-section-subtitle">
              Structured onboarding keeps platform access secure, traceable and
              aligned with governance needs.
            </p>
          </div>

          <div className="about-process-grid">
            <div className="about-process-step glass-soft">
              <div className="about-step-number">01</div>
              <h3>Request access</h3>
              <p>
                Companies and merchants submit their onboarding requests through
                dedicated registration forms.
              </p>
            </div>

            <div className="about-process-step glass-soft">
              <div className="about-step-number">02</div>
              <h3>Admin review</h3>
              <p>
                The administrator reviews submitted requests before granting
                access to the platform.
              </p>
            </div>

            <div className="about-process-step glass-soft">
              <div className="about-step-number">03</div>
              <h3>Platform activation</h3>
              <p>
                Once approved, companies and merchants can log in and start
                using their dedicated spaces.
              </p>
            </div>
          </div>
        </section>

        <section className="about-cta premium-card">
          <div className="about-cta-content">
            <div>
              <div className="about-section-kicker">Get started</div>
              <h2 className="about-section-title">
                Ready to modernize your meal benefits workflow?
              </h2>
              <p className="about-section-subtitle">
                Join LunchPay and build a more connected, efficient and premium
                benefits experience.
              </p>
            </div>

            <div className="about-cta-actions">
              <Link to="/register-company" className="btn-primary about-cta-btn">
                Register as Enterprise
                <ArrowRight size={16} />
              </Link>

              <Link to="/register-merchant" className="btn-secondary about-cta-btn">
                Register as Merchant
              </Link>
            </div>
          </div>
        </section>
      </div>
      <MainFooter />
    </div>
  );
}