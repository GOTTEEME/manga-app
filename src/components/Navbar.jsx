import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../contexts/LanguageContext";

// Reusable NavLink component
const NavLink = ({ to, children, isActive, isMobile = false, onClick }) => {
  const baseClasses = isMobile
    ? "block pl-3 pr-4 py-2 text-base font-medium transition-colors"
    : "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors";

  const activeClasses = isMobile
    ? "text-primary border-l-4 border-primary bg-primary/5"
    : "text-primary border-b-2 border-primary";

  const inactiveClasses = isMobile
    ? "text-gray-700 hover:text-primary hover:bg-gray-50"
    : "text-gray-700 hover:text-primary";

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
const CategoriesDropdown = ({ isMobile, isOpen, onToggle, onNavigate, isThai, activePath }) => {
  const categories = [
    { id: 'manga', label: { en: 'Manga', th: 'มังงะ' } },
    { id: 'manhwa', label: { en: 'Manhwa', th: 'มังฮวา' } },
    { id: 'manhua', label: { en: 'Manhua', th: 'มังฮัว' } }
  ];

  if (isMobile) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={`w-full text-left pl-3 pr-4 py-2 text-base font-medium transition-colors flex items-center justify-between ${
            activePath.startsWith('/category/')
              ? "text-primary border-l-4 border-primary bg-primary/5"
              : "text-gray-700 hover:text-primary hover:bg-gray-50"
          } ${isOpen ? 'bg-gray-50' : ''}`}
          aria-expanded={isOpen}
        >
          {isThai ? "หมวดหมู่" : "Categories"}
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
                {isThai ? label.th : label.en}
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
        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          activePath.startsWith('/category/')
            ? 'text-primary bg-primary/10'
            : 'text-gray-700 hover:bg-gray-100'
        } ${isOpen ? 'bg-gray-100' : ''}`}
        aria-expanded={isOpen}
      >
        {isThai ? "หมวดหมู่" : "Categories"}
        <ChevronIcon isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {categories.map(({ id, label }) => (
              <Link
                key={id}
                to={`/category/${id}`}
                className={`block px-4 py-2 text-sm ${
                  activePath === `/category/${id}`
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onNavigate}
              >
                {isThai ? label.th : label.en}
              </Link>
            ))}
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
const SearchBar = ({ isThai, onClick, isMobile = false }) => (
  <div className={isMobile ? "px-3 py-2" : "hidden md:block flex-1 max-w-md mx-8"}>
    <div className="relative">
      <input
        type="text"
        placeholder={isThai ? "ค้นหาการ์ตูน..." : "Search comics..."}
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
const MobileMenuButton = ({ isOpen, onClick }) => (
  <div className="md:hidden flex items-center">
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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

export default function Navbar({ openSearch }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [languageToggleOpen, setLanguageToggleOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { isThai } = useLanguage();

  const toggleDropdown = useCallback((dropdownName) => {
    setActiveDropdown(prev => {
      // If clicking the same dropdown, close it
      if (prev === dropdownName) return null;
      // Otherwise open the clicked dropdown
      return dropdownName;
    });
    // Close language toggle when opening a dropdown
    setLanguageToggleOpen(false);
  }, []);

  const handleLanguageToggle = useCallback((isOpen) => {
    setLanguageToggleOpen(isOpen);
    // Close other dropdowns when opening language toggle
    if (isOpen) setActiveDropdown(null);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
    setLanguageToggleOpen(false);
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
    } else {
      setLanguageToggleOpen(false);
    }
  }, [isMenuOpen, closeAllDropdowns]);

  // Navigation links data
  const navLinks = [
    { to: "/", label: { en: "Home", th: "หน้าแรก" } },
    { to: "/new", label: { en: "New Updates", th: "อัปเดตล่าสุด" } },
    { to: "/completed", label: { en: "Completed", th: "จบแล้ว" } },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">Toonsoilnex</span>
          </Link>

          {/* Desktop Search */}
          <SearchBar isThai={isThai} onClick={handleSearchClick} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                isActive={location.pathname === to}
              >
                {isThai ? label.th : label.en}
              </NavLink>
            ))}

            {/* Categories Dropdown - Desktop */}
            <div className="relative" ref={dropdownRef}>
              <CategoriesDropdown
                isOpen={activeDropdown === 'categories'}
                onToggle={() => toggleDropdown('categories')}
                onNavigate={handleNavigation}
                isThai={isThai}
                activePath={location.pathname}
              />
            </div>

            {/* Language Toggle - Desktop */}
            <div className="language-toggle-container">
              <LanguageToggle 
                isOpen={languageToggleOpen} 
                onToggle={handleLanguageToggle} 
              />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenuButton isOpen={isMenuOpen} onClick={toggleMobileMenu} />
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <SearchBar isThai={isThai} onClick={handleSearchClick} isMobile />

            {/* Mobile Navigation Links */}
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                isActive={location.pathname === to}
                isMobile
                onClick={closeAllDropdowns}
              >
                {isThai ? label.th : label.en}
              </NavLink>
            ))}

            {/* Mobile Categories Dropdown */}
            <CategoriesDropdown
              isMobile
              isOpen={activeDropdown === 'mobileCategories'}
              onToggle={() => toggleDropdown('mobileCategories')}
              onNavigate={handleNavigation}
              isThai={isThai}
              activePath={location.pathname}
            />

            {/* Language Toggle - Mobile */}
            <div className="language-toggle-container w-full px-3 py-2">
              <LanguageToggle 
                isOpen={languageToggleOpen} 
                onToggle={handleLanguageToggle} 
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}