
import { useState, useEffect } from "react";
// Mocking react-router-dom for standalone demonstration
// In your actual app, you would use the real imports:
// import { Link, useLocation, useNavigate } from "react-router-dom";
const Link = ({ to, children, className, onClick }) => (
  <a href={to} className={className} onClick={onClick}>{children}</a>
);
const useLocation = () => ({ pathname: "/dashboard" }); // Mock current path
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

// Mocking shadcn/ui components for standalone demonstration
// In your actual app, you would use the real imports:
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Input } from "@/components/ui/input";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const Button = ({ children, className, onClick, variant, size, ...props }) => (
  <button className={`px-4 py-2 rounded-md ${className}`} onClick={onClick} {...props}>
    {children}
  </button>
);
const Avatar = ({ children, className }) => <div className={`rounded-full overflow-hidden ${className}`}>{children}</div>;
const AvatarImage = ({ src }) => <img src={src} alt="Avatar" className="w-full h-full object-cover" />;
const AvatarFallback = ({ children, className }) => <div className={`flex items-center justify-center bg-gray-700 text-white ${className}`}>{children}</div>;
const Input = ({ className, ...props }) => <input className={`px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`} {...props} />;
const TooltipProvider = ({ children }) => <>{children}</>;
const Tooltip = ({ children }) => <div className="relative inline-block">{children}</div>;
const TooltipTrigger = ({ children }) => <>{children}</>;
const TooltipContent = ({ children }) => <div className="absolute z-10 p-2 bg-gray-700 text-white text-xs rounded-md shadow-lg">{children}</div>;


// Mocking lucide-react icons
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CalendarDays = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
const BarChart3 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BookOpenIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const Settings = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Brain = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c-3.31 0-6 2.69-6 6 0 2.22 1.2 4.16 3 5.19V22l3-3 3 3v-5.81c1.8-1.03 3-2.97 3-5.19 0-3.31-2.69-6-6-6z"/><path d="M12 5c-3.31 0-6 2.69-6 6 0 2.22 1.2 4.16 3 5.19V22l3-3 3 3v-5.81c1.8-1.03 3-2.97 3-5.19 0-3.31-2.69-6-6-6zM12 5c-3.31 0-6 2.69-6 6 0 2.22 1.2 4.16 3 5.19V22l3-3 3 3v-5.81c1.8-1.03 3-2.97 3-5.19 0-3.31-2.69-6-6-6zM12 5c-3.31 0-6 2.69-6 6 0 2.22 1.2 4.16 3 5.19V22l3-3 3 3v-5.81c1.8-1.03 3-2.97 3-5.19 0-3.31-2.69-6-6-6zM12 5c-3.31 0-6 2.69-6 6 0 2.22 1.2 4.16 3 5.19V22l3-3 3 3v-5.81c1.8-1.03 3-2.97 3-5.19 0-3.31-2.69-6-6-6zM12 5c-3.31 0-6 2.69-6 6 0 2.22 1.2 4.16 3 5.19V22l3-3 3 3v-5.81c1.8-1.03 3-2.97 3-5.19 0-3.31-2.69-6-6-6z"/></svg>;
const BellIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.36 17.06a2 2 0 0 1 3.28 0"/></svg>;
const Search = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const X = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const MenuIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;


// Mocking custom hooks and components
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

// Mock Firebase auth
const auth = {}; // Mock auth object
const useAuthState = (mockAuth) => {
  const [user, setUser] = useState(null); // Initially no user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async auth check
    const timer = setTimeout(() => {
      // Simulate a logged-in user after a delay
      setUser({
        displayName: "John Doe",
        email: "john.doe@example.com",
        photoURL: "https://placehold.co/100x100/A855F7/ffffff?text=JD"
      });
      setLoading(false);
    }, 1000); // Simulate 1 second loading time
    return () => clearTimeout(timer);
  }, []);
  return [user, loading];
};

const NotificationPanel = () => {
  const [showPanel, setShowPanel] = useState(false);
  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-110"
              onClick={() => setShowPanel(!showPanel)}
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {showPanel && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 text-white animate-fade-in-down">
          <h3 className="font-bold mb-2">Notifications</h3>
          <p className="text-sm text-gray-400">No new notifications.</p>
        </div>
      )}
    </div>
  );
};

const SearchDropdown = ({ show, query, onSelect, onClose }) => {
  const suggestions = [
    "AI Notes", "Quiz", "Flashcards", "Summaries", "Math Chat",
    "Audio Notes", "Doubt Chain", "AI Assistant", "Progress",
    "Study Plans", "Dashboard", "Library"
  ].filter(item => item.toLowerCase().includes(query.toLowerCase()));

  if (!show || suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in-down">
      <ul className="py-2">
        {suggestions.map((item, index) => (
          <li
            key={index}
            className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors duration-200"
            onClick={() => { onSelect(item); onClose(); }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};


const navbarLinks = [
  { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/study-plans", icon: <CalendarDays className="h-4 w-4" />, label: "Study Plans" },
  { href: "/progress", icon: <BarChart3 className="h-4 w-4" />, label: "Progress" },
  { href: "/study-techniques", icon: <Brain className="h-4 w-4" />, label: "Study Techniques" },
];

// Paths where the navbar should show auth buttons instead of user nav
const PUBLIC_PATHS = ["/", "/signin", "/signup", "/pricing", "/terms-of-service", "/privacy", "/support"];

function isPublicPage(pathname: string) {
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
      "math": "/math-chat",
      "audio": "/audio-notes",
      "doubt": "/doubt-chain",
      "assistant": "/ai-assistant",
      "progress": "/progress",
      "plans": "/study-plans",
      "dashboard": "/dashboard",
      "library": "/library"
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
      className={`border-b border-gray-800 sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-lg bg-[#0A0A0A]/90 shadow-lg" : "bg-[#0A0A0A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity transform hover:scale-105">
            <BookOpenIcon className="h-6 w-6 text-purple-500 animate-pulse-slow" /> {/* Added pulse animation */}
            <span className="text-xl font-bold text-white">Tutorly</span>
          </Link>

          {showUserNav && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {navbarLinks.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={`group flex items-center gap-2 text-sm font-medium transition-all duration-300 relative px-3 py-2 rounded-lg 
                    ${location.pathname === href
                      ? 'text-purple-400 bg-gray-800/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover-underline' // Added hover-underline class
                    }
                  `}
                >
                  {icon}
                  <span>{label}</span>
                  {location.pathname === href && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full animate-bounce-slow"></div> // Added bounce animation
                  )}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {showUserNav ? (
            <>
              {/* Search */}
              <div className="relative hidden sm:block">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-200" />
                  <Input
                    type="text"
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    onBlur={() => setTimeout(() => setShowSearch(false), 200)} // Delay hide to allow click on dropdown
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 w-48 lg:w-64 transition-all duration-300 shadow-inner hover:bg-gray-700/60"
                  />
                </div>
                <SearchDropdown
                  show={showSearch && searchQuery.length > 0}
                  query={searchQuery}
                  onSelect={handleSearch}
                  onClose={() => setShowSearch(false)}
                />
              </div>

              {/* Notifications */}
              <NotificationPanel />

              {/* User Avatar */}
              <Link to="/profile">
                <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity border border-gray-700 hover:border-purple-500 transform hover:scale-110 shadow-md">
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 active:scale-95"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5 animate-spin-once" /> : <MenuIcon className="h-5 w-5 animate-fade-in" />}
              </Button>
            </>
          ) : (
            /* Public page auth buttons */
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white transition-colors hover:bg-gray-800/50 px-4 py-2 rounded-md group relative overflow-hidden">
                  Sign In
                  <span className="absolute inset-0 w-full h-full border-2 border-purple-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 shadow-lg transition-all duration-300 hover:scale-105 rounded-md relative overflow-hidden group">
                  Get Started
                  <span className="absolute inset-0 w-full h-full bg-purple-800 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showUserNav && (
        <div className={`md:hidden bg-[#0A0A0A] border-t border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}>
          <div className="px-4 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 w-full transition-all duration-300"
              />
              <SearchDropdown
                show={showSearch && searchQuery.length > 0}
                query={searchQuery}
                onSelect={handleSearch}
                onClose={() => setShowSearch(false)}
              />
            </div>

            {/* Mobile Nav Links */}
            {navbarLinks.map(({ href, icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 transform active:scale-98
                  ${location.pathname === href
                    ? 'bg-purple-600/20 text-purple-400 shadow-inner'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                {icon}
                <span className="font-medium">{label}</span>
              </Link>
            ))}

            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 transform active:scale-98"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

// Main App component to render Navbar and include global styles
const App = () => {
  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          display: flex;
          justify-content: center;
          align-items: flex-start; /* Align to top to see navbar */
          min-height: 100vh;
          background: #0f0f0f;
          margin: 0;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          overflow-x: hidden; /* Prevent horizontal scroll */
        }

        /* Custom hover-underline effect */
        .hover-underline {
          position: relative;
          display: inline-block;
          overflow: hidden; /* Hide overflow from pseudo-elements */
        }

        .hover-underline::after,
        .hover-underline::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, #ff0000, #00ffff); /* Vibrant gradient */
          bottom: -5px; /* Position below text */
          left: 0;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth cubic-bezier transition */
        }

        .hover-underline::before {
          top: -5px; /* Position above text */
          transform-origin: left;
        }

        .hover-underline:hover::after,
        .hover-underline:hover::before {
          transform: scaleX(1);
        }

        /* Keyframe for pulse animation */
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        /* Keyframe for bounce animation */
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        /* Keyframe for fade-in */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Keyframe for fade-in-down */
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Keyframe for spin-once */
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(90deg); }
        }

        /* Apply animations */
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.5s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
        .animate-spin-once {
          animation: spin-once 0.3s ease-out forwards;
        }
        `}
      </style>
      <Navbar />
      {/* Spacer to demonstrate sticky navbar and scroll effect */}
      <div style={{ height: '150vh', width: '100%', background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f, #1a1a1a)' }}></div>
    </>
  );
};

export default App;