import React, { useState } from "react";

// --- Sections Array ---
// Replace or extend with your actual content as needed.
const sections = [
  {
    title: "Our Services",
    content: (
      <>
        <p>
          The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation.
        </p>
        <p>
          The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.).
        </p>
      </>
    )
  },
  {
    title: "Intellectual Property Rights",
    content: (
      <>
        <p>
          <strong>Our intellectual property:</strong> We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
        </p>
        <p>
          Our Content and Marks are protected by copyright and trademark laws and other intellectual property rights and treaties in the United States and around the world. The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
        </p>
        <p>
          <strong>Your use of our Services:</strong> Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services and download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use or internal business purpose.
        </p>
        <p>
          Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
        </p>
        <p>
          If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <a href="mailto:support@gettutorly.com" className="text-blue-400 underline">support@gettutorly.com</a>
        </p>
        <p>
          We reserve all rights not expressly granted to you in and to the Services, Content, and Marks. Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
        </p>
        <p>
          <strong>Your submissions and contributions:</strong> By sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
        </p>
      </>
    )
  },
  {
    title: "User Representations",
    content: (
      <>
        <p>
          By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not under the age of 13; (5) not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services.
        </p>
        <p>
          If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
        </p>
      </>
    )
  },
  {
    title: "User Registration",
    content: (
      <>
        <p>
          You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
        </p>
      </>
    )
  },
  {
    title: "Purchases and Payment",
    content: (
      <>
        <p>We accept the following forms of payment:</p>
        <ul className="list-disc ml-6">
          <li>Visa</li>
          <li>Mastercard</li>
          <li>American Express</li>
          <li>Discover</li>
          <li>PayPal</li>
        </ul>
        <p>
          You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
        </p>
        <p>
          You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. If your order is subject to recurring charges, then you consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until you notify us of your cancellation.
        </p>
        <p>
          We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address.
        </p>
      </>
    )
  },
  {
    title: "Subscriptions",
    content: (
      <>
        <p>
          <strong>Billing and Renewal:</strong> Your subscription will continue and automatically renew unless canceled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until you cancel.
        </p>
        <p>
          <strong>Free Trial:</strong> We offer a 4-day free trial to new users who register with the Services. The account will be charged according to the user's chosen subscription at the end of the free trial.
        </p>
        <p>
          <strong>Cancellation:</strong> You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term.
        </p>
        <p>
          <strong>Fee Changes:</strong> We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
        </p>
      </>
    )
  },
  {
    title: "Prohibited Activities",
    content: (
      <>
        <p>
          You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>
        <ul className="list-disc ml-6">
          <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
          <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
          <li>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
          <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
          <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
          <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
          <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
          <li>Engage in unauthorized framing of or linking to the Services.</li>
          <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
          <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
          <li>Delete the copyright or other proprietary rights notice from any Content.</li>
          <li>Attempt to impersonate another user or person or use the username of another user.</li>
          <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ("gifs"), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").</li>
          <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
          <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
          <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
          <li>Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
          <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
          <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.</li>
          <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
          <li>Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
          <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
          <li>Use the Services to advertise or offer to sell goods and services.</li>
          <li>Sell or otherwise transfer your profile.</li>
        </ul>
      </>
    )
  },
  // ...add all your other sections here as needed...
];

const TermsOfService: React.FC = () => {
  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({});

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 w-full flex justify-center items-start py-8 px-2">
      {/* Back to Home Page button - TOP LEFT */}
      <div className="fixed top-6 left-6 z-50">
        <a
          href="/"
          className="
            bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400
            inline-block
          "
          aria-label="Back to Home"
        >
          ← Back to Home Page
        </a>
      </div>
      <div
        className="
          w-full
          max-w-5xl
          rounded-2xl
          shadow-2xl
          bg-gradient-to-br from-gray-900 via-black to-gray-800
          border border-gray-700
          p-6 sm:p-8 md:p-12
          mt-4 mb-8
          transition-all
        "
        style={{
          boxShadow: "0 6px 40px 0 rgba(0,0,0,0.8)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 drop-shadow-lg text-white animate-fade-in">
          Terms of Service
        </h1>
        <div className="mb-8 text-gray-400 font-medium text-base animate-fade-in">
          {/* Last updated removed as requested */}
        </div>

        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-blue-400 animate-fade-in">
            Agreement to Our Legal Terms
          </h2>
          <p>
            We are <span className="font-semibold text-white">Gettutorly</span> ("Company," "we," "us," "our"), a company registered in India at BB road 12 door number, Chickaballapur, Karnataka 562101, India.
          </p>
          <p>
            We operate the website <a href="https://gettutorly.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">https://gettutorly.com/</a> (the "Site"), as well as other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
          </p>
          <p>
            GetTutorly is an AI-powered study assistant web application designed to help students learn smarter and faster. Our platform allows users to upload lecture notes, textbooks, or PDFs and interact with them using AI-powered tools.
          </p>
          <p>
            You can contact us by phone at <a href="tel:+918088362052" className="text-blue-400 underline">+91 8088362052</a>, email at <a href="mailto:support@gettutorly.com" className="text-blue-400 underline">support@gettutorly.com</a>, or by mail to BB road 12 door number, Chickaballapur, Karnataka 562101, India.
          </p>
          <p>
            These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and Gettutorly, concerning your access to and use of the Services.
          </p>
          <p>
            We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you by support@gettutorly.com.
          </p>
          <p>
            All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.
          </p>
          <p>
            We recommend that you print a copy of these Legal Terms for your records.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-300 animate-fade-in">Table of Contents</h3>
          <ol className="list-decimal ml-6 text-base sm:text-lg space-y-1 text-gray-200">
            {sections.map((section, idx) => (
              <li key={section.title}>
                {section.title}
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={`
                bg-gray-950 border border-gray-800 rounded-xl shadow-md transition-all
                ${openSections[idx] ? "ring-2 ring-blue-400" : ""}
                animate-fade-in
              `}
              style={{ overflow: "hidden" }}
            >
              <button
                className={`
                  w-full flex justify-between items-center px-5 py-4
                  font-bold text-left text-lg sm:text-xl text-blue-300
                  bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-900
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                `}
                onClick={() => toggleSection(idx)}
                aria-expanded={openSections[idx] ? "true" : "false"}
                aria-controls={`section-content-${idx}`}
              >
                <span>{section.title}</span>
                <span
                  className={`
                    transition-transform duration-300
                    ${openSections[idx] ? "rotate-180" : ""}
                  `}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
              <div
                id={`section-content-${idx}`}
                className={`
                  px-5 pt-1 pb-4 bg-black transition-all duration-300 ease-in-out
                  ${openSections[idx] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
                  text-base sm:text-lg text-gray-300
                `}
                style={{
                  transitionProperty: "max-height, opacity",
                  overflow: "hidden"
                }}
              >
                {openSections[idx] && section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
        }
        `}
      </style>
    </div>
  );
};

export default TermsOfService;
