
import { motion } from "framer-motion";
import PricingHeader from "@/components/layout/PricingHeader";
import PaddlePricing from "@/components/payment/PaddlePricing";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
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
