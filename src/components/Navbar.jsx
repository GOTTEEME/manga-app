import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

// Reusable NavLink component
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

// Categories Dropdown Component
const CategoriesDropdown = ({ isMobile, isOpen, onToggle, onNavigate, activePath }) => {
  const categories = [
    { id: 'manga', label: 'มังงะ' },
    { id: 'manhwa', label: 'มังฮวา' },
    { id: 'manhua', label: 'มังฮัว' }
  ];

  if (isMobile) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={`w-full text-left pl-3 pr-4 py-2 text-base font-medium transition-colors flex items-center justify-between ${
            activePath.startsWith('/category/')
              ? "text-primary border-l-4 border-primary bg-primary/5 dark:text-primary dark:bg-primary/20"
              : "text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:text-primary dark:hover:bg-gray-800"
          } ${isOpen ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
          aria-expanded={isOpen}
        >
          หมวดหมู่
          <ChevronIcon isOpen={isOpen} />
        </button>
        {isOpen && (
          <div className="pl-4">
            {categories.map(({ id, label }) => (
              <NavLink
                key={id}
                to={`/category/${id}`}
                isActive={activePath === `/category/${id}`}
                isMobile={true}
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
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          activePath.startsWith('/category/')
            ? 'text-primary bg-primary/5 dark:text-primary dark:bg-primary/20'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-100 dark:hover:bg-gray-800'
        } ${isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        aria-expanded={isOpen}
      >
        <span>หมวดหมู่</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-900">
          <div className="py-1">
            {categories.map(({ id, label }) => {
              const isActiveItem = activePath === `/category/${id}`;
              return (
                <button
                  key={id}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate();
                    setTimeout(() => { window.location.href = `/category/${id}`; }, 0);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors dark:hover:bg-gray-800 ${
                    isActiveItem
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{label}</span>
                  {isActiveItem && (
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Chevron Icon
const ChevronIcon = ({ isOpen }) => (
  <svg
    className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Search Bar Component
const SearchBar = ({ onClick, isMobile = false }) => (
  <div className={isMobile ? "px-3 py-2" : "hidden md:block flex-1 max-w-md mx-8"}>
    <div className="relative">
      <input
        type="text"
        placeholder="ค้นหาการ์ตูน..."
        onClick={onClick}
        className="w-full py-2 px-4 pr-10 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:bg-white focus:border-primary transition-colors cursor-pointer"
        readOnly
      />
      <button
        onClick={onClick}
        className="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <svg
          className="h-5 w-5 text-gray-400 hover:text-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  </div>
);

// Mobile Menu Button
const MobileMenuButton = ({ isOpen, onClick, isDarkMode }) => (
  <div className="md:hidden flex items-center">
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${
        isDarkMode
          ? "text-gray-200 hover:text-primary hover:bg-gray-800"
          : "text-gray-700 hover:text-primary hover:bg-gray-100"
      }`}
      aria-expanded={isOpen}
    >
      <span className="sr-only">Open main menu</span>
      <svg
        className="block h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
        />
      </svg>
    </button>
  </div>
);

const ThemeToggleButton = ({ isDarkMode, toggleDarkMode, isMobile = false }) => {
  const wrapperClasses = isMobile
    ? "w-full flex items-center justify-start px-3 py-2"
    : "inline-flex items-center";

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`${wrapperClasses} focus:outline-none`}
      aria-label="Toggle dark mode"
    >
      <div
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
          isDarkMode ? "bg-gray-700" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-200 ${
            isDarkMode ? "translate-x-5" : "translate-x-0"
          }`}
        >
          <span className="text-xs">{isDarkMode ? "🌙" : "☀️"}</span>
        </span>
      </div>
    </button>
  );
};

export default function Navbar({ openSearch, isDarkMode, toggleDarkMode }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleDropdown = useCallback((dropdownName) => {
    setActiveDropdown(prev => {
      if (prev === dropdownName) return null;
      return dropdownName;
    });
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  }, []);

  const handleNavigation = useCallback(() => {
    closeAllDropdowns();
  }, [closeAllDropdowns]);

  const handleSearchClick = useCallback(() => {
    openSearch();
    closeAllDropdowns();
  }, [openSearch, closeAllDropdowns]);

  const toggleMobileMenu = useCallback(() => {
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    if (!newIsMenuOpen) {
      closeAllDropdowns();
    }
  }, [isMenuOpen, closeAllDropdowns]);

  // Navigation links data
  const navLinks = [
    { to: "/", label: "หน้าแรก" },
    { to: '/doujin', label: 'โดจิน' },
    { to: "/completed", label: "จบแล้ว" },
    { to: "/favorites", label: "คลัง" },
  ];

  return (
    <header className={isDarkMode ? "bg-gray-900 shadow-md sticky top-0 z-50" : "bg-white shadow-md sticky top-0 z-50"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className={isDarkMode ? "text-2xl font-bold text-primary" : "text-2xl font-bold text-primary"}>Toonsoilnex</span>
          </Link>

          {/* Desktop Search */}
          <SearchBar onClick={handleSearchClick} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                isActive={location.pathname === to}
              >
                {label}
              </NavLink>
            ))}

            {/* Categories Dropdown - Desktop */}
            <div className="relative">
              <CategoriesDropdown
                isOpen={activeDropdown === 'categories'}
                onToggle={() => toggleDropdown('categories')}
                onNavigate={handleNavigation}
                activePath={location.pathname}
              />
            </div>

            <ThemeToggleButton
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenuButton isOpen={isMenuOpen} onClick={toggleMobileMenu} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className={isDarkMode ? "md:hidden bg-gray-900 border-t border-gray-700" : "md:hidden bg-white border-t border-gray-200"}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <SearchBar onClick={handleSearchClick} isMobile />

            {/* Mobile Navigation Links */}
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

            <ThemeToggleButton
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              isMobile
            />

            {/* Mobile Categories Dropdown */}
            <CategoriesDropdown
              isMobile
              isOpen={activeDropdown === 'mobileCategories'}
              onToggle={() => toggleDropdown('mobileCategories')}
              onNavigate={handleNavigation}
              activePath={location.pathname}
            />
          </div>
        </div>
      )}
    </header>
  );
}