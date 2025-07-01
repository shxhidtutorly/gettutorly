
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BellIcon,
  MenuIcon,
  Search,
  X,
  Home,
  CalendarDays,
  BarChart3,
  User,
  Moon,
  Sun,
  Sparkles,
  SquareStack,
  BookOpenIcon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/hooks/useUser";

const navbarLinks = [
  { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/flashcards", icon: <SquareStack className="h-4 w-4" />, label: "Flashcards" },
  { href: "/study-plans", icon: <CalendarDays className="h-4 w-4" />, label: "Study Plans" },
  { href: "/progress", icon: <BarChart3 className="h-4 w-4" />, label: "Progress" },
  { href: "/ai-assistant", icon: <Sparkles className="h-4 w-4" />, label: "AI Assistant" },
];

// Paths where the navbar should be hidden
const HIDE_NAVBAR_PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/pricing"
];

function isHideNavbarPage(pathname: string) {
  return HIDE_NAVBAR_PATHS.some((route) => pathname.startsWith(route));
}

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  // Hide navbar on certain pages
  if (isHideNavbarPage(location.pathname)) {
    return null;
  }

  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  const isDashboardArea =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/flashcards") ||
    location.pathname.startsWith("/study-plans") ||
    location.pathname.startsWith("/progress") ||
    location.pathname.startsWith("/ai-assistant");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  // Animation classes for mobile menu
  const mobileMenuClass = mobileMenuOpen
    ? "animate-slide-down opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none";

  return (
    <header
      className={`border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300
        ${scrolled ? "backdrop-blur-lg bg-white/90 dark:bg-gray-900/90" : "bg-white dark:bg-gray-900"}
        ${isLandingPage ? "dark:border-gray-800" : "dark:border-gray-800"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="Home">
            <BookOpenIcon className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Tutorly</span>
          </Link>
          {isDashboardArea && user && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {navbarLinks.map(({ href, icon, label }) => (
                <NavLink
                  key={href}
                  href={href}
                  icon={icon}
                  label={label}
                  active={location.pathname === href}
                />
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isDashboardArea && user ? (
            <>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search your materials..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm w-40 md:w-56 lg:w-64 transition-all duration-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-purple-600 animate-ping"></span>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
                      onClick={toggleTheme}
                      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link to="/profile" aria-label="Profile">
                <Avatar className="hover:opacity-80 transition-opacity">
                  <AvatarImage src={user?.imageUrl || ""} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-transform duration-200 active:scale-95"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 shadow-lg transition-transform duration-200 active:scale-95">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {isDashboardArea && user && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu - slide down/out, sticky, touch-friendly */}
      {isDashboardArea && user && (
        <div
          className={`fixed inset-x-0 top-16 z-40 md:hidden bg-white/90 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 max-h-[90vh] overflow-y-auto ${mobileMenuClass}`}
          style={{
            display: mobileMenuOpen ? "block" : "none",
            animation: mobileMenuOpen
              ? "slideDown 0.25s cubic-bezier(0.4,0,0.2,1) forwards"
              : "fadeOut 0.2s ease-in forwards",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 dark:bg-gray-800">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search your materials..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
              />
            </div>
            <nav className="space-y-1">
              {navbarLinks
                .concat([{ href: "/profile", icon: <User className="h-5 w-5" />, label: "Profile" }])
                .map(({ href, icon, label }) => (
                  <MobileNavLink
                    key={href}
                    href={href}
                    icon={icon}
                    label={label}
                    active={location.pathname === href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(href);
                    }}
                  />
                ))}
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={toggleTheme}
                tabIndex={0}
                role="button"
                aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Animations for mobile menu */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px);}
          to   { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeOut {
          from { opacity: 1;}
          to   { opacity: 0;}
        }
      `}</style>
    </header>
  );
};

const NavLink = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    to={href}
    className={`group flex flex-col items-center gap-1 text-sm font-medium transition-colors relative
      ${active ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400'}
      transition-transform duration-200 active:scale-95`}
    tabIndex={0}
  >
    <div className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
    </div>
    {/* Animated Indicator */}
    <span
      className={`absolute left-0 bottom-[-2px] h-0.5 bg-purple-600 transition-all duration-300
        ${active ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}
      style={{ borderRadius: 2 }}
    />
  </Link>
);

const MobileNavLink = ({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors
      ${active ? 'bg-gray-100 text-purple-600 dark:bg-gray-800 dark:text-purple-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
      transition-transform duration-200 active:scale-95`}
    tabIndex={0}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default Navbar;
