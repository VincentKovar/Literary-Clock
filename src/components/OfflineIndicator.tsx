import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-[#c49a45]/60 bg-[#251509]/95 backdrop-blur-xs px-3.5 py-2 text-xs font-serif text-[#f2e7d3] shadow-xl animate-fade-in">
      <WifiOff className="w-4 h-4 text-[#e5be62] animate-pulse" />
      <span>Offline Mode — Complete literary catalog is stored locally.</span>
    </div>
  );
};
