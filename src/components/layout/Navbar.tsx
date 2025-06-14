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
  SquareStack
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/ui/Logo";

const navbarLinks = [
  { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/flashcards", icon: <SquareStack className="h-4 w-4" />, label: "Flashcards" },
  { href: "/study-plans", icon: <CalendarDays className="h-4 w-4" />, label: "Study Plans" },
  { href: "/progress", icon: <BarChart3 className="h-4 w-4" />, label: "Progress" },
  { href: "/ai-assistant", icon: <Sparkles className="h-4 w-4" />, label: "AI Assistant" }
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);
  useEffect(() => () => setMobileMenuOpen(false), []);

  const mobileMenuClass = mobileMenuOpen
    ? "animate-fade-in-down opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none";

  return (
    <header
      className={`border-b border-spark-light sticky top-0 z-50 shadow-sm transition-all duration-300 
        ${scrolled ? "backdrop-blur-lg bg-white/90 dark:bg-card/90" : "bg-white dark:bg-card"}`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover-lift" aria-label="Home">
            <Logo size="md" />
          </Link>
          {!isLandingPage && (
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
          {!isLandingPage && (
            <>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search your materials..."
                  className="pl-10 pr-4 py-2 rounded-full border border-spark-light focus:outline-none focus:ring-2 focus:ring-spark-primary text-sm w-56 lg:w-64 transition-all duration-300 dark:bg-muted"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative hover:bg-spark-light transition-colors dark:hover:bg-accent" aria-label="Notifications">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-spark-primary"></span>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="dark-mode-toggle hover:bg-spark-light transition-colors dark:hover:bg-accent"
                      onClick={toggleTheme}
                      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link to="/profile" aria-label="Profile">
                <Avatar className="hover-lift">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-spark-secondary text-white">SL</AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={`${!isLandingPage ? 'md:hidden' : 'hidden'} hover:bg-spark-light transition-colors dark:hover:bg-accent`}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 top-16 z-40 md:hidden transition-all duration-300 bg-white border-b border-spark-light dark:bg-card dark:border-muted ${mobileMenuClass}`}
        style={{ display: mobileMenuOpen && !isLandingPage ? 'block' : 'none' }}
      >
        <div className="container py-4 space-y-4">
          <div className="flex items-center gap-2 bg-spark-gray rounded-lg px-3 py-2 dark:bg-muted">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search your materials..."
              className="bg-transparent border-none outline-none text-sm w-full dark:bg-transparent dark:text-foreground"
            />
          </div>
          <nav className="space-y-1">
            {navbarLinks.concat([
              { href: "/profile", icon: <User className="h-5 w-5" />, label: "Profile" }
            ]).map(({ href, icon, label }) => (
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
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-spark-light transition-colors dark:hover:bg-accent cursor-pointer"
              onClick={toggleTheme}
              tabIndex={0}
              role="button"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ href, icon, label, active }) => (
  <Link
    to={href}
    className={`group flex flex-col items-center gap-1 text-sm font-medium transition-colors relative
      ${active ? 'text-spark-primary tutorly-nav-active' : 'text-muted-foreground hover:text-spark-primary'}`}
    tabIndex={0}
  >
    <div className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
    </div>
    {/* Animated Indicator */}
    <span
      className={`absolute left-0 bottom-[-2px] h-0.5 bg-spark-primary transition-all duration-300
        ${active ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}
      style={{ borderRadius: 2 }}
    />
  </Link>
);

const MobileNavLink = ({ href, icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors
      ${active ? 'bg-spark-light text-spark-primary dark:bg-accent dark:text-spark-primary' : 'hover:bg-spark-light dark:hover:bg-accent'}`}
    tabIndex={0}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default Navbar;
