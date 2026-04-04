import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
import "./ForgotPassword.css";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      alert("Please enter your email or phone number.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-bg-grid"></div>
        <div className="forgot-password-bg-noise"></div>

        <div className="forgot-password-success premium-card">
          <div className="forgot-password-success-badge">
            <span className="forgot-password-success-dot"></span>
            Recovery request sent
          </div>

          <h1 className="forgot-password-success-title">
            Password reset instructions have been prepared.
          </h1>

          <p className="forgot-password-success-text">
            If an approved account is linked to the information you entered, you will
            receive the next steps to reset your password.
          </p>

          <p className="forgot-password-success-text">
            Please check your inbox or messages and follow the verification flow.
          </p>

          <div className="forgot-password-success-actions">
            <Link to="/login" className="btn-primary">
              Back to Login
            </Link>

            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="forgot-password-page">
        <MainNavbar />
      <div className="forgot-password-bg-grid"></div>
      <div className="forgot-password-bg-noise"></div>

          <div className="forgot-password-main">
      <div className="forgot-password-shell">
        <section className="forgot-password-left premium-card">
          <div className="forgot-password-brand">
            <span>Lunch</span>Pay
          </div>

          <div className="forgot-password-badge">
            <span className="forgot-password-badge-dot"></span>
            Secure account recovery
          </div>

          <h1 className="forgot-password-title">
            Reset access to
            <br />
            <span className="text-gradient">your account.</span>
          </h1>

          <p className="forgot-password-description">
            Recover your LunchPay access through a secure password reset flow
            designed for approved enterprise and merchant accounts.
          </p>

          <div className="forgot-password-info-grid">
            <div className="forgot-password-info-card glass-soft">
              <div className="forgot-password-info-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="forgot-password-info-kicker">Security</div>
                <div className="forgot-password-info-title">Protected recovery</div>
                <div className="forgot-password-info-text">
                  Reset requests follow a secure verification process before access
                  can be restored.
                </div>
              </div>
            </div>

            <div className="forgot-password-info-card glass-soft">
              <div className="forgot-password-info-icon">
                <KeyRound size={18} />
              </div>
              <div>
                <div className="forgot-password-info-kicker">Recovery</div>
                <div className="forgot-password-info-title">Fast next steps</div>
                <div className="forgot-password-info-text">
                  Enter your approved email or phone number to start the recovery flow.
                </div>
              </div>
            </div>

            <div className="forgot-password-info-card glass-soft">
              <div className="forgot-password-info-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="forgot-password-info-kicker">Experience</div>
                <div className="forgot-password-info-title">Simple and modern</div>
                <div className="forgot-password-info-text">
                  A clean premium interface built to keep account recovery clear and easy.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="forgot-password-form-panel premium-card">
          <div className="forgot-password-form-head">
            <div className="forgot-password-form-kicker">Password recovery</div>
            <h2 className="forgot-password-form-title">Forgot password?</h2>
            <p className="forgot-password-form-subtitle">
              Enter your approved work email or phone number to continue.
            </p>
          </div>

          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <div className="forgot-password-field">
              <label>Email or phone</label>

              <div className="forgot-password-input-wrap">
                <Mail size={16} className="forgot-password-input-icon-svg" />
                <input
                  type="text"
                  placeholder="name@company.com or +216..."
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="forgot-password-note">
              For security reasons, recovery instructions are sent only for valid
              approved accounts registered on the platform.
            </div>

            <button type="submit" className="btn-primary forgot-password-submit">
              Send recovery instructions
            </button>
          </form>

          <div className="forgot-password-footer">
            <Link to="/login" className="forgot-password-back-link">
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </section>
      </div>
      </div>
      <MainFooter />
    </div>
  );
}