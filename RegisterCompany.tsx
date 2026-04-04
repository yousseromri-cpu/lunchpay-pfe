import { useState } from "react";
import { Link } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import { createCompanyRequest } from "../../services/platformStore";
import "./RegisterCompany.css";

type CompanyRequestForm = {
  companyName: string;
  sector: string;
  contactName: string;
  workEmail: string;
  phone: string;
  country: string;
  city: string;
  employeesCount: string;
  password: string;
  message: string;
};

export default function RegisterCompany() {
  const [form, setForm] = useState<CompanyRequestForm>({
    companyName: "",
    sector: "",
    contactName: "",
    workEmail: "",
    phone: "",
    country: "",
    city: "",
    employeesCount: "",
    password: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createCompanyRequest(form);
    setSubmitted(true);
  }

  return (
    <div className="register-company-page">
      <MainNavbar />

      <div className="register-company-main">
        {submitted ? (
          <div className="register-company-success premium-card">
            <div className="register-company-success-badge">
              <span className="register-company-success-dot"></span>
              Request submitted
            </div>

            <h1 className="register-company-success-title">
              Your company request has been sent successfully.
            </h1>

            <p className="register-company-success-text">
              Your company application is now pending admin approval.
            </p>

            <p className="register-company-success-text">
              Once approved, you will be able to log in with the email and password
              you provided.
            </p>

            <div className="register-company-success-actions">
              <Link to="/login" className="btn-primary">
                Back to Login
              </Link>

              <Link to="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="register-company-shell">
            <section className="register-company-left premium-card">
              <div className="register-company-brand">
                <span>Lunch</span>Pay
              </div>

              <div className="register-company-badge">
                <span className="register-company-badge-dot"></span>
                Company access request
              </div>

              <h1 className="register-company-title">
                Request access for
                <br />
                <span className="text-gradient">your company.</span>
              </h1>

              <p className="register-company-description">
                Submit your company information to request access to the LunchPay
                enterprise platform.
              </p>


<div className="register-company-info-grid">
  <div className="register-company-info-card glass-soft">
    <div className="register-company-info-kicker">Step 1</div>
    <div className="register-company-info-title">
      Submit your company profile
    </div>
    <div className="register-company-info-text">
      Share your company details and contact information through
      the registration form.
    </div>
  </div>

  <div className="register-company-info-card glass-soft">
    <div className="register-company-info-kicker">Step 2</div>
    <div className="register-company-info-title">Admin review</div>
    <div className="register-company-info-text">
      Your request is reviewed before enterprise platform access is
      activated.
    </div>
  </div>

  <div className="register-company-info-card glass-soft">
    <div className="register-company-info-kicker">Step 3</div>
    <div className="register-company-info-title">
      Start managing benefits
    </div>
    <div className="register-company-info-text">
      Once approved, you can log in and manage employees and allocations.
    </div>
  </div>
</div>
            </section>

            <section className="register-company-form-panel premium-card">
              <div className="register-company-form-head">
                <div className="register-company-form-kicker">
                  Company onboarding
                </div>
                <h2 className="register-company-form-title">
                  Request company access
                </h2>
                <p className="register-company-form-subtitle">
                  Complete the form below. Access is activated only after admin approval.
                </p>
              </div>

              <form className="register-company-form" onSubmit={handleSubmit}>
                <div className="register-company-grid two-cols">
                  <div className="register-company-field">
                    <label>Company name</label>
                    <input
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-company-field">
                    <label>Sector</label>
                    <select
                      name="sector"
                      value={form.sector}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a sector</option>
                      <option value="Technology">Technology</option>
                      <option value="Retail">Retail</option>
                      <option value="Industry">Industry</option>
                      <option value="Energy">Energy</option>
                      <option value="Services">Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="register-company-grid two-cols">
                  <div className="register-company-field">
                    <label>Contact person</label>
                    <input
                      name="contactName"
                      value={form.contactName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-company-field">
                    <label>Work email</label>
                    <input
                      type="email"
                      name="workEmail"
                      value={form.workEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="register-company-grid two-cols">
                  <div className="register-company-field">
                    <label>Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-company-field">
                    <label>Number of employees</label>
                    <input
                      type="number"
                      name="employeesCount"
                      value={form.employeesCount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="register-company-grid two-cols">
                  <div className="register-company-field">
                    <label>Country</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-company-field">
                    <label>City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="register-company-field">
                  <label>Create password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create your future login password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-company-field">
                  <label>Message (optional)</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-company-note">
                  Your request will be stored with status <strong>PENDING</strong>.
                  You will only be able to log in after admin approval.
                </div>

                <button
                  type="submit"
                  className="btn-primary register-company-submit"
                >
                  Submit company request
                </button>
              </form>

              <div className="register-company-footer">
                Already have access?{" "}
                <Link to="/login" className="login-link">
                  Return to login
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>

      <MainFooter />
    </div>
  );
}