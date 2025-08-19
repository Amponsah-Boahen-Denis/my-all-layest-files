'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalUsers: number;
  totalSearches: number;
  totalSavedLocations: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'search' | 'registration' | 'login';
  description: string;
  timestamp: string;
  userId?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock dashboard data - in a real app this would come from APIs
      const mockStats: DashboardStats = {
        totalUsers: 1247,
        totalSearches: 8942,
        totalSavedLocations: 3156,
        activeUsers: 89
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'search',
          description: 'User searched for "Central Park"',
          timestamp: '2024-01-20T10:30:00Z',
          userId: 'user123'
        },
        {
          id: '2',
          type: 'registration',
          description: 'New user registered: jane.doe@example.com',
          timestamp: '2024-01-20T10:25:00Z',
          userId: 'user456'
        },
        {
          id: '3',
          type: 'login',
          description: 'User logged in: john.smith@example.com',
          timestamp: '2024-01-20T10:20:00Z',
          userId: 'user789'
        },
        {
          id: '4',
          type: 'search',
          description: 'User searched for "Times Square"',
          timestamp: '2024-01-20T10:15:00Z',
          userId: 'user101'
        },
        {
          id: '5',
          type: 'search',
          description: 'User searched for "Brooklyn Bridge"',
          timestamp: '2024-01-20T10:10:00Z',
          userId: 'user202'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statNumber}>{stats.totalUsers.toLocaleString()}</p>
          <span className={styles.statLabel}>Registered users</span>
        </div>
        
        <div className={styles.statCard}>
          <h3>Total Searches</h3>
          <p className={styles.statNumber}>{stats.totalSearches.toLocaleString()}</p>
          <span className={styles.statLabel}>Location searches</span>
        </div>
        
        <div className={styles.statCard}>
          <h3>Saved Locations</h3>
          <p className={styles.statNumber}>{stats.totalSavedLocations.toLocaleString()}</p>
          <span className={styles.statLabel}>Bookmarked places</span>
        </div>
        
        <div className={styles.statCard}>
          <h3>Active Users</h3>
          <p className={styles.statNumber}>{stats.activeUsers}</p>
          <span className={styles.statLabel}>Online now</span>
        </div>
      </div>

      <div className={styles.activitySection}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          {recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {activity.type === 'search' && '🔍'}
                {activity.type === 'registration' && '👤'}
                {activity.type === 'login' && '🔑'}
              </div>
              
              <div className={styles.activityContent}>
                <p className={styles.activityDescription}>{activity.description}</p>
                <span className={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              
              {activity.userId && (
                <span className={styles.userId}>ID: {activity.userId}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <button className={styles.actionButton}>
            View All Users
          </button>
          <button className={styles.actionButton}>
            View Activity Logs
          </button>
          <button className={styles.actionButton}>
            Cache Management
          </button>
          <button className={styles.actionButton}>
            System Settings
          </button>
        </div>
      </div>

      {/* Cache Management Section */}
      <div className={styles.cacheSection}>
        <h2>Cache & Google API Status</h2>
        <div className={styles.cacheGrid}>
          <div className={styles.cacheCard}>
            <h3>Cache Performance</h3>
            <div className={styles.cacheStats}>
              <div className={styles.cacheStat}>
                <span className={styles.statLabel}>Hit Rate</span>
                <span className={styles.statValue}>85%</span>
              </div>
              <div className={styles.cacheStat}>
                <span className={styles.statLabel}>Total Entries</span>
                <span className={styles.statValue}>247</span>
              </div>
              <div className={styles.cacheStat}>
                <span className={styles.statLabel}>Memory Usage</span>
                <span className={styles.statValue}>2.3 MB</span>
              </div>
            </div>
          </div>
          
          <div className={styles.cacheCard}>
            <h3>Google API Integration</h3>
            <div className={styles.apiStatus}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>API Status</span>
                <span className={styles.statusValue}>🟢 Active</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Fallback Searches</span>
                <span className={styles.statusValue}>156</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Stores Synced</span>
                <span className={styles.statusValue}>89</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.cacheActions}>
          <button className={styles.cacheButton}>
            View Cache Stats
          </button>
          <button className={styles.cacheButton}>
            Clear Cache
          </button>
          <button className={styles.cacheButton}>
            Popular Searches
          </button>
        </div>
      </div>
    </div>
  );
} 