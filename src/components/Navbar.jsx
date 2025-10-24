import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navbar({ openSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isThai } = useLanguage();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchClick = () => {
    openSearch();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Toonsoilnex</span>
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder={isThai ? "ค้นหาการ์ตูน..." : "Search comics..."}
                onClick={handleSearchClick}
                className="w-full py-2 px-4 pr-10 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:bg-white focus:border-primary transition-colors cursor-pointer"
                readOnly
              />
              <button
                onClick={handleSearchClick}
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
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === "/"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              {isThai ? "หน้าแรก" : "Home"}
            </Link>
            <Link
              to="/popular"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === "/popular"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              {isThai ? "ยอดนิยม" : "Popular"}
            </Link>
            <Link
              to="/new"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === "/new"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              {isThai ? "อัปเดตล่าสุด" : "New Updates"}
            </Link>
            <Link
              to="/completed"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === "/completed"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              {isThai ? "จบแล้ว" : "Completed"}
            </Link>
            <LanguageToggle />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                /* Icon when menu is open */
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={isThai ? "ค้นหาการ์ตูน..." : "Search comics..."}
                  onClick={handleSearchClick}
                  className="w-full py-2 px-4 pr-10 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:bg-white focus:border-primary transition-colors cursor-pointer"
                  readOnly
                />
                <button
                  onClick={handleSearchClick}
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
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === "/"
                  ? "text-primary border-l-4 border-primary bg-primary/5"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              } transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isThai ? "หน้าแรก" : "Home"}
            </Link>
            <Link
              to="/popular"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === "/popular"
                  ? "text-primary border-l-4 border-primary bg-primary/5"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              } transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isThai ? "ยอดนิยม" : "Popular"}
            </Link>
            <Link
              to="/new"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === "/new"
                  ? "text-primary border-l-4 border-primary bg-primary/5"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              } transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isThai ? "อัปเดตล่าสุด" : "New Updates"}
            </Link>
            <Link
              to="/completed"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === "/completed"
                  ? "text-primary border-l-4 border-primary bg-primary/5"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              } transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isThai ? "จบแล้ว" : "Completed"}
            </Link>
            <div className="px-3 py-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}