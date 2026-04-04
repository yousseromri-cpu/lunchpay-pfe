import { Link, Outlet, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Company Requests", path: "/admin/company-requests" },
  { label: "Merchant Requests", path: "/admin/merchant-requests" },
  { label: "Employee Count Requests", path: "/admin/employee-count-requests" },
  { label: "Companies", path: "/admin/companies" },
  { label: "Merchants", path: "/admin/merchants" },
  { label: "Transactions", path: "/admin/transactions" },
  { label: "Prediction System", path: "/admin/predictions" },
  { label: "Reports", path: "/admin/reports" },
  { label: "Settings", path: "/admin/settings" },
];


export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>Lunch</span>Pay
        </div>

        <div className="admin-sidebar-badge">Admin Back-office</div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/admin/login" className="admin-logout-btn">
            Logout
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-topbar-kicker">LunchPay Platform</div>
            <h1 className="admin-topbar-title">Administration Portal</h1>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-topbar-chip">System status: Active</div>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}