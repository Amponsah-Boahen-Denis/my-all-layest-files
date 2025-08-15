'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './search.module.css';
import SearchBar from '../../components/SearchBar';
import '../../components/search.css';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: string;
  phone?: string;
  email?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  relevance: number;
}

interface SearchResults {
  query: string;
  country: string;
  location: string;
  productCategory: string;
  stores: SearchResult[];
  coordinates: {
    lat: number;
    lng: number;
  };
  layout: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (results: SearchResults) => {
    setSearchResults(results);
  };

  const saveToHistory = async (result: SearchResult) => {
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: result.id,
          name: result.name,
          address: result.address,
          type: result.type,
          phone: result.phone,
          email: result.email,
          coordinates: result.coordinates,
          searchQuery: searchResults?.query || query
        }),
      });
      
      if (response.ok) {
        alert('Saved to history!');
      }
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('Failed to save to history');
    }
  };

  const renderStores = (stores: SearchResult[], layout: string) => {
    if (layout === 'list') {
      return (
        <div className={styles.resultList}>
          {stores.map((result) => (
            <div key={result.id} className={styles.resultListItem}>
              <div className={styles.resultInfo}>
                <h3>{result.name}</h3>
                <p className={styles.address}>{result.address}</p>
                <p className={styles.type}>{result.type}</p>
                {result.phone && <p className={styles.phone}>📞 {result.phone}</p>}
                {result.email && <p className={styles.email}>✉️ {result.email}</p>}
                <p className={styles.coordinates}>
                  📍 {result.coordinates.lat.toFixed(4)}, {result.coordinates.lon.toFixed(4)}
                </p>
                <p className={styles.relevance}>Relevance: {result.relevance}</p>
              </div>
              <button 
                onClick={() => saveToHistory(result)}
                className={styles.saveButton}
              >
                Save to History
              </button>
            </div>
          ))}
        </div>
      );
    }

    // Grid layout (default)
    return (
      <div className={styles.resultGrid}>
        {stores.map((result) => (
          <div key={result.id} className={styles.resultCard}>
            <h3>{result.name}</h3>
            <p className={styles.address}>{result.address}</p>
            <p className={styles.type}>{result.type}</p>
            {result.phone && <p className={styles.phone}>📞 {result.phone}</p>}
            {result.email && <p className={styles.email}>✉️ {result.email}</p>}
            <p className={styles.coordinates}>
              📍 {result.coordinates.lat.toFixed(4)}, {result.coordinates.lon.toFixed(4)}
            </p>
            <p className={styles.relevance}>Relevance: {result.relevance}</p>
            <button 
              onClick={() => saveToHistory(result)}
              className={styles.saveButton}
            >
              Save to History
            </button>
          </div>
        ))}
      </div>
    );
  };

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
      
      <h1 className={styles.title}>Search Stores</h1>
      
      <SearchBar onSearch={handleSearch} />

      {searchResults && (
        <div className={styles.results}>
          <h2>Search Results for "{searchResults.query}"</h2>
          <p className={styles.searchInfo}>
            Found {searchResults.stores.length} stores in {searchResults.location}, {searchResults.country}
          </p>
          <p className={styles.categoryInfo}>
            Category: {searchResults.productCategory}
          </p>
          {renderStores(searchResults.stores, searchResults.layout)}
        </div>
      )}

      {!searchResults && query && (
        <div className={styles.noResults}>
          <p>No results found for "{query}". Try using the search form above.</p>
        </div>
      )}
    </div>
  );
} 