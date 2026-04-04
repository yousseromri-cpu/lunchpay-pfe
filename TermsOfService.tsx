import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import "./Legal.css";

export default function TermsOfService() {
  return (
    <>
      <MainNavbar />
      <div className="legal-page">
        <div className="legal-container premium-card">
          <h1>Terms of Service</h1>
          <p>
            By using LunchPay, you agree to the following terms and conditions.
          </p>

          <h2>1. Platform Usage</h2>
          <p>
            Users must provide accurate information and use the platform in
            compliance with applicable laws.
          </p>

          <h2>2. Accounts</h2>
          <p>
            Access is granted after approval. Users are responsible for maintaining
            the confidentiality of their accounts.
          </p>

          <h2>3. Responsibilities</h2>
          <p>
            LunchPay is not responsible for misuse of the platform by users.
          </p>

          <h2>4. Changes</h2>
          <p>
            We reserve the right to update these terms at any time.
          </p>
        </div>
      </div>
      <MainFooter />
    </>
  );
}