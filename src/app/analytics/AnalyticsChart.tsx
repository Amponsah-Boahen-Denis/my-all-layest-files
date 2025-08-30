'use client';

import React, { useMemo, useCallback } from 'react';
import styles from './analytics.module.css';

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

interface AnalyticsChartProps {
  analyticsData: AnalyticsData;
  formatNumber: (num: number) => string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = React.memo(({ 
  analyticsData, 
  formatNumber 
}) => {
  const getHourLabel = useCallback((hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  }, []);

  const maxHourlyCount = useMemo(() => {
    return Math.max(...analyticsData.hourlyTrends.map(h => h.count));
  }, [analyticsData.hourlyTrends]);

  const maxCategoryCount = useMemo(() => {
    if (analyticsData.popularCategories.length === 0) return 1;
    return analyticsData.popularCategories[0].count;
  }, [analyticsData.popularCategories]);

  return (
    <>
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
                    width: `${(category.count / maxCategoryCount) * 100}%`,
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
                    height: `${(hour.count / maxHourlyCount) * 100}%`,
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
    </>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';

export default AnalyticsChart;
