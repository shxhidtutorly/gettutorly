
import { Home, BookOpen, Upload, User, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const BottomNav = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
  // Don't show bottom nav on landing page
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  
  if (isLandingPage) {
    return null;
  }
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around h-16">
        <NavItem 
          icon={<Home size={20} />} 
          label="Home" 
          href="/dashboard" 
          active={location.pathname === '/dashboard'} 
        />
        <NavItem 
          icon={<MessageSquare size={20} />} 
          label="Chat" 
          href="/chat" 
          active={location.pathname === '/chat'} 
        />
        <NavItem 
          icon={<BookOpen size={20} />} 
          label="Library" 
          href="/library" 
          active={location.pathname === '/library'} 
        />
        <NavItem 
          icon={<Upload size={20} />} 
          label="Upload" 
          href="/upload" 
          active={location.pathname === '/upload'} 
        />
        <NavItem 
          icon={<User size={20} />} 
          label="Profile" 
          href="/profile" 
          active={location.pathname === '/profile'} 
        />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, href, active }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  return (
    <Link 
      to={href} 
      className="flex flex-col items-center justify-center w-full py-1 animated-button"
    >
      <div className={active ? 'text-primary p-1.5' : `text-foreground p-1.5 ${isDarkMode ? 'text-white' : ''}`}>
        {icon}
      </div>
      <span className={active 
        ? 'text-xs mt-1 text-primary font-medium' 
        : `text-xs mt-1 ${isDarkMode ? 'text-white' : 'text-foreground'}`
      }>
        {label}
      </span>
    </Link>
  );
};

export default BottomNav;
