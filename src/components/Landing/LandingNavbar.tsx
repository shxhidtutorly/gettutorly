
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "About", href: "/about" }
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-white hover:text-purple-300 transition-colors font-medium"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA - Fixed Layout */}
          <div className="hidden md:flex items-center justify-end gap-x-4">
            {currentUser ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-purple-700 hover:bg-gray-100 transition-all py-2 px-4 rounded-lg text-sm"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className="text-white text-sm hover:underline transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-black text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 rounded-lg mt-2 p-4 shadow-xl"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-gray-900 dark:text-white hover:text-purple-600 text-left font-medium"
                >
                  {link.name}
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                {currentUser ? (
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-purple-600 text-white"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      className="block w-full text-center py-2 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-center py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default LandingNavbar;
