import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Sun, Moon, Check } from "lucide-react";

const NavLink = ({ to, children, isActive, isMobile = false, onClick }) => {
  const baseClasses = isMobile
    ? "block pl-3 pr-4 py-2 text-base font-medium transition-colors"
    : "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors";

  const activeClasses = isMobile
    ? "text-primary border-l-4 border-primary bg-primary/5 dark:text-primary dark:bg-primary/20"
    : "text-primary border-b-2 border-primary";

  const inactiveClasses = isMobile
    ? "text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:text-primary dark:hover:bg-gray-800"
    : "text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary";

  return (
    <Link
      to={to}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const CategoriesDropdown = ({ isMobile, isOpen, onToggle, onNavigate, activePath }) => {
  const navigate = useNavigate();
  const categories = [
    { id: "manga", label: "มังงะ" },
    { id: "manhwa", label: "มังฮวา" },
    { id: "manhua", label: "มังฮัว" },
  ];

  if (isMobile) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={`w-full text-left pl-3 pr-4 py-2 text-base font-medium transition-colors flex items-center justify-between ${
            activePath.startsWith("/category/")
              ? "text-primary border-l-4 border-primary bg-primary/5 dark:text-primary dark:bg-primary/20"
              : "text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:text-primary dark:hover:bg-gray-800"
          } ${isOpen ? "bg-gray-50 dark:bg-gray-800" : ""}`}
          aria-expanded={isOpen}
        >
          หมวดหมู่
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="pl-4">
            {categories.map(({ id, label }) => (
              <NavLink
                key={id}
                to={`/category/${id}`}
                isActive={activePath === `/category/${id}`}
                isMobile
                onClick={onNavigate}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activePath.startsWith("/category/")
            ? "text-primary bg-primary/5 dark:text-primary dark:bg-primary/20"
            : "text-gray-700 hover:text-primary hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-100 dark:hover:bg-gray-800"
        } ${isOpen ? "bg-gray-100 dark:bg-gray-800" : ""}`}
        aria-expanded={isOpen}
      >
        หมวดหมู่
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden">
          <div className="py-1">
            {categories.map(({ id, label }) => {
              const isActiveItem = activePath === `/category/${id}`;
              return (
                <button
                  key={id}
                  onClick={() => {
                    onNavigate();
                    navigate(`/category/${id}`);
                  }}
                  className={`flex items-center w-full px-4 py-2.5 text-sm text-left transition-colors ${
                    isActiveItem
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {label}
                  {isActiveItem && <Check className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchBar = ({ onClick, isMobile = false }) => (
  <div className={isMobile ? "px-3 py-2" : "hidden md:block flex-1 max-w-md mx-8"}>
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2 px-4 text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary/40 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
    >
      <Search className="h-4 w-4 flex-shrink-0" />
      <span>ค้นหาการ์ตูน...</span>
    </button>
  </div>
);

const ThemeToggleButton = ({ isDarkMode, toggleDarkMode, isMobile = false }) => (
  <button
    type="button"
    onClick={toggleDarkMode}
    aria-label="Toggle dark mode"
    className={
      isMobile
        ? "w-full flex items-center gap-3 pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        : "p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-gray-800 transition-colors"
    }
  >
    {isDarkMode ? (
      <>
        <Sun className="h-5 w-5" />
        {isMobile && <span>โหมดสว่าง</span>}
      </>
    ) : (
      <>
        <Moon className="h-5 w-5" />
        {isMobile && <span>โหมดมืด</span>}
      </>
    )}
  </button>
);

const MobileMenuButton = ({ isOpen, onClick, isDarkMode }) => (
  <div className="md:hidden flex items-center">
    <button
      onClick={onClick}
      className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        isDarkMode
          ? "text-gray-200 hover:text-primary hover:bg-gray-800"
          : "text-gray-700 hover:text-primary hover:bg-gray-100"
      }`}
      aria-expanded={isOpen}
    >
      <span className="sr-only">Open main menu</span>
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  </div>
);

export default function Navbar({ openSearch, isDarkMode, toggleDarkMode }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleDropdown = useCallback((name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  }, []);

  const handleNavigation = useCallback(() => closeAllDropdowns(), [closeAllDropdowns]);

  const handleSearchClick = useCallback(() => {
    openSearch();
    closeAllDropdowns();
  }, [openSearch, closeAllDropdowns]);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      if (prev) closeAllDropdowns();
      return !prev;
    });
  }, [closeAllDropdowns]);

  const navLinks = [
    { to: "/", label: "หน้าแรก" },
    { to: "/doujin", label: "โดจิน" },
    { to: "/completed", label: "จบแล้ว" },
    { to: "/favorites", label: "คลัง" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        isDarkMode
          ? "bg-gray-900/95 backdrop-blur-md border-gray-800 shadow-md shadow-black/20"
          : "bg-white/95 backdrop-blur-md border-gray-200 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-primary tracking-tight">Toonsoilnex</span>
          </Link>

          <SearchBar onClick={handleSearchClick} />

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} isActive={location.pathname === to}>
                {label}
              </NavLink>
            ))}

            <CategoriesDropdown
              isOpen={activeDropdown === "categories"}
              onToggle={() => toggleDropdown("categories")}
              onNavigate={handleNavigation}
              activePath={location.pathname}
            />

            <ThemeToggleButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </nav>

          <MobileMenuButton isOpen={isMenuOpen} onClick={toggleMobileMenu} isDarkMode={isDarkMode} />
        </div>
      </div>

      {isMenuOpen && (
        <div
          className={`md:hidden border-t ${
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <SearchBar onClick={handleSearchClick} isMobile />

            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                isActive={location.pathname === to}
                isMobile
                onClick={closeAllDropdowns}
              >
                {label}
              </NavLink>
            ))}

            <CategoriesDropdown
              isMobile
              isOpen={activeDropdown === "mobileCategories"}
              onToggle={() => toggleDropdown("mobileCategories")}
              onNavigate={handleNavigation}
              activePath={location.pathname}
            />

            <ThemeToggleButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isMobile />
          </div>
        </div>
      )}
    </header>
  );
}
