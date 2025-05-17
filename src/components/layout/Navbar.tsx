
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BellIcon, 
  BookOpenIcon, 
  MenuIcon, 
  Search, 
  X,
  Home,
  Library,
  CalendarDays,
  BarChart3,
  User,
  Moon,
  Sun,
  Sparkles
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  
  // Add scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header className={`border-b border-spark-light sticky top-0 z-50 shadow-sm transition-all duration-300
      ${scrolled ? "backdrop-blur-lg bg-white/90 dark:bg-card/90" : "bg-white dark:bg-card"}`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover-lift">
            <span className="text-xl font-bold dark:text-foreground">Tutorly</span>
          </Link>
          {!isLandingPage && (
            <div className="hidden md:flex items-center gap-6 ml-6">
              <NavLink href="/dashboard" icon={<Home className="h-4 w-4" />} label="Dashboard" active={location.pathname === '/dashboard'} />
              <NavLink href="/library" icon={<Library className="h-4 w-4" />} label="Library" active={location.pathname === '/library'} />
              <NavLink href="/study-plans" icon={<CalendarDays className="h-4 w-4" />} label="Study Plans" active={location.pathname === '/study-plans'} />
              <NavLink href="/progress" icon={<BarChart3 className="h-4 w-4" />} label="Progress" active={location.pathname === '/progress'} />
              <NavLink href="/ai-assistant" icon={<Sparkles className="h-4 w-4" />} label="AI Assistant" active={location.pathname === '/ai-assistant'} />
            </div>
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
                  className="pl-10 pr-4 py-2 rounded-full border border-spark-light focus:outline-none focus:ring-2 focus:ring-spark-primary text-sm w-56 lg:w-64 transition-all duration-300 dark:bg-muted dark:border-muted dark:text-foreground" 
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative hover:bg-spark-light transition-colors dark:hover:bg-accent">
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
                    >
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Link to="/profile">
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
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && !isLandingPage && (
        <div className="md:hidden bg-white border-b border-spark-light animate-fade-in dark:bg-card dark:border-muted">
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
              <MobileNavLink href="/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" active={location.pathname === '/dashboard'} />
              <MobileNavLink href="/library" icon={<Library className="h-5 w-5" />} label="Library" active={location.pathname === '/library'} />
              <MobileNavLink href="/study-plans" icon={<CalendarDays className="h-5 w-5" />} label="Study Plans" active={location.pathname === '/study-plans'} />
              <MobileNavLink href="/progress" icon={<BarChart3 className="h-5 w-5" />} label="Progress" active={location.pathname === '/progress'} />
              <MobileNavLink href="/ai-assistant" icon={<Sparkles className="h-5 w-5" />} label="AI Assistant" active={location.pathname === '/ai-assistant'} />
              <MobileNavLink href="/profile" icon={<User className="h-5 w-5" />} label="Profile" active={location.pathname === '/profile'} />
              
              <div 
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-spark-light transition-colors dark:hover:bg-accent cursor-pointer"
                onClick={toggleTheme}
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, icon, label, active }) => (
  <Link 
    to={href} 
    className={`group flex flex-col items-center gap-1 text-sm font-medium transition-colors ${active ? 'text-spark-primary tutorly-nav-active' : 'text-muted-foreground hover:text-spark-primary'}`}
  >
    <div className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`h-0.5 ${active ? 'w-full bg-spark-primary' : 'w-0 group-hover:w-full'} bg-spark-primary transition-all duration-300`}></div>
  </Link>
);

const MobileNavLink = ({ href, icon, label, active }) => (
  <Link 
    to={href} 
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${active ? 'bg-spark-light text-spark-primary dark:bg-accent dark:text-spark-primary' : 'hover:bg-spark-light dark:hover:bg-accent'} transition-colors`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;
