import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const ADMIN_EMAIL = "yosromry@gmail.com";
  const ADMIN_PASSWORD = "868592yo";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    navigate("/admin/dashboard");
  } else {
    alert("Invalid administrator credentials");
  }
}



  return (
    <div className="admin-login-page">
      <div className="admin-login-card premium-card">
        <div className="admin-login-badge">Admin Portal</div>

        <h1 className="admin-login-title">Administrator Access</h1>

        <p className="admin-login-subtitle">
          Sign in to access the LunchPay back-office and manage company requests,
          merchants, transactions and platform activity.
        </p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@lunchpay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary admin-login-submit">
            Login to Admin Portal
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/login" className="login-link">
            Return to public login
          </Link>
        </div>
      </div>
    </div>
  );
}