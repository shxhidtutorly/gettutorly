import React, { useState } from "react";

const sections = [
  {
    title: "1. Our Services",
    content: (
      <>
        <p>
          The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
        </p>
        <p>
          The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
        </p>
      </>
    )
  },
  {
    title: "2. Intellectual Property Rights",
    content: (
      <>
        <p>
          <strong>Our intellectual property:</strong> We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
        </p>
        <p>
          Our Content and Marks are protected by copyright and trademark laws and other intellectual property rights and treaties in the United States and around the world. The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use only.
        </p>
        <p>
          <strong>Your use of our Services:</strong> Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services and download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use.
        </p>
        <p>
          Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
        </p>
        <p>
          If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <a href="mailto:support@gettutorly.com" className="text-blue-600 underline">support@gettutorly.com</a>.
        </p>
        <p>
          We reserve all rights not expressly granted to you in and to the Services, Content, and Marks. Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
        </p>
        <p>
          <strong>Your submissions and contributions:</strong> By sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission.
        </p>
      </>
    )
  },
  {
    title: "3. User Representations",
    content: (
      <>
        <p>
          By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services; (5) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.
        </p>
        <p>
          If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
        </p>
      </>
    )
  },
  {
    title: "4. User Registration",
    content: (
      <>
        <p>
          You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
        </p>
      </>
    )
  },
  {
    title: "5. Purchases and Payment",
    content: (
      <>
        <p>We accept the following forms of payment:</p>
        <ul className="list-disc ml-6">
          <li>Visa</li>
          <li>Mastercard</li>
          <li>American Express</li>
          <li>Discover</li>
          <li>PayPal</li>
          <li>Stripe</li>
        </ul>
        <p>
          You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in US dollars.
        </p>
        <p>
          You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
        </p>
        <p>
          We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.
        </p>
      </>
    )
  },
  {
    title: "6. Subscriptions",
    content: (
      <>
        <p>
          <strong>Billing and Renewal:</strong> Your subscription will continue and automatically renew unless canceled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order. The length of your billing cycle is monthly.
        </p>
        <p>
          <strong>Free Trial:</strong> We offer a 4-day free trial to new users who register with the Services. The account will be charged according to the user's chosen subscription at the end of the free trial.
        </p>
        <p>
          <strong>Cancellation:</strong> You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at support@gettutorly.com.
        </p>
        <p>
          <strong>Fee Changes:</strong> We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
        </p>
      </>
    )
  },
  {
    title: "7. Prohibited Activities",
    content: (
      <>
        <p>
          You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>
        <p>As a user of the Services, you agree not to:</p>
        <ul className="list-disc ml-6">
          <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
          <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
          <li>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
          <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
          <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
          <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
          <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
          <li>Engage in unauthorized framing of or linking to the Services.</li>
          <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
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
  {
    title: "8. User Generated Contributions",
    content: (
      <>
        <p>
          The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
        </p>
        <ul className="list-disc ml-6">
          <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
          <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
          <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
          <li>Your Contributions are not false, inaccurate, or misleading.</li>
          <li>Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
          <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</li>
          <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
          <li>Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</li>
          <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
          <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
          <li>Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
          <li>Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</li>
          <li>Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</li>
        </ul>
        <p>
          Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.
        </p>
      </>
    )
  },
  // ... Continue with sections 9 through 27 in the same style ...
  // For brevity, please copy your text for sections 9-27 and format as above.
  {
    title: "27. Contact Us",
    content: (
      <>
        <p>
          In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
        </p>
        <div className="mt-2">
          <div>Gettutorly</div>
          <div>BB road 12 door number</div>
          <div>Chickaballapur, Karnataka 562101</div>
          <div>India</div>
          <div>Phone: <a href="tel:+918088362052" className="text-blue-600 underline">+91 8088362052</a></div>
          <div>Email: <a href="mailto:support@gettutorly.com" className="text-blue-600 underline">support@gettutorly.com</a></div>
        </div>
      </>
    )
  }
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
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <div className="mb-6 text-gray-600">Last updated June 07, 2025</div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Agreement to Our Legal Terms</h2>
        <p>
          We are <strong>Gettutorly</strong> ("Company," "we," "us," "our"), a company registered in India at BB road 12 door number, Chickaballapur, Karnataka 562101.
        </p>
        <p>
          We operate the website <a href="https://gettutorly.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://gettutorly.com/</a> (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
        </p>
        <p>
          GetTutorly is an AI-powered study assistant web application designed to help students learn smarter and faster. Our platform allows users to upload lecture notes, textbooks, or PDFs and instantly receive high-quality summaries, flashcards, quizzes, and personalized tutoring assistance—all powered by advanced AI models. Tutorly supports: AI-generated study tools (notes, flashcards, quizzes), file upload for instant document summarization, smart Q&amp;A to clarify difficult concepts, personalized tutoring using AI, and a clean, distraction-free interface designed for learners. Whether you're preparing for exams or reviewing lectures, Tutorly helps break down complex material into digestible, engaging formats saving time while improving retention. We are committed to providing students with an affordable, reliable, and easy-to-use learning companion.
        </p>
        <p>
          You can contact us by phone at <a href="tel:+918088362052" className="text-blue-600 underline">+91 8088362052</a>, email at <a href="mailto:support@gettutorly.com" className="text-blue-600 underline">support@gettutorly.com</a>, or by mail to BB road 12 door number, Chickaballapur, Karnataka 562101, India.
        </p>
        <p>
          These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and Gettutorly, concerning your access to and use of the Services. By accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>If you do not agree with all of these Legal Terms, you are expressly prohibited from using the Services and you must discontinue use immediately.</strong>
        </p>
        <p>
          We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you by support@gettutorly.com. By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.
        </p>
        <p>
          All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.
        </p>
        <p>
          We recommend that you print a copy of these Legal Terms for your records.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Table of Contents</h3>
        <ol className="list-decimal ml-6">
          {sections.map((section, idx) => (
            <li key={section.title}>{section.title}</li>
          ))}
        </ol>
      </section>

      {sections.map((section, idx) => (
        <div key={section.title} className="mb-4 border rounded">
          <button
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-left"
            onClick={() => toggleSection(idx)}
            aria-expanded={openSections[idx] ? "true" : "false"}
            aria-controls={`section-content-${idx}`}
          >
            {section.title}
            <span>{openSections[idx] ? "▲" : "▼"}</span>
          </button>
          {openSections[idx] && (
            <div id={`section-content-${idx}`} className="px-4 py-3 bg-white border-t text-sm">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TermsOfService;
