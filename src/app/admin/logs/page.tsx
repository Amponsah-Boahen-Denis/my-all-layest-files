'use client';

import { useState, useEffect } from 'react';
import styles from './logs.module.css';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'auth' | 'search' | 'user' | 'system';
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Mock logs data - in a real app this would come from an API
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-20T10:30:00Z',
          level: 'info',
          category: 'auth',
          message: 'User login successful',
          userId: 'user123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '2',
          timestamp: '2024-01-20T10:25:00Z',
          level: 'info',
          category: 'search',
          message: 'Location search performed: "Central Park"',
          userId: 'user456',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        {
          id: '3',
          timestamp: '2024-01-20T10:20:00Z',
          level: 'warning',
          category: 'auth',
          message: 'Failed login attempt for email: unknown@example.com',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        },
        {
          id: '4',
          timestamp: '2024-01-20T10:15:00Z',
          level: 'info',
          category: 'user',
          message: 'New user registration: jane.doe@example.com',
          userId: 'user789',
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '5',
          timestamp: '2024-01-20T10:10:00Z',
          level: 'error',
          category: 'system',
          message: 'Database connection timeout',
          ipAddress: '192.168.1.1',
          userAgent: 'System/1.0'
        },
        {
          id: '6',
          timestamp: '2024-01-20T10:05:00Z',
          level: 'debug',
          category: 'search',
          message: 'Search query cache miss',
          userId: 'user101',
          ipAddress: '192.168.1.104',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return '#3498db';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      case 'debug': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return '🔐';
      case 'search': return '🔍';
      case 'user': return '👤';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesLevel && matchesCategory && matchesSearch;
  });

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      setLogs([]);
      alert('All logs have been cleared');
    }
  };

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      userId: log.userId || 'N/A',
      ipAddress: log.ipAddress || 'N/A'
    }));

    const csvContent = [
      'Timestamp,Level,Category,Message,User ID,IP Address',
      ...logData.map(log => 
        `${log.timestamp},${log.level},${log.category},"${log.message}",${log.userId},${log.ipAddress}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading logs...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Activity Logs</h1>
      
      <div className={styles.controls}>
        <div className={styles.filters}>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="search">Search</option>
            <option value="user">User</option>
            <option value="system">System</option>
          </select>

          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={exportLogs} className={styles.exportButton}>
            Export Logs
          </button>
          <button onClick={clearLogs} className={styles.clearButton}>
            Clear All
          </button>
        </div>
      </div>

      <div className={styles.logsContainer}>
        <div className={styles.logsHeader}>
          <h2>Log Entries ({filteredLogs.length})</h2>
          <div className={styles.logStats}>
            <span>Info: {logs.filter(l => l.level === 'info').length}</span>
            <span>Warning: {logs.filter(l => l.level === 'warning').length}</span>
            <span>Error: {logs.filter(l => l.level === 'error').length}</span>
            <span>Debug: {logs.filter(l => l.level === 'debug').length}</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className={styles.noLogs}>
            <p>No logs found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.logsList}>
            {filteredLogs.map((log) => (
              <div key={log.id} className={styles.logEntry}>
                <div className={styles.logHeader}>
                  <div className={styles.logMeta}>
                    <span 
                      className={styles.levelBadge}
                      style={{ backgroundColor: getLevelColor(log.level) }}
                    >
                      {log.level.toUpperCase()}
                    </span>
                    <span className={styles.categoryIcon}>
                      {getCategoryIcon(log.category)}
                    </span>
                    <span className={styles.timestamp}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {log.userId && (
                    <span className={styles.userId}>User: {log.userId}</span>
                  )}
                </div>
                
                <p className={styles.logMessage}>{log.message}</p>
                
                <div className={styles.logDetails}>
                  {log.ipAddress && (
                    <span className={styles.detail}>IP: {log.ipAddress}</span>
                  )}
                  {log.userAgent && (
                    <span className={styles.detail}>Agent: {log.userAgent.substring(0, 50)}...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 