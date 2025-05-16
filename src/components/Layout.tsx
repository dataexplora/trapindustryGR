import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Instagram, Twitter, Youtube, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize reCAPTCHA after script loads
      if (window.grecaptcha && recaptchaRef.current) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
            theme: 'dark',
            size: 'normal'
          });
        });
      }
    };
    
    document.head.appendChild(script);

    return () => {
      // Clean up script tag
      const scripts = document.head.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('recaptcha')) {
          document.head.removeChild(scripts[i]);
          break;
        }
      }
    };
  }, [showCaptcha]); // Only reload when showCaptcha changes

  const validateEmail = (email: string): boolean => {
    // More comprehensive email validation
    const emailRegex = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
    
    // Basic checks
    if (!email || email.length > 254) return false;
    if (email.startsWith('.') || email.endsWith('.')) return false;
    if (email.includes('..')) return false;
    
    return emailRegex.test(email);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCaptcha(true);
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setSubscriptionStatus('error');
      return;
    }
    
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get reCAPTCHA token
    const token = window.grecaptcha.getResponse();
    if (!token) {
      setErrorMessage('Please complete the reCAPTCHA verification');
      setSubscriptionStatus('error');
      return;
    }

    try {
      setSubscriptionStatus('loading');
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ 
          email, 
          subscribed_at: new Date().toISOString()
        }]);

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('This email is already subscribed.');
          setSubscriptionStatus('error');
        } else {
          throw error;
        }
        return;
      }

      setSubscriptionStatus('success');
      setEmail('');
      setShowCaptcha(false);
      window.grecaptcha.reset();
      setTimeout(() => setSubscriptionStatus('idle'), 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setErrorMessage('Failed to subscribe. Please try again later.');
      setSubscriptionStatus('error');
      setTimeout(() => setSubscriptionStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-7 shadow-lg relative">
        <div className="container mx-auto px-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute right-4 lg:hidden z-50 p-1 bg-transparent focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Logo - Centered on mobile, left-aligned on desktop */}
          <div className="flex justify-center lg:justify-between items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/assets/images/logo.webp" 
                alt="Urban Greece Logo" 
                className="h-8 lg:pl-8 lg:mt-3 w-auto transition-transform duration-200 hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden mr-6 lg:block">
              <ul className="flex items-center space-x-6">
                <li>
                  <Link to="/" className={`hover:text-white/80 transition-colors ${location.pathname === '/' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/discover" className={`hover:text-white/80 transition-colors ${location.pathname === '/discover' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                    Discover
                  </Link>
                </li>
                <li>
                  <Link to="/hot-artists" className={`hover:text-white/80 transition-colors flex items-center ${location.pathname === '/hot-artists' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Hot Artists
                  </Link>
                </li>
                <li>
                  <Link to="/songs" className={`hover:text-white/80 transition-colors ${location.pathname === '/songs' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                    Songs
                  </Link>
                </li>
                <li className="ml-2">
                  <LanguageToggle />
                </li>
              </ul>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <nav className="fixed inset-0 bg-gradient-to-r from-indigo-900/95 to-purple-900/95 backdrop-blur-sm lg:hidden z-40">
              <div className="h-full flex items-center justify-center">
                <ul className="flex flex-col space-y-8 text-center">
                  <li>
                    <Link 
                      to="/" 
                      className={`text-2xl font-medium ${location.pathname === '/' ? 'text-white' : 'text-white/70'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/discover" 
                      className={`text-2xl font-medium ${location.pathname === '/discover' ? 'text-white' : 'text-white/70'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Discover
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/hot-artists" 
                      className={`text-2xl font-medium flex items-center justify-center ${location.pathname === '/hot-artists' ? 'text-white' : 'text-white/70'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Hot Artists
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/songs" 
                      className={`text-2xl font-medium ${location.pathname === '/songs' ? 'text-white' : 'text-white/70'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Songs
                    </Link>
                  </li>
                  <li className="mt-4">
                    <div className="flex justify-center">
                      <LanguageToggle />
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          )}
        </div>
      </header>
      
      <main className="flex-grow bg-dark-background">
        {children}
      </main>
      
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* About Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <img 
                  src="/assets/images/icon.webp" 
                  alt="Urban Greece Logo" 
                  className="h-12 w-auto mr-2"
                />
                <h3 className="text-xl font-bold">Urban Greece</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {t('footer.p1', 'Your premier destination for discovering the vibrant world of Greek urban music. We showcase the best artists, tracks, and emerging talents in the Greek music scene.')}
              </p>
              <div className="text-gray-400 text-sm">
                <p>Athens, Greece</p>
                <p>contact@urbangreece.com</p>
              </div>
            </div>
            
            {/* Quick Links Section */}
            <div className="text-center grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-4">Navigation</h4>
                <nav className="flex flex-col space-y-2">
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
                  <Link to="/discover" className="text-gray-400 hover:text-white transition-colors">Discover</Link>
                  <Link to="/hot-artists" className="text-gray-400 hover:text-white transition-colors">Hot Artists</Link>
                  <Link to="/songs" className="text-gray-400 hover:text-white transition-colors">Songs</Link>
                </nav>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <nav className="flex flex-col space-y-2">
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link>
                </nav>
              </div>
            </div>
            
            {/* Connect Section */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest updates in Greek urban music.</p>
              <form onSubmit={showCaptcha ? handleNewsletterSubmit : handleInitialSubmit} className="flex flex-col space-y-3">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button 
                  type="submit" 
                  disabled={subscriptionStatus === 'loading'}
                  className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded transition-all
                    ${subscriptionStatus === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                >
                  {subscriptionStatus === 'loading' ? 'Subscribing...' : 
                   subscriptionStatus === 'success' ? 'Subscribed!' : 
                   subscriptionStatus === 'error' ? 'Try Again' : 
                   showCaptcha ? 'Complete Verification' : 'Subscribe'}
                </button>
                {/* Status messages */}
                {subscriptionStatus === 'success' && (
                  <p className="text-green-500 text-sm">Thanks for subscribing!</p>
                )}
                {subscriptionStatus === 'error' && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
                {/* reCAPTCHA */}
                {showCaptcha && (
                  <div className="flex justify-center mt-4">
                    <div 
                      ref={recaptchaRef}
                      className="g-recaptcha-container"
                    />
                  </div>
                )}
              </form>
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex items-center justify-center md:justify-end space-x-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div className="text-gray-400 text-sm">
                <p>{t('footer.copyright', '© {0} Urban Greece. All rights reserved. Celebrating and elevating Greek urban music culture.', new Date().getFullYear())}</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <p className="text-gray-500 text-xs">Powered by</p>
                <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-xs">Spotify</a>
                <span className="text-gray-600">|</span>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-xs">Supabase</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
