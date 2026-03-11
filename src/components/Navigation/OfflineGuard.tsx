'use client';

import { useState, useEffect } from 'react';
import { WifiOff, ArrowRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineGuard({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if we are on the downloads route or its subpaths
  const isDownloadsPage = pathname === '/downloads' || pathname.startsWith('/downloads/');

  return (
    <>
      <AnimatePresence>
        {isOffline && !isDownloadsPage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <WifiOff size={40} className="text-red-500" />
            </div>
            
            <h2 className="text-3xl font-black italic mb-2">You're Offline</h2>
            <p className="text-white/40 max-w-[280px] mb-8">
              Internet connection lost. You can still listen to your downloaded music.
            </p>

            <button 
              onClick={() => router.push('/downloads')}
              className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              GO TO DOWNLOADS <ArrowRight size={20} />
            </button>
            
            <div className="mt-12 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 animate-pulse">
              Reconnecting...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
