
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PaymentCancel = () => {
  const navigate = useNavigate();

  const getBaseUrl = () => {
    // Use production URL for production environment
    if (window.location.hostname === 'gettutorly.com' || 
        window.location.hostname.includes('gettutorly.com')) {
      return 'https://gettutorly.com';
    }
    // Use current origin for development
    return window.location.origin;
  };

  const handleRetryPayment = () => {
    const baseUrl = getBaseUrl();
    if (baseUrl.includes('gettutorly.com')) {
      window.location.href = `${baseUrl}/pricing`;
    } else {
      navigate('/pricing');
    }
  };

  const handleBackToDashboard = () => {
    const baseUrl = getBaseUrl();
    if (baseUrl.includes('gettutorly.com')) {
      window.location.href = `${baseUrl}/dashboard`;
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="bg-[#121212] border-slate-700 text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Payment Canceled
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-gray-400 mb-6"
            >
              No worries! Your payment was canceled and no charges were made to your account.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <Button
                onClick={handleRetryPayment}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-xs text-gray-500 mt-6"
            >
              Need help? Contact our support team anytime.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
