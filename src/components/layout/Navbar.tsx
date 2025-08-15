import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  BellIcon,
  MenuIcon,
  Search,
  X,
  Home,
  CalendarDays,
  BarChart3,
  User,
  Brain,
  Settings,
  Sun,
  Moon,
  Sparkles,
  MessageCircle,
  Users,
  HelpCircle,
  Zap,
  BookOpen,
  StickyNote,
  Files
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import NotificationPanel from "@/components/notifications/NotificationPanel";

const navbarLinks = [
  { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/ai-notes", icon: <Sparkles className="h-4 w-4" />, label: "AI Notes" },
  { href: "/flashcards", icon: <Zap className="h-4 w-4" />, label: "Flashcards" },
  { href: "/quiz", icon: <BookOpen className="h-4 w-4" />, label: "Quizzes" },
  { href: "/multi-doc-session", icon: <Files className="h-4 w-4" />, label: "Multi-Doc" },
];

// Paths where the navbar should show auth buttons instead of user nav
const PUBLIC_PATHS = ["/", "/signin", "/signup", "/pricing", "/terms-of-service", "/privacy", "/support"];

function isPublicPage(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

const Navbar = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const [user, loading] = useAuthState(auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const isPublic = isPublicPage(location.pathname);
  const showUserNav = !loading && user && !isPublic;

  const themeClasses = theme === 'light' 
    ? 'bg-stone-100 text-stone-900 border-black'
    : 'bg-zinc-900 text-zinc-100 border-zinc-700';

  const panelClasses = theme === 'light'
    ? 'bg-white border-black'
    : 'bg-zinc-800 border-zinc-300';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const handleSearch = (query: string) => {
    const searchMap: Record<string, string> = {
      "ai notes": "/ai-notes",
      "notes": "/ai-notes",
      "quiz": "/quiz",
      "test": "/quiz",
      "flashcards": "/flashcards",
      "cards": "/flashcards",
      "summarize": "/summaries",
      "summary": "/summaries",
      "math chat": "/math-chat",
      "math": "/math-chat",
      "audio recap": "/audio-notes",
      "audio": "/audio-notes",
      "doubt chain": "/doubt-chain",
      "doubt": "/doubt-chain",
      "assistant": "/ai-assistant",
      "progress": "/progress",
      "dashboard": "/dashboard",
      "multi doc": "/multi-doc-session",
      "content processor": "/aicontentprocessor",
      "processor": "/aicontentprocessor"
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, route] of Object.entries(searchMap)) {
      if (lowerQuery.includes(key)) {
        navigate(route);
        setSearchQuery("");
        setShowSearch(false);
        return;
      }
    }
  };

  return (
    <header
      className={`border-b-4 sticky top-0 z-50 transition-all duration-200 font-mono ${themeClasses}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Brain 
                className="h-8 w-8 border-2 border-black p-1" 
                style={{ backgroundColor: '#00e6c4', color: '#000' }} 
              />
            </div>
            <span className="text-2xl font-black tracking-tight">TUTORLY</span>
          </Link>
          
          {showUserNav && (
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navbarLinks.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={`group flex items-center gap-2 text-sm font-black px-4 py-2 border-2 border-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] ${
                    location.pathname === href 
                      ? panelClasses
                      : `${panelClasses} hover:bg-opacity-80`
                  }`}
                  style={{ 
                    boxShadow: location.pathname === href 
                      ? '3px 3px 0px #ff5a8f' 
                      : '2px 2px 0px #000'
                  }}
                >
                  {icon}
                  <span className="tracking-wide">{label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showUserNav ? (
            <>
              {/* Search */}
              <div className="relative hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#ff5a8f' }} />
                  <input
                    type="text"
                    placeholder="SEARCH FEATURES..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className={`pl-10 pr-4 py-2 border-2 border-black font-black text-sm placeholder-opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-400 w-48 lg:w-64 ${panelClasses}`}
                    style={{ boxShadow: '2px 2px 0px #000' }}
                  />
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 border-2 border-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                style={{ boxShadow: '2px 2px 0px #000' }}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Notifications */}
              <button
                className={`p-2 border-2 border-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                style={{ boxShadow: '2px 2px 0px #000' }}
              >
                <BellIcon className="h-4 w-4" />
              </button>

              {/* User Avatar */}
              <Link to="/profile">
                <div 
                  className={`p-1 border-2 border-black hover:translate-y-[-2px] transition-all duration-150 ${panelClasses}`}
                  style={{ boxShadow: '2px 2px 0px #00e6c4' }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-black flex items-center justify-center font-black text-white text-sm">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                </div>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 border-2 border-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                style={{ boxShadow: '2px 2px 0px #000' }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </>
          ) : (
            /* Public page auth buttons */
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <button className={`px-4 py-2 border-2 border-black font-black text-sm transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                  style={{ boxShadow: '2px 2px 0px #000' }}
                >
                  SIGN IN
                </button>
              </Link>
              <Link to="/signup">
                <button 
                  className="px-6 py-2 border-2 border-black font-black text-sm transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
                  style={{ 
                    backgroundColor: '#00e6c4',
                    color: '#000',
                    boxShadow: '3px 3px 0px #000'
                  }}
                >
                  GET STARTED
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {showUserNav && mobileMenuOpen && (
        <div className={`md:hidden border-t-4 border-black ${themeClasses}`}>
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#ff5a8f' }} />
              <input
                type="text"
                placeholder="SEARCH FEATURES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className={`pl-10 pr-4 py-2 w-full border-2 border-black font-black text-sm placeholder-opacity-60 ${panelClasses}`}
                style={{ boxShadow: '2px 2px 0px #000' }}
              />
            </div>

            {/* Mobile Nav Links */}
            {navbarLinks.map(({ href, icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-4 py-3 border-2 border-black font-black transition-all duration-150 hover:translate-y-[-1px] active:translate-y-[1px] ${
                  location.pathname === href
                    ? panelClasses
                    : `${panelClasses} hover:bg-opacity-80`
                }`}
                style={{ 
                  boxShadow: location.pathname === href 
                    ? '3px 3px 0px #ff5a8f' 
                    : '2px 2px 0px #000'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {icon}
                <span className="tracking-wide">{label}</span>
              </Link>
            ))}

            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 border-2 border-black font-black transition-all duration-150 hover:translate-y-[-1px] active:translate-y-[1px] ${panelClasses}`}
              style={{ boxShadow: '2px 2px 0px #000' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span className="tracking-wide">PROFILE</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
