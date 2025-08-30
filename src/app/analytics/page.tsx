'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import styles from './analytics.module.css';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load heavy components
const AnalyticsChart = lazy(() => import('./AnalyticsChart'));
const MetricsGrid = lazy(() => import('./MetricsGrid'));

interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  popularQueries: Array<{ _id: string; count: number }>;
  popularLocations: Array<{ _id: { location: string; country: string }; count: number }>;
  popularCategories: Array<{ _id: string; count: number }>;
  performanceMetrics: {
    totalSearches: number;
    avgSearchTime: number;
    avgResults: number;
    cacheHits: number;
    databaseHits: number;
    googleApiHits: number;
  };
  deviceStats: Array<{ _id: string; count: number }>;
  browserStats: Array<{ _id: string; count: number }>;
  hourlyTrends: Array<{ _id: number; count: number }>;
}

// Mock data for development/testing
const mockAnalyticsData: AnalyticsData = {
    period: '7d',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString(),
  popularQueries: [
    { _id: 'electronics', count: 1250 },
    { _id: 'restaurants', count: 980 },
    { _id: 'clothing', count: 756 },
    { _id: 'pharmacy', count: 432 },
    { _id: 'supermarket', count: 389 }
  ],
  popularLocations: [
    { _id: { location: 'New York', country: 'USA' }, count: 2340 },
    { _id: { location: 'London', country: 'UK' }, count: 1890 },
    { _id: { location: 'Tokyo', country: 'Japan' }, count: 1567 },
    { _id: { location: 'Paris', country: 'France' }, count: 1234 },
    { _id: { location: 'Sydney', country: 'Australia' }, count: 987 }
  ],
  popularCategories: [
    { _id: 'electronics', count: 1250 },
    { _id: 'restaurants', count: 980 },
    { _id: 'clothing', count: 756 },
    { _id: 'pharmacy', count: 432 },
    { _id: 'supermarket', count: 389 }
  ],
  performanceMetrics: {
    totalSearches: 5432,
    avgSearchTime: 245,
    avgResults: 12.5,
    cacheHits: 3245,
    databaseHits: 1567,
    googleApiHits: 620
  },
  deviceStats: [
    { _id: 'desktop', count: 3245 },
    { _id: 'mobile', count: 1890 },
    { _id: 'tablet', count: 297 }
  ],
  browserStats: [
    { _id: 'Chrome', count: 2987 },
    { _id: 'Safari', count: 1234 },
    { _id: 'Firefox', count: 876 },
    { _id: 'Edge', count: 335 }
  ],
  hourlyTrends: Array.from({ length: 24 }, (_, i) => ({
    _id: i,
    count: Math.floor(Math.random() * 200) + 50
  }))
};

// Memoized development mode indicator
const DevelopmentModeIndicator = React.memo(() => (
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '12px',
        marginBottom: '20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
      }}>
        🔓 DEVELOPMENT MODE: All features accessible without authentication
      </div>
));

DevelopmentModeIndicator.displayName = 'DevelopmentModeIndicator';

// Memoized header section
const HeaderSection = React.memo(({ 
  filters, 
  analyticsData 
}: { 
  filters: any; 
  analyticsData: AnalyticsData | null;
}) => (
      <div className={styles.header}>
        <h1 className={styles.title}>Search Analytics Dashboard</h1>
    {analyticsData && (
        <div className={styles.periodInfo}>
          <span>Period: {filters.period}</span>
          <span>From: {new Date(analyticsData.startDate).toLocaleDateString()}</span>
          <span>To: {new Date(analyticsData.endDate).toLocaleDateString()}</span>
        </div>
    )}
      </div>
));

HeaderSection.displayName = 'HeaderSection';

// Memoized filters section
const FiltersSection = React.memo(({ 
  filters, 
  onFilterChange 
}: { 
  filters: any; 
  onFilterChange: (key: string, value: string) => void;
}) => (
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Time Period:</label>
          <select
            value={filters.period}
        onChange={(e) => onFilterChange('period', e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Country:</label>
          <input
            type="text"
            placeholder="Filter by country"
            value={filters.country}
        onChange={(e) => onFilterChange('country', e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Location:</label>
          <input
            type="text"
            placeholder="Filter by location"
            value={filters.location}
        onChange={(e) => onFilterChange('location', e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Category:</label>
          <input
            type="text"
            placeholder="Filter by category"
            value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
          />
        </div>
      </div>
));

FiltersSection.displayName = 'FiltersSection';

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState({
    period: '7d',
    country: '',
    location: '',
    category: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        period: filters.period,
        ...(filters.country && { country: filters.country }),
        ...(filters.location && { location: filters.location }),
        ...(filters.category && { category: filters.category })
      });

      const response = await fetch(`/api/analytics?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.performanceMetrics) {
          setAnalyticsData(data);
          setUseMockData(false);
        } else {
          // API returned empty data, use mock data
          setAnalyticsData(mockAnalyticsData);
          setUseMockData(true);
        }
      } else {
        // API error, use mock data
        setAnalyticsData(mockAnalyticsData);
        setUseMockData(true);
        console.warn('Analytics API error, using mock data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Network error, use mock data
      setAnalyticsData(mockAnalyticsData);
      setUseMockData(true);
      setError('Using mock data due to connection issues');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }, []);

  const formatTime = useCallback((ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
            </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>No analytics data available</div>
            </div>
    );
  }

  return (
    <div className={styles.container}>
      <DevelopmentModeIndicator />
      
      {useMockData && (
        <div className={styles.mockDataWarning}>
          ⚠️ Using mock data for demonstration. Connect to database for real analytics.
              </div>
      )}

      <HeaderSection filters={filters} analyticsData={analyticsData} />

      <FiltersSection filters={filters} onFilterChange={handleFilterChange} />

      {/* Performance Metrics */}
      <Suspense fallback={<div className={styles.loading}>Loading metrics...</div>}>
        <MetricsGrid 
          performanceMetrics={analyticsData.performanceMetrics}
          formatNumber={formatNumber}
          formatTime={formatTime}
        />
      </Suspense>

      {/* Charts and Data */}
      <Suspense fallback={<div className={styles.loading}>Loading charts...</div>}>
        <AnalyticsChart 
          analyticsData={analyticsData}
          formatNumber={formatNumber}
        />
      </Suspense>
    </div>
  );
}

const ProtectedAnalyticsPage = () => {
  return (
    <ProtectedRoute>
      <AnalyticsPage />
    </ProtectedRoute>
  );
};

export default ProtectedAnalyticsPage;
