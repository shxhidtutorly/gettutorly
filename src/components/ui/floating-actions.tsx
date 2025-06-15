
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  HelpCircle, 
  StickyNote, 
  Calculator,
  Plus,
  X
} from "lucide-react";
import { useState } from "react";

const FloatingActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: Zap, label: "Flashcards", route: "/flashcards", color: "from-yellow-500 to-orange-500" },
    { icon: HelpCircle, label: "Quiz", route: "/quiz", color: "from-blue-500 to-cyan-500" },
    { icon: StickyNote, label: "Notes", route: "/ai-notes", color: "from-green-500 to-emerald-500" },
    { icon: Calculator, label: "Math", route: "/math-chat", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => {
                    navigate(action.route);
                    setIsOpen(false);
                  }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} hover:scale-110 transition-transform shadow-lg border-0`}
                  size="sm"
                >
                  <action.icon className="w-5 h-5 text-white" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl border-0"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
};

export default FloatingActions;
