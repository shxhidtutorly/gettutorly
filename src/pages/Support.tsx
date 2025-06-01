import React, { useState } from "react";

const faqs = [
  {
    question: "How do I upload my study materials?",
    answer:
      "Simply drag and drop or click to upload your PDFs, lecture notes, or textbooks. GetTutorly supports multiple file formats and will process your documents to create summaries and more.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support PDF, DOCX, TXT, and image files (JPG, PNG). Our AI can extract text from images and process various document layouts for optimal study assistance.",
  },
  {
    question: "How accurate are the AI summaries?",
    answer:
      "Our AI provides highly accurate summaries by analyzing the key concepts and main points in your materials. However, we always recommend reviewing the original content for critical details.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Yes, we take privacy seriously. Your uploaded documents are encrypted and securely stored. We never share your content with third parties and you can delete your data at any time.",
  },
  {
    question: "How to Cancel Your Tutorly Subscription?",
    answer: (
      <span>
        <strong>Steps to Cancel Your Subscription:</strong>
        <br />
        <br />
        Follow these steps on your iPhone or iPad:
        <br />
        1. <strong>Open the Settings</strong> – Locate and tap the Settings app on your device.
        <br />
        2. <strong>Access Your Apple ID</strong> – Tap your name at the top of the Settings screen to open your Apple ID settings.
        <br />
        3. <strong>Go to Subscriptions</strong> – Select <strong>Subscriptions</strong> from the list of options.
        <br />
        4. <strong>Find Your Tutorly Subscription</strong> – Scroll through your active subscriptions and tap on Tutorly.
        <br />
        5. <strong>Cancel Subscription</strong> – Tap <strong>Cancel Subscription</strong> and confirm your cancellation when prompted.
        <br />
        <br />
        We're sorry to see you go, but if you ever decide to return, we'd be happy to welcome you back!
        <br />
        <br />
        <em>Related to: Subscription Management & Cancellation</em>
      </span>
    ),
  },
];

const Support: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white" }}>
          Get Help & Support
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#cbd5e1", maxWidth: 600, margin: "0 auto" }}>
          We're here to help you make the most of your GetTutorly experience. Whether you have questions, need technical support, or want to share feedback, we've got you covered.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Contact Card */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: "rgba(30, 30, 46, 0.9)",
            borderRadius: 24,
            padding: "2rem",
            boxShadow: "0 10px 32px rgba(0,0,0,0.2)",
            border: "1px solid rgba(138, 43, 226, 0.2)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.3rem", color: "white" }}>
            Contact Us
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "rgba(138, 43, 226, 0.10)",
                borderRadius: 16,
                padding: "1rem",
                cursor: "pointer",
              }}
              onClick={() => window.location.href = "mailto:support@gettutorly.com"}
            >
              <span role="img" aria-label="mail" style={{ fontSize: 24 }}>📧</span>
              <div>
                <b>Email Support</b>
                <div>
                  <a href="mailto:support@gettutorly.com" style={{ color: "#8a2be2", textDecoration: "none" }}>
                    support@gettutorly.com
                  </a>
                </div>
                <div style={{ fontSize: "0.95rem", color: "#cbd5e0" }}>We typically respond within 24 hours</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "rgba(138, 43, 226, 0.10)",
                borderRadius: 16,
                padding: "1rem",
                cursor: "pointer",
              }}
              onClick={() => window.open("https://www.instagram.com/gettutorly", "_blank")}
            >
              <span role="img" aria-label="instagram" style={{ fontSize: 24 }}>📱</span>
              <div>
                <b>Follow Us</b>
                <div>
                  <a
                    href="https://www.instagram.com/gettutorly"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#8a2be2", textDecoration: "none" }}
                  >
                    @gettutorly
                  </a>
                </div>
                <div style={{ fontSize: "0.95rem", color: "#cbd5e0" }}>Updates, tips, and community support</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Card */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: "rgba(30, 30, 46, 0.9)",
            borderRadius: 24,
            padding: "2rem",
            boxShadow: "0 10px 32px rgba(0,0,0,0.2)",
            border: "1px solid rgba(138, 43, 226, 0.2)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.3rem", color: "white" }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ marginBottom: "1.2rem" }}>
              <div
                style={{
                  background: "rgba(138, 43, 226, 0.10)",
                  borderRadius: 10,
                  padding: "0.9rem 1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span>{faq.question}</span>
                <span style={{
                  fontSize: 18,
                  transform: openIndex === idx ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                  marginLeft: 10,
                }}>▼</span>
              </div>
              {openIndex === idx && (
                <div
                  style={{
                    background: "rgba(30, 30, 46, 0.8)",
                    color: "#cbd5e0",
                    borderRadius: "0 0 10px 10px",
                    padding: "1rem 1.2rem",
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "rgba(30, 30, 46, 0.9)",
          borderRadius: 16,
          padding: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          color: "#f8fafc",
          fontWeight: 500,
          marginTop: "2rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            background: "#22c55e",
            borderRadius: "50%",
            marginRight: 10,
            animation: "pulse 2s infinite",
          }}
        />
        <span>All systems operational – GetTutorly is running smoothly</span>
      </div>
    </div>
  );
};

export default Support;
