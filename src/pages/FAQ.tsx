
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, MessageCircle, Mail } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is Tutorly free to use?",
      answer: "Yes! Tutorly offers a free forever plan that includes 5 AI summaries per month, basic flashcards, and community support. You can upgrade to our Pro plan for unlimited features and advanced capabilities."
    },
    {
      question: "Can I upload PDFs and other documents?",
      answer: "Absolutely! Tutorly supports multiple file formats including PDFs, Word documents, PowerPoint presentations, images, and even audio files. Our AI can extract and summarize content from any of these formats."
    },
    {
      question: "How accurate is the AI-generated content?",
      answer: "Our AI is highly accurate and continuously improving. We use advanced language models trained on academic content. However, we always recommend reviewing AI-generated materials and using them as study aids rather than definitive sources."
    },
    {
      question: "Can I use Tutorly for any subject?",
      answer: "Yes! Tutorly works across all subjects - from STEM fields like mathematics, physics, and chemistry to humanities like history, literature, and languages. Our AI adapts to the content and context of your materials."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We take data security very seriously. All uploads are encrypted, your personal information is protected, and we never share your content with third parties. You maintain full ownership of your documents and generated content."
    },
    {
      question: "How does the AI chat tutor work?",
      answer: "Our AI chat tutor is available 24/7 to answer questions about your uploaded materials. Simply ask questions in natural language, and it will provide detailed explanations, examples, and help you understand complex concepts better."
    },
    {
      question: "Can I collaborate with classmates?",
      answer: "Yes! Our Team plan includes collaboration features that allow you to share study materials, create group study sessions, and work together on projects. Perfect for study groups and class projects."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "On the free plan, you'll be notified when you approach your monthly limits. You can either wait for the next month's reset or upgrade to Pro for unlimited access. We'll never cut you off mid-session!"
    },
    {
      question: "Do you offer student discounts?",
      answer: "Our pricing is already student-friendly, and we offer a free plan that covers many student needs. We occasionally run special promotions for students - follow us on social media or subscribe to our newsletter for updates."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from your account settings. There are no cancellation fees, and you'll continue to have access to Pro features until your current billing period ends."
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Everything you need to know about Tutorly and how it can transform your learning experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <button
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: openFAQ === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {openFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 bg-gray-50 dark:bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Still Have Questions?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  Our support team is here to help you get the most out of Tutorly
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Live Chat Support
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Get instant help from our support team
                    </p>
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      onClick={() => window.location.href = "/support"}
                    >
                      Start Chat
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Mail className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Email Support
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Send us a detailed message anytime
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => window.location.href = "mailto:support@gettutorly.com"}
                    >
                      Send Email
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of students who are already learning smarter with Tutorly
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xl px-12 py-4 rounded-xl font-semibold shadow-xl transition-all duration-300"
                onClick={() => window.location.href = "/dashboard"}
              >
                Start Learning Free
              </motion.button>
              <p className="text-gray-400 mt-4 text-sm">
                No credit card required • Free forever plan available
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
