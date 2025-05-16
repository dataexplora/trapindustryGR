import React, { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FloatingLanguageToggle: React.FC = () => {
  const { language, setLanguage, refreshLanguage, t } = useLanguage();

  const toggleLanguage = useCallback(() => {
    // Set the new language
    const newLanguage = language === 'en' ? 'el' : 'en';
    
    // Update the language in the context
    setLanguage(newLanguage);
    
    // Manually trigger a refresh to ensure components update
    setTimeout(() => {
      refreshLanguage();
    }, 50);
  }, [language, setLanguage, refreshLanguage]);

  // Get the opposite language's name for aria-label
  const oppositeLanguage = language === 'en' ? 'Greek' : 'English';

  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleLanguage}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg rounded-full p-3 flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 border-2 border-indigo-300"
        aria-label={t('language.switch', 'Switch to {0}', oppositeLanguage)}
        title={t('language.switch', 'Switch to {0}', oppositeLanguage)}
      >
        <img 
          src={language === 'en' ? '/assets/images/flags/us.svg' : '/assets/images/flags/gr.svg'} 
          alt={language === 'en' ? 'US Flag' : 'Greek Flag'}
          className="w-7 h-5 rounded"
        />
      </button>
    </div>
  );
};

export default FloatingLanguageToggle; 