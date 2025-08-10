
import React, { useState, useEffect } from "react";

// --- Mocking External Dependencies for Self-Contained Code ---
// In your real application, these would be imported from libraries.
const Link = ({ to, children, className, ...props }) => (
  <a href={to} onClick={(e) => e.preventDefault()} className={className} {...props}>
    {children}
  </a>
);
const useLocation = () => ({ pathname: "/dashboard" }); // Mock location
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);
const useAuthState = () => [
  { // Mock authenticated user
    uid: "user-123",
    displayName: "Jane Doe",
    email: "jane.doe@example.com",
    photoURL: "https://placehold.co/40x40/000/fff?text=J",
  },
  false, // loading state
];
const useIsMobile = () => (window.innerWidth < 768); // Simple mock for mobile check

// Recreating icons with inline SVGs for self-containment and styling control
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 1 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CalendarDays = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
const BarChart3 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>;
const Brain = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-7 1c0 1.5 0 3 .5 4.5"/><path d="M17.5 11c-.74-2.88-2.6-6-6-6-3.37 0-5.24 3.12-6 6"/><path d="M17.5 11a7.1 7.1 0 0 1 1.5 3c.5 1.5.5 3 0 5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2c-.5-1.5-.5-3 0-5a7.1 7.1 0 0 1 1.5-3"/><path d="M11 12a3 3 0 0 0-3 3c0 1.5 0 3-.5 4.5"/><path d="M18.5 15a7.1 7.1 0 0 0 1.5-3c.5-1.5.5-3 0-5"/><path d="M11 12c.74 2.88 2.6 6 6 6 3.37 0 5.24-3.12 6-6"/><path d="M12 12a3 3 0 1 0 7-1c0-1.5 0-3-.5-4.5"/></svg>;
const BookOpenIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Settings = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.25.43a2 2 0 0 0 .73 2.73l.08.15a2 2 0 0 1 0 2.73l-.08.15a2 2 0 0 0-.73 2.73l.25.43a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.25-.43a2 2 0 0 0-.73-2.73l-.08-.15a2 2 0 0 1 0-2.73l.08-.15a2 2 0 0 0 .73-2.73l-.25-.43a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const BellIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const Search = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const X = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const MenuIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;

const App = () => {
  const [user, loading] = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // Mocking the data from original component
  const navbarLinks = [
    { href: "/dashboard", icon: <Home />, label: "DASHBOARD" },
    { href: "/study-plans", icon: <CalendarDays />, label: "STUDY PLANS" },
    { href: "/progress", icon: <BarChart3 />, label: "PROGRESS" },
    { href: "/study-techniques", icon: <Brain />, label: "STUDY TECHNIQUES" },
  ];
  const PUBLIC_PATHS = ["/", "/signin", "/signup", "/pricing", "/terms-of-service", "/privacy", "/support"];
  const isPublic = PUBLIC_PATHS.includes(location.pathname);
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
      className={`border-b-2 border-white sticky top-0 z-50 transition-all duration-100 ${
        scrolled ? "backdrop-blur-lg bg-black/90" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:bg-white p-1 hover:text-black transition-colors">
            <BookOpenIcon className="h-6 w-6 text-white" />
            <span className="text-xl font-bold uppercase text-white">Tutorly</span>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="pl-10 pr-4 py-2 bg-black border-2 border-white text-white uppercase placeholder-white
                    focus:outline-none focus:ring-4 focus:ring-white w-48 lg:w-64"
                />
              </div>

              {/* Interactive Symbols/Buttons */}
              <Tooltip label="NOTIFICATIONS">
                <button className="border-2 border-white p-2 text-white hover:bg-white hover:text-black transition-colors">
                  <BellIcon />
                </button>
              </Tooltip>

              <Tooltip label="PROFILE">
                <Link to="/profile">
                  <div className="h-10 w-10 border-2 border-white flex items-center justify-center
                    bg-black text-white hover:bg-white hover:text-black transition-colors">
                    <User className="h-6 w-6" />
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

export default App;