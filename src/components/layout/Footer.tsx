import { BookOpenIcon, InstagramIcon } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-spark-light py-6 dark:bg-card dark:border-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpenIcon className="h-5 w-5 text-spark-primary" />
            <span className="text-lg font-bold dark:text-white">Tutorly</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/support"
              className="text-sm text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors"
            >
              Help
            </a>
            <a href="/privacy" className="text-sm text-muted-foreground ...">Privacy</a>
            <a
              href="https://gettutorly.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="https://www.tiktok.com/@_mary_manuel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors"
            >
              <SiTiktok className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/gettutorly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <Separator className="my-6 dark:bg-muted" />
        <div className="text-center text-sm text-muted-foreground dark:text-gray-400">
          <p>© 2025 GetTutorly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
