import { useState } from "react";
import { Link } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import MainFooter from "../../components/MainFooter";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Contact form submitted:", form);
    setSubmitted(true);
  }

  return (
    <div className="contact-page">
       <MainNavbar />
      <div className="contact-shell">
        <section className="contact-left premium-card">
          <div className="contact-badge">
            <span className="contact-badge-dot"></span>
            Contact LunchPay
          </div>

          <h1 className="contact-title">
            Let’s discuss your
            <br />
            <span className="text-gradient">LunchPay needs.</span>
          </h1>

          <p className="contact-description">
            Whether you are a company exploring digital meal benefits, a
            merchant interested in joining the LunchPay ecosystem, or a partner
            looking for more information, we would be glad to hear from you.
          </p>

          <div className="contact-info-grid">
            <div className="contact-info-card glass-soft">
              <div className="contact-info-kicker">General inquiries</div>
              <div className="contact-info-value">contact@lunchpay.com</div>
            </div>

            <div className="contact-info-card glass-soft">
              <div className="contact-info-kicker">Business onboarding</div>
              <div className="contact-info-value">partners@lunchpay.com</div>
            </div>

            <div className="contact-info-card glass-soft">
              <div className="contact-info-kicker">Location</div>
              <div className="contact-info-value">Tunis, Tunisia</div>
            </div>
          </div>

          <div className="contact-links">
            <Link to="/register-company" className="btn-secondary">
              Request Company Access
            </Link>

            <Link to="/register-merchant" className="btn-secondary">
              Request Merchant Access
            </Link>
          </div>
        </section>

        <section className="contact-form-panel premium-card">
          {!submitted ? (
            <>
              <div className="contact-form-head">
                <div className="contact-form-kicker">Send a message</div>
                <h2 className="contact-form-title">Get in touch</h2>
                <p className="contact-form-subtitle">
                  Fill out the form below and we will get back to you.
                </p>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-grid two-cols">
                  <div className="contact-field">
                    <label htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-grid two-cols">
                  <div className="contact-field">
                    <label htmlFor="company">Company / Organization</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Company name"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Write your message..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary contact-submit">
                  Send Message
                </button>
              </form>
            </>
          ) : (
            <div className="contact-success">
              <div className="contact-badge">
                <span className="contact-badge-dot"></span>
                Message sent
              </div>

              <h2 className="contact-form-title">Thank you for contacting us.</h2>
              <p className="contact-form-subtitle">
                Your message has been recorded successfully. We will get back to
                you as soon as possible.
              </p>

              <div className="contact-success-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      fullName: "",
                      email: "",
                      company: "",
                      subject: "",
                      message: "",
                    });
                  }}
                >
                  Send another message
                </button>

                <Link to="/" className="btn-secondary">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
      <MainFooter />
    </div>
  );
}