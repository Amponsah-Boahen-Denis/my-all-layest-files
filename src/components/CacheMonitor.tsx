'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CacheStats {
  total: number;
  google: number;
  user: number;
  database: number;
  googlePercentage: number;
}

interface RecentUpdate {
  storeName: string;
  lastGoogleUpdate: string;
  rating: number;
}

interface CacheInfo {
  cacheInfo: CacheStats;
  endpoints: {
    stats: string;
    list: string;
    clear: string;
  };
}

const CacheMonitor: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch basic cache info
  const fetchCacheInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cache');
      if (response.ok) {
        const data = await response.json();
        setCacheInfo(data);
      } else {
        throw new Error('Failed to fetch cache info');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch detailed cache stats
  const fetchCacheStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cache?action=stats');
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data.cacheStats);
        setRecentUpdates(data.recentUpdates);
      } else {
        throw new Error('Failed to fetch cache stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache action
  const clearCache = useCallback(async (action: 'clear' | 'clear-old' | 'refresh') => {
    if (!confirm(`Are you sure you want to ${action} the cache?`)) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cache?action=${action}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Refresh cache info
        await fetchCacheInfo();
        await fetchCacheStats();
      } else {
        throw new Error('Failed to clear cache');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchCacheInfo, fetchCacheStats]);

  // Load cache info on component mount
  useEffect(() => {
    fetchCacheInfo();
    fetchCacheStats();
  }, [fetchCacheInfo, fetchCacheStats]);

  if (loading && !cacheInfo) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>🔄 Loading cache information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
        <div>❌ Error: {error}</div>
        <button 
          onClick={() => fetchCacheInfo()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>🗄️ Google Places Cache Monitor</h2>
      
      {/* Cache Overview */}
      {cacheInfo && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {cacheInfo.cacheInfo.totalStores}
            </div>
            <div style={{ color: '#6c757d' }}>Total Stores</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #c3e6c3'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {cacheInfo.cacheInfo.googleStores}
            </div>
            <div style={{ color: '#6c757d' }}>Google Cached</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid '#ffeaa7'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {cacheInfo.cacheInfo.googlePercentage}%
            </div>
            <div style={{ color: '#6c757d' }}>Cache Coverage</div>
          </div>
        </div>
      )}

      {/* Cache Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Cache Management</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => clearCache('clear')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🗑️ Clear All Cache
          </button>
          
          <button
            onClick={() => clearCache('clear-old')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🕒 Clear Old Cache
          </button>
          
          <button
            onClick={() => clearCache('refresh')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔄 Mark for Refresh
          </button>
          
          <button
            onClick={() => fetchCacheStats()}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            📊 Refresh Stats
          </button>
        </div>
      </div>

      {/* Recent Updates */}
      {recentUpdates.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Recent Google Updates</h3>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {recentUpdates.map((update, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  borderBottom: index < recentUpdates.length - 1 ? '1px solid #f8f9fa' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                    {update.storeName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>
                    Updated: {new Date(update.lastGoogleUpdate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: '#e8f5e8',
                  color: '#28a745',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ⭐ {update.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
          <div>🔄 Processing...</div>
        </div>
      )}
    </div>
  );
};

export default CacheMonitor;
