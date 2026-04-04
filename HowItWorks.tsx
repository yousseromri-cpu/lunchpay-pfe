import { Link } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import {
  Building2,
  Store,
  Users,
  ShieldCheck,
  QrCode,
  Wallet,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import "./HowItWorks.css";

export default function HowItWorks() {
  return (
    <div className="how-page">
      <MainNavbar />

      <main className="how-main">
        <section className="how-hero premium-card">
          <div className="how-hero-content">
            <div className="how-badge">
              <span className="how-badge-dot"></span>
              How LunchPay Works
            </div>

            <h1 className="how-title">
              A smarter and more connected way
              <br />
              to manage <span className="text-gradient">meal benefits.</span>
            </h1>

            <p className="how-subtitle">
              LunchPay brings enterprises, employees and merchants into one secure
              digital ecosystem for onboarding, wallet allocation, QR payments and
              platform oversight.
            </p>

            <div className="how-actions">
              <Link to="/register-company" className="btn-primary">
                Register as Enterprise
              </Link>
              <Link to="/register-merchant" className="btn-secondary">
                Register as Merchant
              </Link>
            </div>

            <div className="how-proof">
              <div className="how-proof-pill">
                <CheckCircle2 size={15} />
                Secure onboarding
              </div>
              <div className="how-proof-pill">
                <CheckCircle2 size={15} />
                QR payment validation
              </div>
              <div className="how-proof-pill">
                <CheckCircle2 size={15} />
                Real-time monitoring
              </div>
            </div>
          </div>

          <div className="how-hero-media">
            <div className="how-video-card glass-soft">
              <div className="how-video-top">
                <span className="how-video-kicker">Product demo</span>
                <span className="how-video-live">Live flow</span>
              </div>

              <div className="how-video-frame">
                <video
                  className="how-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/images/lunchpay-dashboard-preview.png"
                >
                  <source src="/videos/lunchpay.mp4" type="video/mp4" />
                </video>

                <div className="how-video-overlay">
                  <div className="how-play-chip">
                    <PlayCircle size={16} />
                    LunchPay payment journey
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="how-tabs premium-card">
          <div className="how-section-head">
            <div className="how-section-kicker">Who it serves</div>
            <h2 className="how-section-title">Built for every actor in the chain</h2>
            <p className="how-section-subtitle">
              LunchPay is designed for structured enterprise management, smooth
              merchant validation and a better employee payment experience.
            </p>
          </div>

          <div className="how-role-grid">
            <div className="how-role-card glass-soft">
              <div className="how-role-icon">
                <Building2 size={18} />
              </div>
              <h3>For Enterprises</h3>
              <p>
                Add employees, allocate benefit budgets, track balances, manage
                quota requests and supervise company-level operations from one
                modern dashboard.
              </p>
            </div>

            <div className="how-role-card glass-soft">
              <div className="how-role-icon">
                <Store size={18} />
              </div>
              <h3>For Merchants</h3>
              <p>
                Accept QR payments instantly, validate transactions smoothly and
                manage merchant activity through a connected merchant experience.
              </p>
            </div>

            <div className="how-role-card glass-soft">
              <div className="how-role-icon">
                <Users size={18} />
              </div>
              <h3>For Employees</h3>
              <p>
                Use a digital benefits wallet, access allocated amounts and pay
                quickly in a simple and premium user flow.
              </p>
            </div>
          </div>
        </section>

        <section className="how-steps premium-card">
          <div className="how-section-head">
            <div className="how-section-kicker">How it works</div>
            <h2 className="how-section-title">From onboarding to payment</h2>
           <p className="how-section-subtitle">
  Inspired by structured merchant onboarding flows, but redesigned for
  LunchPay’s digital wallet and QR payment model.
</p>
          </div>

          <div className="how-steps-grid">
            <div className="how-step-card glass-soft">
              <div className="how-step-number">01</div>
              <h3>Request access</h3>
              <p>
                Enterprises and merchants submit onboarding requests through
                dedicated registration forms.
              </p>
            </div>

            <div className="how-step-card glass-soft">
              <div className="how-step-number">02</div>
              <h3>Admin approval</h3>
              <p>
                Platform administrators review requests and activate access only
                after validation.
              </p>
            </div>

            <div className="how-step-card glass-soft">
              <div className="how-step-number">03</div>
              <h3>Create employees</h3>
              <p>
                Companies add employee records, import lists and define monthly
                allocations.
              </p>
            </div>

            <div className="how-step-card glass-soft">
              <div className="how-step-number">04</div>
              <h3>Fund wallets</h3>
              <p>
                Employee wallets receive benefit amounts according to the
                enterprise’s distribution rules.
              </p>
            </div>

            <div className="how-step-card glass-soft">
              <div className="how-step-number">05</div>
              <h3>Validate QR payments</h3>
              <p>
                Employees pay with QR and merchants validate instantly through the
                LunchPay flow.
              </p>
            </div>

            <div className="how-step-card glass-soft">
              <div className="how-step-number">06</div>
              <h3>Track & govern</h3>
              <p>
                Companies and admins monitor transfers, requests, activity and
                platform performance in real time.
              </p>
            </div>
          </div>
        </section>

        <section className="how-benefits premium-card">
          <div className="how-section-head">
            <div className="how-section-kicker">Why LunchPay</div>
            <h2 className="how-section-title">More than a payment tool</h2>
          </div>

          <div className="how-benefits-grid">
            <div className="how-benefit-item glass-soft">
              <div className="how-benefit-icon"><ShieldCheck size={18} /></div>
              <div>
                <h3>Secure governance</h3>
                <p>Approval-based onboarding and controlled platform access.</p>
              </div>
            </div>

            <div className="how-benefit-item glass-soft">
              <div className="how-benefit-icon"><QrCode size={18} /></div>
              <div>
                <h3>Fast QR transactions</h3>
                <p>Simple payment validation built for speed and convenience.</p>
              </div>
            </div>

            <div className="how-benefit-item glass-soft">
              <div className="how-benefit-icon"><Wallet size={18} /></div>
              <div>
                <h3>Digital wallet allocation</h3>
                <p>Meal benefits distributed through structured employee wallets.</p>
              </div>
            </div>

            <div className="how-benefit-item glass-soft">
              <div className="how-benefit-icon"><BarChart3 size={18} /></div>
              <div>
                <h3>Live analytics</h3>
                <p>Track usage, transfers, quotas and approval workflows.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-faq premium-card">
          <div className="how-section-head">
            <div className="how-section-kicker">FAQ</div>
            <h2 className="how-section-title">Questions you may have</h2>
          </div>

          <div className="how-faq-list">
            <div className="how-faq-item glass-soft">
              <h3>Who can use LunchPay?</h3>
              <p>
                LunchPay is designed for enterprises, merchants, employees and
                platform administrators.
              </p>
            </div>

            <div className="how-faq-item glass-soft">
              <h3>How are accounts activated?</h3>
              <p>
                Access is granted only after admin review and approval of the
                registration request.
              </p>
            </div>

            <div className="how-faq-item glass-soft">
              <h3>How do payments work?</h3>
              <p>
                Employees use a digital benefit amount and complete merchant
                purchases through QR validation.
              </p>
            </div>
          </div>
        </section>

        <section className="how-cta premium-card">
          <div className="how-cta-content">
            <div>
              <div className="how-section-kicker">Get started</div>
              <h2 className="how-section-title">
                Bring LunchPay into your benefits workflow
              </h2>
              <p className="how-section-subtitle">
                Launch a modern employee benefits ecosystem tailored for digital
                control, payment speed and operational visibility.
              </p>
            </div>

            <div className="how-cta-actions">
              <Link to="/register-company" className="btn-primary how-cta-btn">
                Enterprise access
                <ArrowRight size={16} />
              </Link>
              <Link to="/register-merchant" className="btn-secondary how-cta-btn">
                Merchant access
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}