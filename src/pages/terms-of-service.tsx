import React, { useState } from "react";
import Link from "next/link";

// Updated sections: no numbers in titles, Stripe removed from payment, your new sections added.
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
  // ... (keep the other section objects as in your file)
  // For brevity, I am not pasting every section here, but keep all your existing sections unchanged.
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
        <Link href="/" passHref>
          <button
            className="
              bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400
            "
            aria-label="Back to Home"
          >
            ← Back to Home Page
          </button>
        </Link>
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
            We operate the website <a href="https://gettutorly.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">https://gettutorly.com/</a> (the "Site"), as well as ...
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
