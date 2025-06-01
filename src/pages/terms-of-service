import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

interface TableOfContentsItem {
  id: string;
  title: string;
  number: number;
}

interface TermsOfServiceProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showAcceptButtons?: boolean;
  className?: string;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({
  onAccept,
  onDecline,
  showAcceptButtons = true,
  className = ""
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [showTableOfContents, setShowTableOfContents] = useState<boolean>(true);

  const tableOfContents: TableOfContentsItem[] = [
    { id: 'our-services', title: 'OUR SERVICES', number: 1 },
    { id: 'intellectual-property', title: 'INTELLECTUAL PROPERTY RIGHTS', number: 2 },
    { id: 'user-representations', title: 'USER REPRESENTATIONS', number: 3 },
    { id: 'user-registration', title: 'USER REGISTRATION', number: 4 },
    { id: 'purchases-payment', title: 'PURCHASES AND PAYMENT', number: 5 },
    { id: 'subscriptions', title: 'SUBSCRIPTIONS', number: 6 },
    { id: 'prohibited-activities', title: 'PROHIBITED ACTIVITIES', number: 7 },
    { id: 'user-contributions', title: 'USER GENERATED CONTRIBUTIONS', number: 8 },
    { id: 'contribution-license', title: 'CONTRIBUTION LICENSE', number: 9 },
    { id: 'review-guidelines', title: 'GUIDELINES FOR REVIEWS', number: 10 },
    { id: 'third-party', title: 'THIRD-PARTY WEBSITES AND CONTENT', number: 11 },
    { id: 'services-management', title: 'SERVICES MANAGEMENT', number: 12 },
    { id: 'privacy-policy', title: 'PRIVACY POLICY', number: 13 },
    { id: 'copyright', title: 'COPYRIGHT INFRINGEMENTS', number: 14 },
    { id: 'termination', title: 'TERM AND TERMINATION', number: 15 },
    { id: 'modifications', title: 'MODIFICATIONS AND INTERRUPTIONS', number: 16 },
    { id: 'governing-law', title: 'GOVERNING LAW', number: 17 },
    { id: 'dispute-resolution', title: 'DISPUTE RESOLUTION', number: 18 },
    { id: 'corrections', title: 'CORRECTIONS', number: 19 },
    { id: 'disclaimer', title: 'DISCLAIMER', number: 20 },
    { id: 'liability-limitations', title: 'LIMITATIONS OF LIABILITY', number: 21 },
    { id: 'indemnification', title: 'INDEMNIFICATION', number: 22 },
    { id: 'user-data', title: 'USER DATA', number: 23 },
    { id: 'electronic-communications', title: 'ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES', number: 24 },
    { id: 'california-users', title: 'CALIFORNIA USERS AND RESIDENTS', number: 25 },
    { id: 'miscellaneous', title: 'MISCELLANEOUS', number: 26 },
    { id: 'contact', title: 'CONTACT US', number: 27 }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id));
      const currentSection = sections.find(section => {
        if (section) {
          const rect = section.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAccept = () => {
    setIsAccepted(true);
    if (onAccept) {
      onAccept();
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 bg-white ${className}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last updated: June 07, 2025</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            By accessing GetTutorly, you agree to be bound by these terms. Please read them carefully.
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Table of Contents Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => setShowTableOfContents(!showTableOfContents)}
                className="flex items-center justify-between w-full mb-4 text-lg font-semibold text-gray-800"
              >
                Table of Contents
                {showTableOfContents ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              
              {showTableOfContents && (
                <nav className="space-y-1 max-h-96 overflow-y-auto">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.number}. {item.title}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Agreement to Legal Terms */}
          <section className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Agreement to Our Legal Terms</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="mb-4">
                We are <strong>Gettutorly</strong> ("Company," "we," "us," "our"), a company registered in India at 
                BB road 12 door number, Chickaballapur, Karnataka 562101.
              </p>
              <p className="mb-4">
                We operate the website <a href="https://gettutorly.com/" target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  https://gettutorly.com/ <ExternalLink size={14} />
                </a> (the "Site"), as well as any other related products and services.
              </p>
              <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                <h3 className="font-semibold text-blue-800 mb-2">About GetTutorly</h3>
                <p className="text-blue-700 text-sm">
                  GetTutorly is an AI-powered study assistant web application designed to help students learn smarter and faster. 
                  Our platform allows users to upload lecture notes, textbooks, or PDFs and instantly receive high-quality 
                  summaries, flashcards, quizzes, and personalized tutoring assistance—all powered by advanced AI models.
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                <strong>Important Notice for Minors:</strong> All users who are minors (generally under 18) must have 
                parental permission and direct supervision to use our Services.
              </p>
            </div>
          </section>

          {/* Section 1: Our Services */}
          <section id="our-services" className="scroll-mt-20">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <button
                onClick={() => toggleSection('our-services')}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-2xl font-bold text-gray-800">1. Our Services</h2>
                {expandedSections.has('our-services') ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
            
            {expandedSections.has('our-services') && (
              <div className="prose max-w-none">
                <p className="mb-4">
                  The information provided when using the Services is not intended for distribution to or use by any person 
                  or entity in any jurisdiction where such distribution would be contrary to law or regulation.
                </p>
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-red-700 text-sm">
                    <strong>Compliance Notice:</strong> The Services are not tailored to comply with industry-specific 
                    regulations (HIPAA, FISMA, etc.). If your use would be subject to such laws, you may not use the Services.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Intellectual Property Rights */}
          <section id="intellectual-property" className="scroll-mt-20">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <button
                onClick={() => toggleSection('intellectual-property')}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-2xl font-bold text-gray-800">2. Intellectual Property Rights</h2>
                {expandedSections.has('intellectual-property') ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
            
            {expandedSections.has('intellectual-property') && (
              <div className="prose max-w-none space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Our Intellectual Property</h3>
                  <p>
                    We are the owner or licensee of all intellectual property rights in our Services, including all source code, 
                    databases, functionality, software, website designs, audio, video, text, photographs, and graphics.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Use of Our Services</h3>
                  <p>
                    Subject to compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, 
                    revocable license to access and use the Services for personal, non-commercial use only.
                  </p>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                  <p className="text-orange-700 text-sm">
                    <strong>Important:</strong> Any unauthorized use of our intellectual property will result in 
                    immediate termination of your right to use our Services.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Section 5: Purchases and Payment */}
          <section id="purchases-payment" className="scroll-mt-20">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <button
                onClick={() => toggleSection('purchases-payment')}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-2xl font-bold text-gray-800">5. Purchases and Payment</h2>
                {expandedSections.has('purchases-payment') ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
            
            {expandedSections.has('purchases-payment') && (
              <div className="prose max-w-none space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Accepted Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {['Visa', 'Mastercard', 'American Express', 'Discover', 'PayPal', 'Stripe'].map((method) => (
                      <div key={method} className="bg-gray-100 p-3 rounded text-center text-sm font-medium">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="text-green-700 text-sm">
                    <strong>Currency:</strong> All payments are processed in US dollars. Sales tax will be added as required.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Section 6: Subscriptions */}
          <section id="subscriptions" className="scroll-mt-20">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <button
                onClick={() => toggleSection('subscriptions')}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-2xl font-bold text-gray-800">6. Subscriptions</h2>
                {expandedSections.has('subscriptions') ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
            
            {expandedSections.has('subscriptions') && (
              <div className="prose max-w-none space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <h3 className="font-semibold text-blue-800 mb-2">Free Trial</h3>
                    <p className="text-blue-700 text-sm">
                      We offer a 4-day free trial to new users. Your account will be charged according to your 
                      chosen subscription at the end of the trial period.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded">
                    <h3 className="font-semibold text-purple-800 mb-2">Billing Cycle</h3>
                    <p className="text-purple-700 text-sm">
                      Subscriptions automatically renew monthly unless canceled. You can cancel anytime 
                      through your account settings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 7: Prohibited Activities */}
          <section id="prohibited-activities" className="scroll-mt-20">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <button
                onClick={() => toggleSection('prohibited-activities')}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-2xl font-bold text-gray-800">7. Prohibited Activities</h2>
                {expandedSections.has('prohibited-activities') ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
            
            {expandedSections.has('prohibited-activities') && (
              <div className="prose max-w-none">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-red-700 font-medium mb-2">You are prohibited from:</p>
                  <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                    <li>Systematically retrieving data to create databases without permission</li>
                    <li>Attempting to learn sensitive account information</li>
                    <li>Circumventing security features</li>
                    <li>Using the Services for illegal purposes</li>
                    <li>Uploading viruses or malicious code</li>
                    <li>Impersonating other users</li>
                    <li>Using automated systems (bots, scripts)</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Contact Information */}
          <section id="contact" className="scroll-mt-20">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">27. Contact Us</h2>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Gettutorly</p>
                    <p className="text-gray-600 text-sm">BB road 12 door number</p>
                    <p className="text-gray-600 text-sm">Chickaballapur, Karnataka 562101, India</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="text-blue-600" size={20} />
                  <a href="tel:+918088362052" className="text-blue-600 hover:underline">
                    +91 808 836 2052
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="text-blue-600" size={20} />
                  <a href="mailto:support@gettutorly.com" className="text-blue-600 hover:underline">
                    support@gettutorly.com
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptance Buttons */}
          {showAcceptButtons && (
            <div className="mt-12 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Agreement Acknowledgment</h3>
                <p className="text-gray-600 mb-6">
                  By clicking "I Accept", you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                
                {!isAccepted ? (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleDecline}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      I Decline
                    </button>
                    <button
                      onClick={handleAccept}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Check size={20} />
                      I Accept
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check size={24} />
                    <span className="font-medium">Terms Accepted</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
            <p>
              These Terms of Service are effective as of June 07, 2025. 
              We recommend printing a copy for your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
