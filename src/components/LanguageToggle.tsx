import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'el' : 'en');
  };

  // Get the opposite language's name for aria-label
  const oppositeLanguage = language === 'en' ? 'Greek' : 'English';

  return (
    <button
      onClick={toggleLanguage}
      className={`bg-transparent border-0 cursor-pointer ${className}`}
      aria-label={t('language.switch', 'Switch to {0}', oppositeLanguage)}
      title={t('language.switch', 'Switch to {0}', oppositeLanguage)}
      style={{ background: 'transparent', padding: '8px' }}
    >
      <img 
        src={language === 'en' ? '/assets/images/flags/us.svg' : '/assets/images/flags/gr.svg'} 
        alt={language === 'en' ? 'US Flag' : 'Greek Flag'}
        className="w-8 h-5 rounded-full"
        style={{ borderRadius: '9999px', overflow: 'hidden' }}
      />
    </button>
  );
};

export default LanguageToggle; 