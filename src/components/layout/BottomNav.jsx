import { Home, Files, MessageSquare, User, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = ({ theme }: { theme: 'light' | 'dark' }) => {
  const location = useLocation();
  
  // Don't show bottom nav on landing page
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  
  if (isLandingPage) {
    return null;
  }

  const themeClasses = theme === 'light' 
    ? 'bg-white border-black text-stone-900'
    : 'bg-zinc-800 border-zinc-300 text-zinc-100';
  
  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t-4 shadow-lg z-50 font-mono ${themeClasses}`}>
      <div className="flex items-center justify-around h-16 px-2">
        <NavItem 
          icon={<Home size={18} />} 
          label="HOME" 
          href="/dashboard" 
          active={location.pathname === '/dashboard'}
          theme={theme}
        />
        <NavItem 
          icon={<MessageSquare size={18} />} 
          label="CHAT" 
          href="/ai-assistant" 
          active={location.pathname === '/ai-assistant'}
          theme={theme}
        />
        <NavItem 
          icon={<Sparkles size={18} />} 
          label="AI NOTES" 
          href="/ai-notes" 
          active={location.pathname === '/ai-notes'}
          theme={theme}
        />
        <NavItem 
          icon={<Files size={18} />} 
          label="MULTI-DOC" 
          href="/multi-doc-session" 
          active={location.pathname === '/multi-doc-session'}
          theme={theme}
        />
        <NavItem 
          icon={<User size={18} />} 
          label="PROFILE" 
          href="/profile" 
          active={location.pathname === '/profile'}
          theme={theme}
        />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, href, active, theme }: { 
  icon: React.ReactNode, 
  label: string, 
  href: string, 
  active: boolean,
  theme: 'light' | 'dark'
}) => {
  const activeColor = active ? '#00e6c4' : (theme === 'light' ? '#6b7280' : '#9ca3af');
  
  return (
    <Link 
      to={href} 
      className="flex flex-col items-center justify-center w-full py-2 transition-all duration-150 hover:scale-105 active:scale-95"
    >
      <div 
        className={`p-1.5 border-2 border-black ${active ? 'translate-y-[-1px]' : ''}`}
        style={{ 
          backgroundColor: active ? '#00e6c4' : 'transparent',
          color: active ? '#000' : activeColor,
          boxShadow: active ? '2px 2px 0px #000' : 'none'
        }}
      >
        {icon}
      </div>
      <span 
        className="text-xs mt-1 font-black tracking-wide"
        style={{ color: activeColor }}
      >
        {label}
      </span>
    </Link>
  );
};

export default BottomNav;
