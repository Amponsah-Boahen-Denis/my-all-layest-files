'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint')[0];

        const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        const firstContentfulPaint = fcp ? fcp.startTime : 0;
        const largestContentfulPaint = lcp ? lcp.startTime : 0;

        setMetrics({
          pageLoadTime,
          domContentLoaded,
          firstContentfulPaint,
          largestContentfulPaint,
        });
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible || !metrics) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '250px',
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        🚀 Performance Monitor (Ctrl+Shift+P)
      </div>
      <div>Page Load: {metrics.pageLoadTime.toFixed(0)}ms</div>
      <div>DOM Ready: {metrics.domContentLoaded.toFixed(0)}ms</div>
      <div>FCP: {metrics.firstContentfulPaint.toFixed(0)}ms</div>
      <div>LCP: {metrics.largestContentfulPaint.toFixed(0)}ms</div>
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        {metrics.pageLoadTime > 3000 ? '⚠️ Slow' : metrics.pageLoadTime > 1000 ? '⚠️ Moderate' : '✅ Fast'}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
