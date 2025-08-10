import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Recreating icons with inline SVGs for self-containment and brutalist styling
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const MessageSquare = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 1 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const BookOpen = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Brain = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-7 1c0 1.5.5 3 .5 4.5"/><path d="M17.5 11c-.74-2.88-2.6-6-6-6-3.37 0-5.24 3.12-6 6"/><path d="M17.5 11a7.1 7.1 0 0 1 1.5 3c.5 1.5.5 3 0 5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2c-.5-1.5-.5-3 0-5a7.1 7.1 0 0 1 1.5-3"/><path d="M11 12a3 3 0 0 0-3 3c0 1.5.5 3-.5 4.5"/><path d="M18.5 15a7.1 7.1 0 0 0 1.5-3c.5-1.5.5-3 0-5"/><path d="M11 12c.74 2.88 2.6 6 6 6 3.37 0 5.24-3.12 6-6"/><path d="M12 12a3 3 0 1 0 7-1c0-1.5.5-3-.5-4.5"/></svg>;

const App = () => {
  const location = useLocation();

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
          icon={<Home />}
          label="Home"
          href="/dashboard"
          active={location.pathname === '/dashboard'}
        />
        <NavItem
          icon={<MessageSquare />}
          label="Chat"
          href="/ai-assistant"
          active={location.pathname === '/ai-assistant'}
        />
        <NavItem
          icon={<Brain />}
          label="AI Notes"
          href="/ai-notes"
          active={location.pathname === '/ai-notes'}
        />
        <NavItem
          icon={<BookOpen />}
          label="Library"
          href="/library"
          active={location.pathname === '/library'}
        />
        <NavItem
          icon={<User />}
          label="Profile"
          href="/profile"
          active={location.pathname === '/profile'}
        />
      </div>
    </div>
  );
};

export default App;

