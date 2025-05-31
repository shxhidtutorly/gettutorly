
import { BookOpenIcon, GithubIcon, TwitterIcon } from "lucide-react";
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
            <a href="#" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors">Help</a>
            <a href="#" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors">Terms</a>
            <a href="#" className="text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors">
              <TwitterIcon className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground dark:text-gray-400 hover:text-spark-primary dark:hover:text-spark-primary transition-colors">
              <GithubIcon className="h-4 w-4" />
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
