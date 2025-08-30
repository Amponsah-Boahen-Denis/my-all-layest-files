'use client';

import React, { useMemo } from 'react';
import styles from './analytics.module.css';

interface PerformanceMetrics {
  totalSearches: number;
  avgSearchTime: number;
  avgResults: number;
  cacheHits: number;
  databaseHits: number;
  googleApiHits: number;
}

interface MetricsGridProps {
  performanceMetrics: PerformanceMetrics;
  formatNumber: (num: number) => string;
  formatTime: (ms: number) => string;
}

const MetricsGrid: React.FC<MetricsGridProps> = React.memo(({ 
  performanceMetrics, 
  formatNumber, 
  formatTime 
}) => {
  const cacheHitRate = useMemo(() => {
    if (performanceMetrics.totalSearches === 0) return 0;
    return ((performanceMetrics.cacheHits / performanceMetrics.totalSearches) * 100).toFixed(1);
  }, [performanceMetrics.cacheHits, performanceMetrics.totalSearches]);

  return (
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}>
        <h3>Total Searches</h3>
        <p className={styles.metricValue}>{formatNumber(performanceMetrics.totalSearches)}</p>
        <span className={styles.metricLabel}>Total search queries</span>
      </div>

      <div className={styles.metricCard}>
        <h3>Avg Search Time</h3>
        <p className={styles.metricValue}>{formatTime(performanceMetrics.avgSearchTime)}</p>
        <span className={styles.metricLabel}>Average response time</span>
      </div>

      <div className={styles.metricCard}>
        <h3>Avg Results</h3>
        <p className={styles.metricValue}>{performanceMetrics.avgResults.toFixed(1)}</p>
        <span className={styles.metricLabel}>Average results per search</span>
      </div>

      <div className={styles.metricCard}>
        <h3>Cache Hit Rate</h3>
        <p className={styles.metricValue}>{cacheHitRate}%</p>
        <span className={styles.metricLabel}>Searches served from cache</span>
      </div>
    </div>
  );
});

MetricsGrid.displayName = 'MetricsGrid';

export default MetricsGrid;
