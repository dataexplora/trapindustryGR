import React, { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage, refreshLanguage, t } = useLanguage();

  const toggleLanguage = useCallback(() => {
    // Set the new language
    const newLanguage = language === 'en' ? 'el' : 'en';
    console.log(`LanguageToggle: changing language from ${language} to ${newLanguage}`);
    
    // Update the language in the context
    setLanguage(newLanguage);
    
    // Manually trigger a refresh to ensure components update
    setTimeout(() => {
      console.log('LanguageToggle: triggering manual refresh');
      refreshLanguage();
    }, 50);
  }, [language, setLanguage, refreshLanguage]);

  // Get the opposite language's name for aria-label
  const oppositeLanguage = language === 'en' ? 'Greek' : 'English';

  return (
    <button
      onClick={toggleLanguage}
      className={`bg-transparent border-0 cursor-pointer p-2 ${className}`}
      aria-label={t('language.switch', 'Switch to {0}', oppositeLanguage)}
      title={t('language.switch', 'Switch to {0}', oppositeLanguage)}
    >
      <img 
        src={language === 'en' ? '/assets/images/flags/us.svg' : '/assets/images/flags/gr.svg'} 
        alt={language === 'en' ? 'US Flag' : 'Greek Flag'}
        className="w-8 h-5 rounded-full"
      />
    </button>
  );
};

export default LanguageToggle; 