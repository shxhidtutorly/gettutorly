
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import PricingHeader from "@/components/layout/PricingHeader";
import PaddlePricing from "@/components/payment/PaddlePricing";

const PricingPage = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle subscription status from URL params
    const subStatus = searchParams.get('sub');
    
    if (subStatus === 'success') {
      toast.success("Payment successful! Welcome to Tutorly Pro!");
    } else if (subStatus === 'cancel') {
      toast.info("Payment was cancelled. You can try again anytime.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <PricingHeader />
      
      <main className="pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PaddlePricing />
        </motion.div>
      </main>
    </div>
  );
};

export default PricingPage;
