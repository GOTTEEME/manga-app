import React, { createContext, useContext } from 'react';

// Thai-only language context
const LanguageContext = createContext({
  getTitle: (manga) => (manga?.thaiTitle || manga?.title || ''),
  getDescription: (manga) => manga?.description || '',
});

export function LanguageProvider({ children }) {
  const value = {
    getTitle: (manga) => (manga?.thaiTitle || manga?.title || ''),
    getDescription: (manga) => manga?.description || '',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;