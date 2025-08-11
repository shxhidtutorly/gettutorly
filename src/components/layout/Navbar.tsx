import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  MenuIcon,
  Search,
  X,
  Home,
  CalendarDays,
  BarChart3,
  User,
  BookOpenIcon,
  Settings,
  Brain,
  MessageSquare,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import SearchDropdown from "@/components/search/SearchDropdown";

// This is the new logo SVG from the user's latest screenshot.
const TutorlyLogo = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M11.5312 28.125V18.125L23 11.25L34.4688 18.125V28.125H38V17.0312L23 8L8 17.0312V28.125H11.5312Z" fill="white"/>
    <path d="M12.9688 29.5312H11.5312V28.125H8V36.5625H12.9688V29.5312Z" fill="white"/>
    <path d="M23 11.25L34.4688 18.125V28.125H27.9062V36.5625H34.4688V37.9688H11.5312V36.5625H21.0938V28.125H11.5312V18.125L23 11.25Z" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
    <path d="M23 18.5156L26.5312 20.625V24.375H19.4688V20.625L23 18.5156Z" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
  </svg>
);


const navbarLinks = [
  { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/study-plans", icon: <CalendarDays className="h-4 w-4" />, label: "Study Plans" },
  { href: "/progress", icon: <BarChart3 className="h-4 w-4" />, label: "Progress" },
  { href: "/study-techniques", icon: <Brain className="h-4 w-4" />, label: "Study Techniques" },
];

const PUBLIC_PATHS = ["/", "/signin", "/signup", "/pricing", "/terms-of-service", "/privacy", "/support"];

function isPublicPage(pathname) {
  return PUBLIC_PATHS.includes(pathname);
}

const Navbar = () => {
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const handleSearch = (query) => {
    const searchMap = {
      "ai notes": "/ai-notes", "notes": "/ai-notes", "quiz": "/quiz", "test": "/quiz", "flashcards": "/flashcards",
      "cards": "/flashcards", "summarize": "/summaries", "summary": "/summaries", "math": "/math-chat",
      "audio": "/audio-notes", "doubt": "/doubt-chain", "assistant": "/ai-assistant", "progress": "/progress",
      "plans": "/study-plans", "dashboard": "/dashboard", "library": "/library"
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

  const Tooltip = ({ label, children }) => (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black text-white border-2 border-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {label}
      </div>
    </div>
  );

  return (
    <header
      className={`border-b-2 border-white sticky top-0 z-50 transition-all duration-100 font-['Inter'] ${
        scrolled ? "backdrop-blur-lg bg-black/90" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:bg-white p-1 hover:text-black transition-colors">
            <div className="bg-[#6B46C1] p-1 border-2 border-white">
              <TutorlyLogo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold uppercase text-white">TUTORLY</span>
          </Link>

          {showUserNav && (
            <nav className="hidden md:flex items-center gap-2 ml-6">
              {navbarLinks.map(({ href, icon, label }) => (
                <Tooltip key={href} label={label}>
                  <Link
                    to={href}
                    className={`flex items-center justify-center p-2 border-2 border-white transition-colors duration-100
                      ${location.pathname === href
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-white hover:text-black'
                      }`}
                  >
                    {icon}
                  </Link>
                </Tooltip>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {showUserNav ? (
            <>
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                <input
                  type="text"
                  placeholder="SEARCH..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="pl-10 pr-4 py-2 bg-black border-2 border-white text-white uppercase placeholder-white
                    focus:outline-none focus:ring-4 focus:ring-white w-48 lg:w-64"
                />
                <SearchDropdown
                  show={showSearch && searchQuery.length > 0}
                  query={searchQuery}
                  onSelect={handleSearch}
                  onClose={() => setShowSearch(false)}
                />
              </div>

              {/* Interactive Symbols/Buttons */}
              <Tooltip label="NOTIFICATIONS">
                <NotificationPanel />
              </Tooltip>

              <Tooltip label="PROFILE">
                <Link to="/profile">
                  <div className="h-10 w-10 border-2 border-white flex items-center justify-center
                    bg-black text-white hover:bg-white hover:text-black transition-colors">
                    <img src={user?.photoURL || ""} alt="User Avatar" className="h-full w-full object-cover"/>
                  </div>
                </Link>
              </Tooltip>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden border-2 border-white p-2 text-white hover:bg-white hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </>
          ) : (
            /* Public page auth buttons */
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <button className="border-2 border-white text-white p-2 uppercase hover:bg-white hover:text-black transition-colors">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="border-2 border-white bg-white text-black p-2 uppercase font-bold hover:bg-black hover:text-white transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showUserNav && mobileMenuOpen && (
        <div className="md:hidden bg-black border-t-2 border-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
              <input
                type="text"
                placeholder="SEARCH FEATURES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="w-full pl-10 pr-4 py-2 bg-black border-2 border-white text-white uppercase placeholder-white
                  focus:outline-none focus:ring-4 focus:ring-white"
              />
            </div>

            {/* Mobile Nav Links */}
            {navbarLinks.map(({ href, icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-4 p-4 border-2 border-white transition-colors
                  ${location.pathname === href
                    ? 'bg-white text-black font-bold'
                    : 'text-white hover:bg-white hover:text-black'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {icon}
                <span className="font-bold uppercase">{label}</span>
              </Link>
            ))}

            <Link
              to="/profile"
              className="flex items-center gap-4 p-4 border-2 border-white transition-colors
                text-white hover:bg-white hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User />
              <span className="font-bold uppercase">PROFILE</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

