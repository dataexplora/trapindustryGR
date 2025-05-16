import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook that listens for language changes and triggers component updates
 * Can be used in any component that needs to respond to language changes
 */
export const useLanguageEffect = () => {
  const { language, refreshLanguage } = useLanguage();
  const [languageState, setLanguageState] = useState(language);
  const [, forceUpdate] = useState({});
  const isFirstRender = useRef(true);
  
  // Force a re-render without changing any state that would cause data refetching
  const forceRender = useCallback(() => {
    console.log(`useLanguageEffect: forcing UI re-render only for language: ${language}`);
    setLanguageState(language);
    forceUpdate({}); // This will force a re-render
  }, [language]);
  
  // Update local state when language prop changes
  useEffect(() => {
    if (language !== languageState) {
      console.log(`useLanguageEffect: language changed from ${languageState} to ${language}`);
      setLanguageState(language);
    }
  }, [language, languageState]);
  
  // Listen for language change events
  useEffect(() => {
    // Set initial value without triggering a re-fetch
    if (isFirstRender.current) {
      setLanguageState(language);
      isFirstRender.current = false;
      return;
    }
    
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newLanguage = customEvent.detail?.language;
      const forceRefresh = customEvent.detail?.forceRefresh;
      
      console.log('Language change event detected:', newLanguage, 'Force refresh:', forceRefresh);
      
      if (forceRefresh) {
        // Force a re-render immediately
        forceUpdate({});
      }
      
      // Only update if the language actually changed
      if (newLanguage && newLanguage !== languageState) {
        setLanguageState(newLanguage);
      }
    };
    
    // Add event listener (type assertion for CustomEvent)
    document.addEventListener('languageChanged', handleLanguageChange);
    
    // Cleanup listener on unmount
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [language, languageState]);
  
  return { 
    currentLanguage: languageState, 
    refreshLanguage,
    forceRender 
  };
};

export default useLanguageEffect; 