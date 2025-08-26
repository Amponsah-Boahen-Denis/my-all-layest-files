'use client';

import { useState, useEffect } from 'react';
import styles from './analytics.module.css';
import ProtectedRoute from '@/components/ProtectedRoute';

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

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    period: '7d',
    country: '',
    location: '',
    category: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: filters.period,
        ...(filters.country && { country: filters.country }),
        ...(filters.location && { location: filters.location }),
        ...(filters.category && { category: filters.category })
      });

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')} className={styles.closeError}>×</button>
        </div>
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
      {/* Development Mode Indicator */}
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

      <div className={styles.header}>
        <h1 className={styles.title}>Search Analytics Dashboard</h1>
        <div className={styles.periodInfo}>
          <span>Period: {filters.period}</span>
          <span>From: {new Date(analyticsData.startDate).toLocaleDateString()}</span>
          <span>To: {new Date(analyticsData.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Time Period:</label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
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
            onChange={(e) => handleFilterChange('country', e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Location:</label>
          <input
            type="text"
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Category:</label>
          <input
            type="text"
            placeholder="Filter by category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <h3>Total Searches</h3>
          <p className={styles.metricValue}>{formatNumber(analyticsData.performanceMetrics.totalSearches)}</p>
          <span className={styles.metricLabel}>Total search queries</span>
        </div>

        <div className={styles.metricCard}>
          <h3>Avg Search Time</h3>
          <p className={styles.metricValue}>{formatTime(analyticsData.performanceMetrics.avgSearchTime)}</p>
          <span className={styles.metricLabel}>Average response time</span>
        </div>

        <div className={styles.metricCard}>
          <h3>Avg Results</h3>
          <p className={styles.metricValue}>{analyticsData.performanceMetrics.avgResults.toFixed(1)}</p>
          <span className={styles.metricLabel}>Average results per search</span>
        </div>

        <div className={styles.metricCard}>
          <h3>Cache Hit Rate</h3>
          <p className={styles.metricValue}>
            {((analyticsData.performanceMetrics.cacheHits / analyticsData.performanceMetrics.totalSearches) * 100).toFixed(1)}%
          </p>
          <span className={styles.metricLabel}>Searches served from cache</span>
        </div>
      </div>

      {/* Search Source Distribution */}
      <div className={styles.chartSection}>
        <h2>Search Source Distribution</h2>
        <div className={styles.sourceChart}>
          <div className={styles.sourceBar}>
            <div className={styles.sourceLabel}>Cache</div>
            <div className={styles.sourceBarContainer}>
              <div 
                className={styles.sourceBarFill}
                style={{
                  width: `${(analyticsData.performanceMetrics.cacheHits / analyticsData.performanceMetrics.totalSearches) * 100}%`,
                  background: '#51cf66'
                }}
              ></div>
            </div>
            <div className={styles.sourceValue}>{analyticsData.performanceMetrics.cacheHits}</div>
          </div>

          <div className={styles.sourceBar}>
            <div className={styles.sourceLabel}>Database</div>
            <div className={styles.sourceBarContainer}>
              <div 
                className={styles.sourceBarFill}
                style={{
                  width: `${(analyticsData.performanceMetrics.databaseHits / analyticsData.performanceMetrics.totalSearches) * 100}%`,
                  background: '#17a2b8'
                }}
              ></div>
            </div>
            <div className={styles.sourceValue}>{analyticsData.performanceMetrics.databaseHits}</div>
          </div>

          <div className={styles.sourceBar}>
            <div className={styles.sourceLabel}>Google API</div>
            <div className={styles.sourceBarContainer}>
              <div 
                className={styles.sourceBarFill}
                style={{
                  width: `${(analyticsData.performanceMetrics.googleApiHits / analyticsData.performanceMetrics.totalSearches) * 100}%`,
                  background: '#ffc107'
                }}
              ></div>
            </div>
            <div className={styles.sourceValue}>{analyticsData.performanceMetrics.googleApiHits}</div>
          </div>
        </div>
      </div>

      {/* Popular Searches and Locations */}
      <div className={styles.dataGrid}>
        <div className={styles.dataCard}>
          <h3>Popular Search Queries</h3>
          <div className={styles.dataList}>
            {analyticsData.popularQueries.slice(0, 10).map((query, index) => (
              <div key={query._id} className={styles.dataItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.name}>{query._id}</span>
                <span className={styles.count}>{formatNumber(query.count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dataCard}>
          <h3>Popular Locations</h3>
          <div className={styles.dataList}>
            {analyticsData.popularLocations.slice(0, 10).map((location, index) => (
              <div key={`${location._id.location}-${location._id.country}`} className={styles.dataItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.name}>
                  {location._id.location}, {location._id.country}
                </span>
                <span className={styles.count}>{formatNumber(location.count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className={styles.chartSection}>
        <h2>Popular Product Categories</h2>
        <div className={styles.categoryChart}>
          {analyticsData.popularCategories.slice(0, 8).map((category, index) => (
            <div key={category._id} className={styles.categoryBar}>
              <div className={styles.categoryLabel}>{category._id}</div>
              <div className={styles.categoryBarContainer}>
                <div 
                  className={styles.categoryBarFill}
                  style={{
                    width: `${(category.count / analyticsData.popularCategories[0].count) * 100}%`,
                    background: `hsl(${200 + index * 30}, 70%, 60%)`
                  }}
                ></div>
              </div>
              <div className={styles.categoryValue}>{formatNumber(category.count)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Trends */}
      <div className={styles.chartSection}>
        <h2>Search Activity by Hour</h2>
        <div className={styles.hourlyChart}>
          {analyticsData.hourlyTrends.map((hour) => (
            <div key={hour._id} className={styles.hourlyBar}>
              <div className={styles.hourlyLabel}>{getHourLabel(hour._id)}</div>
              <div className={styles.hourlyBarContainer}>
                <div 
                  className={styles.hourlyBarFill}
                  style={{
                    height: `${(hour.count / Math.max(...analyticsData.hourlyTrends.map(h => h.count))) * 100}%`,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                ></div>
              </div>
              <div className={styles.hourlyValue}>{hour.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Device and Browser Stats */}
      <div className={styles.dataGrid}>
        <div className={styles.dataCard}>
          <h3>Device Types</h3>
          <div className={styles.dataList}>
            {analyticsData.deviceStats.map((device) => (
              <div key={device._id || 'Unknown'} className={styles.dataItem}>
                <span className={styles.name}>{device._id || 'Unknown'}</span>
                <span className={styles.count}>{formatNumber(device.count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dataCard}>
          <h3>Browser Usage</h3>
          <div className={styles.dataList}>
            {analyticsData.browserStats.slice(0, 8).map((browser) => (
              <div key={browser._id || 'Unknown'} className={styles.dataItem}>
                <span className={styles.name}>{browser._id || 'Unknown'}</span>
                <span className={styles.count}>{formatNumber(browser.count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
