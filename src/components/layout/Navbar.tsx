
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
  BookOpenIcon,
  Settings,
  Brain
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import SearchDropdown from "@/components/search/SearchDropdown";

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
        scrolled ? "backdrop-blur-lg bg-[#0A0A0A]/90" : "bg-[#0A0A0A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpenIcon className="h-6 w-6 text-purple-500" />
            <span className="text-xl font-bold text-white">Tutorly</span>
          </Link>
          
          {showUserNav && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {navbarLinks.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={`group flex items-center gap-2 text-sm font-medium transition-all duration-200 relative px-3 py-2 rounded-lg hover:bg-gray-800/50 ${
                    location.pathname === href 
                      ? 'text-purple-400 bg-gray-800/30' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                  {location.pathname === href && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"></div>
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 w-48 lg:w-64"
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
                <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity border border-gray-700 hover:border-purple-500">
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
                className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            /* Public page auth buttons */
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 shadow-lg transition-all duration-200 hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showUserNav && mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-gray-800">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {/* Mobile Nav Links */}
            {navbarLinks.map(({ href, icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  location.pathname === href
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {icon}
                <span className="font-medium">{label}</span>
              </Link>
            ))}

            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
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

export default Navbar;
