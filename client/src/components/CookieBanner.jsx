import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-xl z-[100] flex flex-col sm:flex-row items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
        We use cookies to ensure you get the best experience on our website. <a href="/privacy" className="text-primary-600 hover:underline">Learn more</a>
      </div>
      <button 
        onClick={handleAccept}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
      >
        Got it!
      </button>
    </div>
  );
};

export default CookieBanner;
