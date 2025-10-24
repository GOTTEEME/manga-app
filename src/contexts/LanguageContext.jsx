import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the language context
const LanguageContext = createContext();

// Language options
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  th: {
    code: 'th',
    name: 'ไทย',
    flag: '🇹🇭'
  }
};

// Language provider component
export function LanguageProvider({ children }) {
  // Get saved language preference from localStorage or default to English
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('manga-app-language');
    return savedLanguage && languages[savedLanguage] ? savedLanguage : 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('manga-app-language', currentLanguage);
  }, [currentLanguage]);

  // Function to change language
  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  // Function to get the appropriate title based on current language
  const getTitle = (manga) => {
    if (currentLanguage === 'th' && manga.thaiTitle) {
      return manga.thaiTitle;
    }
    return manga.title;
  };

  // Function to get the appropriate description based on current language
  const getDescription = (manga) => {
    // For now, we'll use the description as is since we've already prioritized Thai in the API
    return manga.description;
  };

  // Value object to be provided to consumers
  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    getTitle,
    getDescription,
    isThai: currentLanguage === 'th'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;