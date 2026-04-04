import { useState } from "react";
import { Link } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import { createMerchantRequest } from "../../services/platformStore";
import "./RegisterMerchant.css";

type MerchantRequestForm = {
  merchantName: string;
  category: string;
  contactName: string;
  workEmail: string;
  phone: string;
  country: string;
  city: string;
  branchesCount: string;
  password: string;
  message: string;
};

const MERCHANT_CATEGORIES = [
  "Restaurant",
  "Supermarket",
  "Cafe",
  "Bakery",
  "Food Service",
  "Clothing Store",
  "Fashion Boutique",
  "Shoe Store",
  "Accessories Store",
  "Cosmetics Store",
  "Perfume Store",
  "Pharmacy",
  "Bookstore",
  "Electronics Store",
  "Home Goods Store",
  "Convenience Store",
  "Retail Store",
  "Other",
];

export default function RegisterMerchant() {
  const [form, setForm] = useState<MerchantRequestForm>({
    merchantName: "",
    category: "",
    contactName: "",
    workEmail: "",
    phone: "",
    country: "",
    city: "",
    branchesCount: "",
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
    createMerchantRequest(form);
    setSubmitted(true);
  }

  return (
    <div className="register-merchant-page">
      <MainNavbar />

      <div className="register-merchant-main">
        {submitted ? (
          <div className="register-merchant-success premium-card">
            <div className="register-merchant-success-badge">
              <span className="register-merchant-success-dot"></span>
              Request submitted
            </div>

            <h1 className="register-merchant-success-title">
              Your merchant request has been received.
            </h1>

            <p className="register-merchant-success-text">
              Thank you for your interest in LunchPay. Your merchant application
              has been submitted successfully and is now pending admin review.
            </p>

            <p className="register-merchant-success-text">
              Once your request is approved, you will be able to log in with the
              email and password you provided.
            </p>

            <div className="register-merchant-success-actions">
              <Link to="/login" className="btn-primary">
                Back to Login
              </Link>

              <Link to="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="register-merchant-shell">
            <section className="register-merchant-left premium-card">
              <div className="register-merchant-brand">
                <span>Lunch</span>Pay
              </div>

              <div className="register-merchant-badge">
                <span className="register-merchant-badge-dot"></span>
                Merchant onboarding request
              </div>

              <h1 className="register-merchant-title">
                Join LunchPay
                <br />
                <span className="text-gradient">as a merchant.</span>
              </h1>

              <p className="register-merchant-description">
                LunchPay connects merchants to companies and employees through a
                modern digital benefits ecosystem.
              </p>

              <p className="register-merchant-description">
                Submit your merchant profile to request access to the LunchPay
                merchant portal. Each application is reviewed before activation.
              </p>

              <div className="register-merchant-info-grid">
                <div className="register-merchant-info-card glass-soft">
                  <div className="register-merchant-info-kicker">Step 1</div>
                  <div className="register-merchant-info-title">
                    Submit your merchant profile
                  </div>
                  <div className="register-merchant-info-text">
                    Share your business details and contact information through
                    the registration form.
                  </div>
                </div>

                <div className="register-merchant-info-card glass-soft">
                  <div className="register-merchant-info-kicker">Step 2</div>
                  <div className="register-merchant-info-title">Admin review</div>
                  <div className="register-merchant-info-text">
                    Your request is reviewed before merchant portal access is
                    activated.
                  </div>
                </div>

                <div className="register-merchant-info-card glass-soft">
                  <div className="register-merchant-info-kicker">Step 3</div>
                  <div className="register-merchant-info-title">
                    Start accepting payments
                  </div>
                  <div className="register-merchant-info-text">
                    Once approved, you can log in and validate LunchPay payments.
                  </div>
                </div>
              </div>
            </section>

            <section className="register-merchant-form-panel premium-card">
              <div className="register-merchant-form-head">
                <div className="register-merchant-form-kicker">
                  Merchant application
                </div>
                <h2 className="register-merchant-form-title">
                  Request merchant access
                </h2>
                <p className="register-merchant-form-subtitle">
                  Complete the form below. Your merchant account will be activated
                  only after admin approval.
                </p>
              </div>

              <form className="register-merchant-form" onSubmit={handleSubmit}>
                <div className="register-merchant-grid two-cols">
                  <div className="register-merchant-field">
                    <label htmlFor="merchantName">Merchant name</label>
                    <input
                      id="merchantName"
                      type="text"
                      name="merchantName"
                      placeholder="Enter merchant name"
                      value={form.merchantName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-merchant-field">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {MERCHANT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="register-merchant-grid two-cols">
                  <div className="register-merchant-field">
                    <label htmlFor="contactName">Contact person</label>
                    <input
                      id="contactName"
                      type="text"
                      name="contactName"
                      placeholder="Full name"
                      value={form.contactName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-merchant-field">
                    <label htmlFor="workEmail">Work email</label>
                    <input
                      id="workEmail"
                      type="email"
                      name="workEmail"
                      placeholder="name@merchant.com"
                      value={form.workEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="register-merchant-grid two-cols">
                  <div className="register-merchant-field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      placeholder="+216..."
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-merchant-field">
                    <label htmlFor="branchesCount">Number of branches</label>
                    <input
                      id="branchesCount"
                      type="number"
                      name="branchesCount"
                      placeholder="e.g. 3"
                      value={form.branchesCount}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="register-merchant-grid two-cols">
                  <div className="register-merchant-field">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={form.country}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-merchant-field">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      placeholder="City"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="register-merchant-field">
                  <label htmlFor="password">Create password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Create your future login password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-merchant-field">
                  <label htmlFor="message">Message (optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us more about your business..."
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-merchant-note">
                  Your request will be stored with status <strong>PENDING</strong>.
                  You will only be able to log in after admin approval.
                </div>

                <button
                  type="submit"
                  className="btn-primary register-merchant-submit"
                >
                  Submit merchant request
                </button>
              </form>

              <div className="register-merchant-footer">
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