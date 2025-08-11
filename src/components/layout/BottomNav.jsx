import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Brain, ClipboardList } from "lucide-react";

// Assuming these are the original components you are using
// They are commented out as the imports are already at the top
// import { useTheme } from "@/contexts/ThemeContext";

const BottomNav = () => {
  const location = useLocation();
  // const { theme } = useTheme(); // Commented out as per original code, not used for rendering theme logic here

  // Don't show bottom nav on landing page
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";

  if (isLandingPage) {
    return null;
  }

  const NavItem = ({ icon, label, href, active }) => {
    return (
      <Link
        to={href}
        className={`flex flex-col items-center justify-center w-full h-full text-white border-r-2 border-white last:border-r-0
          hover:bg-white hover:text-black transition-colors duration-100 relative
          ${active ? 'bg-white text-black' : 'bg-black'}`}
      >
        {active && <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"/>}
        <div className="p-1.5">
          {icon}
        </div>
        <span className="text-xs mt-1 font-bold uppercase">
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-white shadow-lg z-50 font-['Inter']">
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
          href="/ai-assistant"
          active={location.pathname === '/ai-assistant'}
        />
        <NavItem
          icon={<ClipboardList size={20} />} // Updated icon for AI Notes
          label="AI Notes"
          href="/ai-notes"
          active={location.pathname === '/ai-notes'}
        />
        <NavItem
          icon={<BookOpenIcon size={20} />}
          label="Library"
          href="/library"
          active={location.pathname === '/library'}
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

export default BottomNav;

