
import { BookOpenIcon, InstagramIcon } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpenIcon className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Tutorly</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/support"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Help
            </a>
            <a 
              href="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="https://gettutorly.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="https://www.tiktok.com/@_mary_manuel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <SiTiktok className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/gettutorly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <Separator className="my-6 bg-gray-200 dark:bg-gray-800" />
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 GetTutorly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
