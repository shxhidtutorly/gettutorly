
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaddlePricing from "@/components/payment/PaddlePricing";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PaddlePricing />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
