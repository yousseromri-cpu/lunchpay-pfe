import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import "./Legal.css";

export default function PrivacyPolicy() {
  return (
    <>
      <MainNavbar />
      <div className="legal-page">
        <div className="legal-container premium-card">
          <h1>Privacy Policy</h1>
          <p>
            This Privacy Policy explains how LunchPay collects, uses, and protects
            your information when you use our platform.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information such as name, email, company details and usage
            data to provide and improve our services.
          </p>

          <h2>2. How We Use Data</h2>
          <p>
            Your data is used to manage accounts, process transactions, and ensure
            platform security.
          </p>

          <h2>3. Data Protection</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your data.
          </p>

          <h2>4. Contact</h2>
          <p>Email: support@lunchpay.com</p>
        </div>
      </div>
      <MainFooter />
    </>
  );
}