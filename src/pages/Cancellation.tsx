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
        'This Refund Policy reflects Tutorly’s unwavering commitment to our customers—our learners. We understand that trust is the foundation of any great product, especially in education. We aim to make our refund and cancellation policy transparent, flexible, and supportive to ensure our users feel safe and confident using our platform.'
    },
    {
      title: 'Subscription & Billing',
      content: [
        'Tutorly offers both Monthly and Annual subscription plans, which renew automatically unless canceled in advance.',
        'All charges are processed on the same calendar date of your original purchase each month/year, depending on the plan.',
        'You can manage, pause, or cancel your subscription anytime directly from your account dashboard or by contacting our support team.'
      ]
    },
    {
      title: 'Cancellation Process',
      content: [
        'We support hassle-free cancellations. If you decide Tutorly is not right for you, you can cancel your subscription anytime.',
        'How to cancel:',
        '- Visit Account Settings > Billing > Cancel Subscription.',
        `- Alternatively, email us at ${supportEmail} with the subject “Cancel My Subscription.”`,
        'After canceling, your premium access continues until the end of your current billing cycle. You won’t be billed again unless you reactivate.',
        'No cancellation fees apply. You’re always welcome to return in the future.'
      ]
    },
    {
      title: 'Buyer Support and Consumer Right to Cancel',
      content: [
        'We believe buyers should be protected, respected, and empowered. This section is dedicated to upholding your consumer rights and ensuring you receive fair treatment.',
        '',
        '**Your Right to Cancel:**',
        'You have the right to cancel your subscription at any time for any reason. We will never lock you into a service you don’t find valuable. If you cancel within 7 days of purchase and have not heavily used the service, you may request a refund, and we will prioritize resolving the request with fairness.',
        '',
        '**Fair Refund Evaluation:**',
        'We evaluate refund requests on a case-by-case basis and may consider:',
        '- If there was a technical failure that prevented you from accessing features for a sustained period.',
        '- If you were billed erroneously or more than once.',
        '- If your account was compromised or misused.',
        '- If you didn’t receive the product/service as reasonably expected.',
        '',
        '**Supportive Refund Window:**',
        'Requests submitted within 14 days of the transaction will receive priority consideration. However, even after this period, we encourage you to reach out. We value dialogue over denial.',
        '',
        '**Refund Process & Timeline:**',
        '- Once approved, refunds are issued to the original payment method within 5–10 business days.',
        '- You will be notified via email when the refund has been processed.',
        '- We do not charge fees for processing refunds.',
        '',
        '**Our Promise:**',
        'We understand that subscriptions can be forgotten, financial conditions can change, and expectations may evolve. If you believe your case deserves a second look, we promise to review it with empathy. Refunds aren’t just about money—they’re about trust, and we take that seriously.',
        '',
        'Please reach out to us anytime you feel unsure, disappointed, or need help. We exist because of our learners and will always strive to be worthy of your trust.'
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
    <div className="min-h-screen bg-black flex flex-col relative text-gray-200">
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl px-8 py-7 max-w-sm w-full text-center">
            <p className="text-lg text-gray-200 mb-6">{modal.message}</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors duration-200"
              onClick={closeModal}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center p-6">
        <button
          onClick={handleBackToHome}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition-colors duration-200"
        >
          ← Back to Home Page
        </button>
      </div>

      <main className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-5xl mx-auto p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-800 mt-4 mb-12">
          <section className="mb-10">
            <button
              className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 text-left text-white px-5 py-4 rounded-lg transition-colors duration-200"
              onClick={() => setShowFaq(!showFaq)}
            >
              <span className="text-xl font-semibold">How to Cancel Your Tutorly Subscription?</span>
              <span className={`transform text-2xl ${showFaq ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showFaq && (
              <div className="bg-gray-950 border border-gray-800 mt-2 px-5 py-6 rounded-lg text-gray-300">
                <p className="mb-4 font-medium">Steps to Cancel Your Subscription:</p>
                <ol className="list-decimal list-inside space-y-1 mb-4">
                  <li>Go to <span className="font-semibold">Settings</span> on your device.</li>
                  <li>Tap your <span className="font-semibold">Apple ID / Account Name</span>.</li>
                  <li>Open <span className="font-semibold">Subscriptions</span>.</li>
                  <li>Select <span className="font-semibold">Tutorly</span> and tap <span className="font-semibold">Cancel Subscription</span>.</li>
                </ol>
                <p className="text-sm text-gray-400">Applies to Apple/iOS billing. For web, use your Tutorly account settings.</p>
              </div>
            )}
          </section>

          <div className="space-y-10">
            {policySections.map((section, index) => (
              <section key={index} className="border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-semibold text-blue-400 mb-4">
                  {section.title}
                </h2>
                {Array.isArray(section.content) ? (
                  <ul className="space-y-3 pl-5 list-disc text-gray-200 leading-relaxed">
                    {section.content.map((item, i) => (
                      <li key={i}>{item}</li>
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

            <section className="bg-blue-950 p-6 rounded-lg border border-blue-800">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Need Help?</h2>
              <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-blue-400 underline">{supportEmail}</a></p>
              <p><strong>Support Center:</strong> <a href={supportUrl} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{supportUrl}</a></p>
              <p><strong>Response Time:</strong> Within 1–2 business days</p>
            </section>

            <section className="bg-yellow-900 p-6 rounded-lg border border-yellow-700">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Important Notes</h2>
              <ul className="space-y-2 text-gray-200 pl-5 list-disc">
                <li>Refunds are processed via your original payment method within 5–10 business days after approval.</li>
                <li>Make sure to export your data before canceling if you want to keep it.</li>
                <li>Premium content may be deleted 30 days after your subscription ends.</li>
                <li>We reserve the right to modify or update this policy based on user needs and platform updates.</li>
              </ul>
            </section>
          </div>

          <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>This policy was last updated on {lastUpdated} and is designed to align with global consumer protection standards.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
