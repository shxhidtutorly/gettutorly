
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "lucide-react";

const PricingHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Home">
            <BookOpenIcon className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Tutorly</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/signin">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PricingHeader;
