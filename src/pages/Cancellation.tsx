import React, { useState } from 'react';

interface PolicySection {
  title: string;
  content: string[];
}

interface RefundPolicyProps {
  supportEmail?: string;
  supportUrl?: string;
  lastUpdated?: string;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({
  supportEmail = 'support@gettutorly.com',
  supportUrl = 'https://gettutorly.com/support',
  lastUpdated = new Date().toLocaleDateString(),
}) => {
  const [showFaq, setShowFaq] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const openModal = (message: string) => setModal({ open: true, message });
  const closeModal = () => setModal({ open: false, message: '' });

  const policySections: PolicySection[] = [
    {
      title: 'Overview',
      content: [
        'Tutorly values your trust. Our refund policy aims to be fair, transparent, and supportive for all our users.'
      ]
    },
    {
      title: 'Subscription & Billing',
      content: [
        'We offer monthly and annual subscription plans with automatic renewal unless canceled.',
        'Charges occur on the same calendar day as your original purchase date.',
        'You can manage or cancel your subscription at any time from your account dashboard.'
      ]
    },
    {
      title: 'Cancellation Process',
      content: [
        'Cancel your subscription anytime without cancellation fees.',
        'You will retain premium access until the end of your billing cycle.',
        'Steps to cancel:',
        '- Go to Account Settings > Billing > Cancel Subscription.',
        `- Or email us at ${supportEmail} with subject: "Cancel My Subscription".`
      ]
    },
    {
      title: 'Buyer Support and Consumer Right to Cancel',
      content: [
        'We prioritize your satisfaction and rights as a buyer.',
        'You may cancel at any time and request a refund within 7 days if the service was not used extensively.',
        'Refunds are evaluated based on:',
        '- Technical issues that prevented usage.',
        '- Duplicate or erroneous billing.',
        '- Account compromise.',
        '- Service not as expected.',
        'Refund requests within 14 days get priority consideration.',
        'Approved refunds are processed within 5–10 business days.',
        'No processing fees are applied.',
        'We treat each request with empathy and fairness.'
      ]
    }
  ];

  const handleCancelSubscription = () => {
    openModal('You need to have an active subscription to cancel it.');
  };

  const handleContactSupport = () => {
    window.open(`mailto:${supportEmail}?subject=Subscription%20Cancellation`, '_blank');
  };

  const handleRefundRequest = () => {
    openModal('You need to have an active subscription to request a refund.');
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-8 py-7 max-w-sm w-full text-center">
            <p className="text-lg mb-6">{modal.message}</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold"
              onClick={closeModal}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        <button
          onClick={handleBackToHome}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          ← Back to Home Page
        </button>
      </div>

      <main className="flex justify-center">
        <div className="w-full max-w-5xl p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-800">

          <section className="mb-10">
            <button
              className="w-full flex justify-between bg-gray-800 hover:bg-gray-700 px-5 py-4 rounded-lg"
              onClick={() => setShowFaq(!showFaq)}
            >
              <span className="text-xl font-semibold">How to Cancel Your Tutorly Subscription?</span>
              <span className={`transform text-2xl ${showFaq ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showFaq && (
              <div className="bg-gray-950 border border-gray-800 mt-2 px-5 py-6 rounded-lg">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Settings.</li>
                  <li>Tap your Apple ID or Account Name.</li>
                  <li>Open Subscriptions.</li>
                  <li>Select Tutorly and tap Cancel Subscription.</li>
                </ol>
              </div>
            )}
          </section>

          <div className="space-y-10">
            {policySections.map((section, index) => (
              <section key={index} className="border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-semibold text-blue-400 mb-4">{section.title}</h2>
                <ul className="list-disc space-y-2 pl-6">
                  {section.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}

            <section className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCancelSubscription}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Cancel Subscription
                </button>
                <button
                  onClick={handleContactSupport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Contact Support
                </button>
                <button
                  onClick={handleRefundRequest}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Request Refund
                </button>
              </div>
            </section>

            <section className="bg-yellow-900 p-6 rounded-lg border border-yellow-700">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Important Notes</h2>
              <ul className="space-y-2 pl-5 list-disc">
                <li>Refunds are processed to the original payment method within 5–10 business days.</li>
                <li>Export your data before canceling if you wish to retain it.</li>
                <li>Premium content may be removed 30 days after subscription ends.</li>
                <li>This policy may be updated to reflect changes in law or platform updates.</li>
              </ul>
            </section>

            <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
              <p>This policy was last updated on {lastUpdated}.</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
