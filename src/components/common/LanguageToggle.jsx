import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle({ isOpen, onToggle }) {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const dropdownRef = useRef(null);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    onToggle(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
          isOpen ? 'bg-gray-100' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        } transition-colors`}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span>{languages[currentLanguage].flag}</span>
        <span className="hidden sm:inline">{languages[currentLanguage].name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {Object.values(languages).map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                  currentLanguage === language.code ? 'bg-primary text-white hover:bg-primary-dark' : 'text-gray-700'
                }`}
              >
                <span className="mr-3">{language.flag}</span>
                <span>{language.name}</span>
                {currentLanguage === language.code && (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}