import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, ArrowBigUpDash } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAAlert = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [removeOfflineRuban, setRemoveOfflineRuban] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("Service Worker registered at:", swUrl);
      console.log("Registration object:", r.installing);
      if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          console.log('Installing state:', e.target.state);
        });
      }
    },
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !needRefresh) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {(isOffline && !removeOfflineRuban) && (
        <div className="bg-yellow-500 text-white p-2 text-center animate-slide-down flex justify-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span>You're currently offline. Some features may be limited.</span>
          </div>
          <button className='hover:bg-gray-800 rounded-lg' >
            <ArrowBigUpDash onClick={() => { setRemoveOfflineRuban(true) }} />
          </button>
        </div>
      )}

      {needRefresh && (
        <div className="bg-blue-500 text-white p-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>New version available</span>
            <button 
              onClick={() => updateServiceWorker(true)}
              className="ml-4 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              Update
            </button>
            <button 
              onClick={() => setNeedRefresh(false)}
              className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAAlert;