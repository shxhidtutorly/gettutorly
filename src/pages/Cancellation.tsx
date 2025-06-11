import React, { useState } from 'react';

interface PolicySection {
  title: string;
  content: string | string[];
}

interface RefundPolicyProps {
  supportEmail?: string;
  supportUrl?: string;
  lastUpdated?: string;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({
  supportEmail = 'support@gettutorly.com',
  supportUrl = 'https://gettutorly.com/support',
  lastUpdated = new Date().toLocaleDateString()
}) => {
  const [showFaq, setShowFaq] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const openModal = (message: string) => setModal({ open: true, message });
  const closeModal = () => setModal({ open: false, message: '' });

  const policySections: PolicySection[] = [
    {
      title: 'Overview',
      content:
        'This Refund Policy applies to all subscription purchases made on the Tutorly platform, which offers AI-based educational features including study summaries, flashcards, quizzes, and more.'
    },
    {
      title: 'Subscription Plans & Billing',
      content: [
        'Plans Offered: Monthly (auto-renewed monthly) and Annual (auto-renewed yearly).',
        'Automatic Renewal: Subscriptions renew automatically unless canceled before the next billing cycle.',
        'Billing Dates: Charges are processed on the same calendar date each cycle.'
      ]
    },
    {
      title: 'Cancellation Process',
      content: [
        'Cancel via Account: Go to Account Settings → Billing → Cancel Subscription → Confirm Cancellation.',
        `Cancel via Email: Send a cancellation request to ${supportEmail} with subject "Cancel My Subscription".`,
        'Access After Cancellation: You retain access until the current billing period ends.',
        'No Mid-Term Refunds: Cancellation takes effect at the end of the billing period without partial refunds.'
      ]
    },
    {
      title: 'Refund Policy',
      content: [
        'Refunds are available only under specific circumstances and are not guaranteed.',
        'Eligible Refunds:',
        '- Service disruption for more than 7 consecutive days due to technical issues.',
        '- Duplicate or unauthorized charges due to platform error.',
        'Non-Refundable Situations:',
        '- Forgotten cancellation or change of mind.',
        '- Dissatisfaction with features or platform usage.',
        '- Requests made 30+ days after billing date.',
        'All refund decisions are at the sole discretion of Tutorly.'
      ]
    }
  ];

  const handleCancelSubscription = () => openModal('You need to have an active subscription to cancel it.');
  const handleContactSupport = () => window.open(`mailto:${supportEmail}?subject=Subscription%20Cancellation`, '_blank');
  const handleRefundRequest = () => openModal('You need to have an active subscription to request a refund.');
  const handleBackToHome = () => (window.location.href = '/');

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl px-8 py-7 max-w-sm w-full text-center">
            <p className="text-lg text-gray-200 mb-6">{modal.message}</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold"
              onClick={closeModal}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center p-6">
        <button
          onClick={handleBackToHome}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700"
        >
          ← Back to Home Page
        </button>
      </div>

      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-5xl mx-auto p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-800 mt-4 mb-12">
          <section className="mb-10">
            <button
              className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 text-white px-5 py-4 rounded-lg"
              onClick={() => setShowFaq(!showFaq)}
              aria-expanded={showFaq}
              aria-controls="faq-answer"
            >
              <span className="text-xl font-semibold">
                How to Cancel Your Tutorly Subscription?
              </span>
              <span className={`transform text-2xl ${showFaq ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showFaq && (
              <div className="bg-gray-950 border border-gray-800 mt-2 px-5 py-6 rounded-lg text-gray-200">
                <p className="mb-4 font-medium">Steps for iOS Users:</p>
                <ol className="list-decimal list-inside space-y-1 mb-4">
                  <li>Go to <strong>Settings</strong> → Your name → <strong>Subscriptions</strong></li>
                  <li>Select <strong>Tutorly</strong> and tap <strong>Cancel Subscription</strong></li>
                </ol>
                <p className="text-xs text-gray-500">This applies to subscriptions managed via Apple. For direct billing, cancel via the app or support email.</p>
              </div>
            )}
          </section>

          <div className="space-y-10">
            {policySections.map((section, index) => (
              <section key={index} className="border-b border-gray-800 pb-6">
                <h2 className={`text-2xl font-semibold mb-4 ${
                  section.title.toLowerCase().includes('refund') ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {section.title}
                </h2>
                {Array.isArray(section.content) ? (
                  <ul className="list-disc space-y-2 pl-5 text-gray-200">
                    {section.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-200 leading-relaxed">{section.content}</p>
                )}
              </section>
            ))}

            <section className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium">Cancel Subscription</button>
                <button onClick={handleContactSupport} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">Contact Support</button>
                <button onClick={handleRefundRequest} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium">Request Refund</button>
              </div>
            </section>

            <section className="bg-blue-950 p-6 rounded-lg border border-blue-800">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Need Help?</h2>
              <div className="space-y-2 text-gray-200">
                <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-blue-400 hover:underline">{supportEmail}</a></p>
                <p><strong>Support Center:</strong> <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{supportUrl}</a></p>
                <p><strong>Typical Response Time:</strong> 1–2 business days</p>
              </div>
            </section>

            <section className="bg-yellow-900 p-6 rounded-lg border border-yellow-700">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Important Notes</h2>
              <ul className="text-gray-200 list-disc pl-5 space-y-2">
                <li>Refunds are issued back to your original payment method within 5–10 business days after approval.</li>
                <li>Access to premium content ends when your billing cycle expires.</li>
                <li>Export your data before canceling if you need future access.</li>
                <li>All refund decisions are final and at the discretion of Tutorly.</li>
              </ul>
            </section>
          </div>

          <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>Last updated on: {lastUpdated}</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
