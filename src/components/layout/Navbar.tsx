import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  MenuIcon,
  X,
  Home,
  User,
  Brain,
  Settings,
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Files,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

const navbarLinks = [
  { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/ai-notes", icon: <Sparkles className="h-4 w-4" />, label: "AI Notes" },
  { href: "/flashcards", icon: <Zap className="h-4 w-4" />, label: "Flashcards" },
  { href: "/quiz", icon: <BookOpen className="h-4 w-4" />, label: "Quizzes" },
  { href: "/multi-doc-session", icon: <Files className="h-4 w-4" />, label: "Multi-Doc" },
];

const PUBLIC_PATHS = ["/", "/signin", "/signup", "/pricing", "/terms-of-service", "/privacy", "/support"];

function isPublicPage(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

const Navbar = ({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) => {
  const [user, loading] = useAuthState(auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const isPublic = isPublicPage(location.pathname);
  const showUserNav = !loading && user && !isPublic;

  const themeClasses =
    theme === "light" ? "bg-stone-100 text-stone-900 border-black" : "bg-zinc-900 text-zinc-100 border-zinc-700";

  const panelClasses = theme === "light" ? "bg-white border-black" : "bg-zinc-800 border-zinc-300";

  // Close menu when navigating
  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  return (
    <header className={`border-b-4 sticky top-0 z-50 font-mono ${themeClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Left logo + brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Brain className="h-8 w-8 border-2 border-black p-1" style={{ backgroundColor: "#A442F1", color: "#fff" }} />
            <span className="text-2xl font-black tracking-tight">TUTORLY</span>
          </Link>

          {/* Desktop links */}
          {showUserNav && (
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navbarLinks.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={`group flex items-center gap-2 text-sm font-black px-4 py-2 border-2 border-black transition-all duration-150 ${
                    location.pathname === href ? panelClasses : `${panelClasses} hover:bg-opacity-80`
                  }`}
                  style={{
                    boxShadow: location.pathname === href ? "3px 3px 0px #ff5a8f" : "2px 2px 0px #000",
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {showUserNav ? (
            <>
              {/* Settings */}
              <Link
                to="/settings"
                className={`p-2 border-2 border-black ${panelClasses}`}
                style={{ boxShadow: "2px 2px 0px #000" }}
              >
                <Settings className="w-4 h-4" />
              </Link>

              {/* Notifications */}
              <button
                className={`p-2 border-2 border-black ${panelClasses}`}
                style={{ boxShadow: "2px 2px 0px #000" }}
              >
                <BellIcon className="h-4 w-4" />
              </button>

              {/* Avatar */}
              <Link to="/profile">
                <div
                  className={`p-1 border-2 border-black ${panelClasses}`}
                  style={{ boxShadow: "2px 2px 0px #00e6c4" }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                </div>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 border-2 border-black ${panelClasses}`}
                style={{ boxShadow: "2px 2px 0px #000" }}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <button
                  className={`px-4 py-2 border-2 border-black font-black text-sm ${panelClasses}`}
                  style={{ boxShadow: "2px 2px 0px #000" }}
                >
                  SIGN IN
                </button>
              </Link>
              <Link to="/signup">
                <button
                  className="px-6 py-2 border-2 border-black font-black text-sm"
                  style={{ backgroundColor: "#00e6c4", boxShadow: "3px 3px 0px #000" }}
                >
                  GET STARTED
                </button>
              </Link>

              {/* Show hamburger for public pages too */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 border-2 border-black ${panelClasses}`}
                style={{ boxShadow: "2px 2px 0px #000" }}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t-4 border-black ${themeClasses}`}>
          <div className="px-4 py-4 space-y-3">
            {showUserNav ? (
              <>
                {navbarLinks.map(({ href, icon, label }) => (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-3 px-4 py-3 border-2 border-black font-black ${panelClasses}`}
                    style={{ boxShadow: "2px 2px 0px #000" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {icon}
                    <span>{label}</span>
                  </Link>
                ))}
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-4 py-3 border-2 border-black font-black ${panelClasses}`}
                  style={{ boxShadow: "2px 2px 0px #000" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/pricing"
                  className={`flex items-center gap-3 px-4 py-3 border-2 border-black font-black ${panelClasses}`}
                  style={{ boxShadow: "2px 2px 0px #000" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Pricing</span>
                </Link>
                <Link
                  to="/support"
                  className={`flex items-center gap-3 px-4 py-3 border-2 border-black font-black ${panelClasses}`}
                  style={{ boxShadow: "2px 2px 0px #000" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Support</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
