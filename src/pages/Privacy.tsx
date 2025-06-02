import React, { useState } from "react";
import Link from "next/link";

const sections = [
  {
    title: "WHAT INFORMATION DO WE COLLECT?",
    content: (
      <>
        <p className="mb-2 font-semibold">Personal information you disclose to us</p>
        <p className="mb-2">
          <strong>In Short:</strong> We collect personal information that you provide to us.
        </p>
        <p className="mb-2">
          We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
        </p>
        <p className="mb-2">
          <strong>Sensitive Information.</strong> We do not process sensitive information.
        </p>
        <p className="mb-2">
          All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
        </p>
        <p className="mb-4 font-semibold">Information automatically collected</p>
        <p className="mb-2">
          <strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.
        </p>
        <p className="mb-2">
          We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.
        </p>
        <p>
          Like many businesses, we also collect information through cookies and similar technologies.
        </p>
      </>
    ),
  },
  {
    title: "HOW DO WE PROCESS YOUR INFORMATION?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
        </p>
        <p>
          We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-300">
          <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
          <li>To deliver and facilitate delivery of services to the user.</li>
          <li>To respond to user inquiries/offer support to users.</li>
          <li>To send administrative information to you.</li>
          <li>To fulfill and manage your orders.</li>
          <li>To enable user-to-user communications.</li>
          <li>To request feedback.</li>
          <li>To protect our Services.</li>
          <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
          <li>To respond to legal requests and prevent harm.</li>
          <li>For other business purposes such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Services, products, marketing and your experience.</li>
        </ul>
      </>
    ),
  },
  {
    title: "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.
        </p>
        <p className="mb-2">
          We may need to share your personal information in the following situations:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-300">
          <li>
            <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
          </li>
          <li>
            <strong>Affiliates:</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.
          </li>
          <li>
            <strong>Business Partners:</strong> We may share your information with our business partners to offer you certain products, services, or promotions.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.
        </p>
        <p className="mb-2">
          We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
        </p>
        <p className="mb-2">
          We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.
        </p>
        <p>
          Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
        </p>
      </>
    ),
  },
  {
    title: "HOW DO WE HANDLE YOUR SOCIAL LOGINS?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.
        </p>
        <p>
          Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.
        </p>
        <p>
          We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.
        </p>
      </>
    ),
  },
  {
    title: "IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> We may transfer, store, and process your information in countries other than your own.
        </p>
        <p className="mb-2">
          Our servers are located in. If you are accessing our Services from outside, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information (see "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?" above), in and other countries.
        </p>
        <p>
          If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Notice and applicable law.
        </p>
      </>
    ),
  },
  {
    title: "HOW LONG DO WE KEEP YOUR INFORMATION?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.
        </p>
        <p>
          We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
        </p>
        <p>
          When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
        </p>
      </>
    ),
  },
  {
    title: "DO WE COLLECT INFORMATION FROM MINORS?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.
        </p>
        <p>
          We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at <span className="italic">[contact information]</span>.
        </p>
      </>
    ),
  },
  {
    title: "WHAT ARE YOUR PRIVACY RIGHTS?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.
        </p>
        <p>
          <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.
        </p>
        <p>
          However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
        </p>
        <p className="mt-4 mb-2 font-semibold">Account Information</p>
        <p>
          If you would at any time like to review or change the information in your account or terminate your account, you can:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-300">
          <li>Log into your account settings and update your user account.</li>
          <li>Contact us using the contact information provided.</li>
        </ul>
        <p className="mt-2">
          Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
        </p>
      </>
    ),
  },
  {
    title: "CONTROLS FOR DO-NOT-TRACK FEATURES",
    content: (
      <>
        <p>
          Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.
        </p>
      </>
    ),
  },
  {
    title: "DO WE MAKE UPDATES TO THIS NOTICE?",
    content: (
      <>
        <p className="mb-2">
          <strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.
        </p>
        <p>
          We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.
        </p>
      </>
    ),
  },
  {
    title: "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?",
    content: (
      <>
        <p>
          If you have questions or comments about this notice, you may contact us by post at:
        </p>
        <address className="mt-2 not-italic">
          <span className="block">__________</span>
          <span className="block">__________</span>
          <span className="block">__________</span>
        </address>
      </>
    ),
  },
  {
    title: "HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?",
    content: (
      <>
        <p>
          Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a data subject access request.
        </p>
      </>
    ),
  },
];

const PrivacyPage: React.FC = () => {
  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({});

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
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
          PRIVACY NOTICE
        </h1>
        <div className="mb-8 text-gray-400 font-medium text-base animate-fade-in">
          Last updated 02/06/2025
        </div>

        <section className="mb-10">
          <p className="mb-3">
            This Privacy Notice describes how and why GetTutorly ("Company," "we," "us," or "our") may access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services") including when you:
          </p>
          <p className="mb-3">
            <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.
          </p>
        </section>

        {/* Table of Contents */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-blue-400 animate-fade-in">
            TABLE OF CONTENTS
          </h2>
          <ol className="list-decimal ml-6 text-base sm:text-lg space-y-1 text-gray-200">
            {sections.map((section, idx) => (
              <li key={section.title}>{section.title}</li>
            ))}
          </ol>
        </section>

        {/* Sections */}
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

export default PrivacyPage;
