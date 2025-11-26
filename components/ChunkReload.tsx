// components/ChunkReload.tsx
'use client';

import { useEffect } from 'react';

export default function ChunkReload() {
  useEffect(() => {
    // ==========================================
    // Auto-reload on chunk load errors
    // ==========================================
    const handleChunkError = (event: ErrorEvent) => {
      if (event.message && /Loading chunk [\d]+ failed/.test(event.message)) {
        console.warn('🔄 New deployment detected, reloading page...');
        window.location.reload();
      }
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'ChunkLoadError') {
        console.warn('🔄 New deployment detected, reloading page...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    // ==========================================
    // Proactive version checking
    // ==========================================
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/api/version', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) return;
        
        const { buildId } = await response.json();
        const storedBuildId = sessionStorage.getItem('buildId');
        
        if (storedBuildId && storedBuildId !== buildId) {
          console.log('🆕 New version detected, reloading...');
          sessionStorage.setItem('buildId', buildId);
          window.location.reload();
        } else if (!storedBuildId) {
          sessionStorage.setItem('buildId', buildId);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    // Check when user returns to tab
    window.addEventListener('focus', checkForUpdates);
    
    // Check every 3 minutes
    const interval = setInterval(checkForUpdates, 3 * 60 * 1000);

    // Initial check after 10 seconds
    const timeout = setTimeout(checkForUpdates, 10000);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.removeEventListener('focus', checkForUpdates);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return null; // This component doesn't render anything
}