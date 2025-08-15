'use client';

import { useState, useEffect } from 'react';
import styles from './history.module.css';

interface HistoryItem {
  id: string;
  locationId: string;
  name: string;
  address: string;
  type: string;
  phone?: string;
  email?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  searchQuery: string;
  savedAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your search history...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Search History</h1>
      
      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No search history yet</h2>
          <p>Start searching for stores to build your history!</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((item) => (
            <div key={item.id} className={styles.historyCard}>
              <div className={styles.cardHeader}>
                <h3>{item.name}</h3>
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className={styles.removeButton}
                  title="Remove from history"
                >
                  ×
                </button>
              </div>
              
              <p className={styles.address}>{item.address}</p>
              <p className={styles.type}>{item.type}</p>
              
              {item.phone && (
                <p className={styles.phone}>📞 {item.phone}</p>
              )}
              
              {item.email && (
                <p className={styles.email}>✉️ {item.email}</p>
              )}
              
              {item.coordinates && (
                <p className={styles.coordinates}>
                  📍 {item.coordinates.lat.toFixed(4)}, {item.coordinates.lon.toFixed(4)}
                </p>
              )}
              
              <div className={styles.searchInfo}>
                <span className={styles.searchQuery}>
                  Searched for: "{item.searchQuery}"
                </span>
                <span className={styles.savedAt}>
                  Saved: {new Date(item.savedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 