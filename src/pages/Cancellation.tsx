import React from 'react';

interface PolicySection {
  title: string;
  content: string | string[];
}

interface RefundPolicyProps {
  supportEmail?: string;
  supportUrl?: string;
  lastUpdated?: string;
}

const CancellationRefundPolicy: React.FC<RefundPolicyProps> = ({
  supportEmail = 'support@tutorly.com',
  supportUrl = 'https://gettutorly.com/support',
  lastUpdated = new Date().toLocaleDateString()
}) => {
  const policySections: PolicySection[] = [
    {
      title: 'Overview',
      content: 'This Cancellation & Refund Policy governs your subscription to Tutorly, a web-based learning platform that provides AI-generated summaries, quizzes, flashcards, study plans, and personal AI assistant features. By subscribing to our Service, you agree to the terms outlined in this Policy.'
    },
    {
      title: 'Subscription Plans & Billing',
      content: [
        'Available Plans: Monthly Subscription (billed every month) and Annual Subscription (billed every 12 months)',
        'Auto-Renewal: All subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date',
        'Billing Cycle: Monthly charges occur on the same calendar day each month. Annual charges occur on the same calendar day each year'
      ]
    },
    {
      title: 'Cancellation Process',
      content: [
        'Via Account Settings: Log into your Tutorly account → Navigate to "Account Settings" or "Billing" → Click "Cancel Subscription" → Follow prompts to confirm',
        `Via Customer Support: Email us at ${supportEmail} with "Subscription Cancellation" in the subject line`,
        'Immediate Access: After cancellation, you retain access to premium features until the end of your current billing period',
        'No Partial Refunds: Cancellation does not entitle you to a refund for the current billing period'
      ]
    },
    {
      title: 'Refund Policy',
      content: [
        'Limited Refund Availability: Refunds are available only under specific circumstances',
        'Eligible Situations: Technical issues preventing access for 7+ days, billing errors, unauthorized charges',
        'Non-Refundable: Forgotten cancellations, partial usage, change of mind, dissatisfaction with features, failure to use service, account suspension, requests made 30+ days after billing'
      ]
    }
  ];

  const handleCancelSubscription = (): void => {
    // This would integrate with your subscription management system
    console.log('Redirecting to cancellation flow...');
    // Example: window.location.href = '/account/billing';
  };

  const handleContactSupport = (): void => {
    window.open(`mailto:${supportEmail}?subject=Subscription%20Cancellation`, '_blank');
  };

  const handleRefundRequest = (): void => {
    const subject = encodeURIComponent('Refund Request');
    const body = encodeURIComponent(
      'Please include:\n- Your account email address\n- Subscription details\n- Detailed explanation of the issue\n- Any relevant screenshots'
    );
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cancellation & Refund Policy
        </h1>
        <p className="text-sm text-gray-600">
          Last Updated: {lastUpdated}
        </p>
      </header>

      <div className="space-y-8">
        {policySections.map((section, index) => (
          <section key={index} className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {section.title}
            </h2>
            {Array.isArray(section.content) ? (
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-700 leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            )}
          </section>
        ))}

        {/* Action Buttons */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              Cancel Subscription
            </button>
            <button
              onClick={handleContactSupport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              Contact Support
            </button>
            <button
              onClick={handleRefundRequest}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              Request Refund
            </button>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Need Help?
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">
                {supportEmail}
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Support Center:</strong>{' '}
              <a href={supportUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {supportUrl}
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Response Time:</strong> 1-2 business days
            </p>
          </div>
        </section>

        {/* Important Notes */}
        <section className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Important Notes
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Refunds are processed within 5-10 business days to original payment method</li>
            <li>• Premium content may be deleted 30 days after subscription expires</li>
            <li>• Export your data before cancellation if you wish to retain it</li>
            <li>• All refund decisions are final and at Tutorly's sole discretion</li>
          </ul>
        </section>
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>
          This Policy complies with applicable consumer protection laws and Stripe's requirements 
          for subscription billing services.
        </p>
      </footer>
    </div>
  );
};

export default CancellationRefundPolicy;

// Usage example:
// import CancellationRefundPolicy from './components/CancellationRefundPolicy';
// 
// function App() {
//   return (
//     <CancellationRefundPolicy 
//       supportEmail="help@tutorly.com"
//       supportUrl="https://tutorly.com/help"
//       lastUpdated="December 15, 2024"
//     />
//   );
// }
