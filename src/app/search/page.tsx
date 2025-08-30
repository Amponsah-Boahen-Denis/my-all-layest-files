'use client';

import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './search.module.css';
import '../../components/search.css';

// Lazy load heavy components
const SearchBar = lazy(() => import('../../components/SearchBar'));

interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: string;
  phone?: string;
  email?: string;
  coordinates: {
    lat: number;
    lng: number;
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
  totalResults?: number;
  searchSource?: string;
}

// Memoized search results display
const SearchResultsDisplay = React.memo(({ 
  searchResults, 
  onSaveToHistory 
}: { 
  searchResults: SearchResults; 
  onSaveToHistory: (result: SearchResult) => void;
}) => {
  // Debug logging to help identify the issue
  console.log('SearchResultsDisplay received:', searchResults);
  
  // Safety check
  if (!searchResults || !searchResults.stores || !Array.isArray(searchResults.stores)) {
    console.error('Invalid searchResults:', searchResults);
    return <div>Error: Invalid search results</div>;
  }

  const renderStores = useCallback((stores: SearchResult[], layout: string) => {
    if (layout === 'list') {
      return (
        <div className={styles.resultList}>
          {stores.map((result) => (
            <SearchResultItem key={result.id} result={result} onSave={onSaveToHistory} />
          ))}
        </div>
      );
    }

    // Grid layout (default)
    return (
      <div className={styles.resultGrid}>
        {stores.map((result) => (
          <SearchResultItem key={result.id} result={result} onSave={onSaveToHistory} />
        ))}
      </div>
    );
  }, [onSaveToHistory]);

  return (
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
  );
});

SearchResultsDisplay.displayName = 'SearchResultsDisplay';

// Memoized search result item
const SearchResultItem = React.memo(({ 
  result, 
  onSave 
}: { 
  result: SearchResult; 
  onSave: (result: SearchResult) => void;
}) => {
  const handleSave = useCallback(() => {
    onSave(result);
  }, [onSave, result]);

  // Safety check - ensure all required properties exist
  if (!result || typeof result !== 'object') {
    console.error('Invalid result object:', result);
    return null;
  }

  // Ensure coordinates exist and are valid
  if (!result.coordinates || typeof result.coordinates.lat !== 'number' || typeof result.coordinates.lng !== 'number') {
    console.error('Invalid coordinates in result:', result);
    return null;
  }

  return (
    <div className={styles.resultCard}>
      <h3>{result.name || 'Unknown Store'}</h3>
      <p className={styles.address}>{result.address || 'No address'}</p>
      <p className={styles.type}>{result.type || 'Unknown type'}</p>
      {result.phone && <p className={styles.phone}>📞 {result.phone}</p>}
      {result.email && <p className={styles.email}>✉️ {result.email}</p>}
      <p className={styles.coordinates}>
        📍 {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
      </p>
      {result.relevance !== undefined && (
        <p className={styles.relevance}>Relevance: {result.relevance}</p>
      )}
      <button onClick={handleSave} className={styles.saveButton}>
        Save to History
      </button>
    </div>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (results: SearchResults) => {
    const startTime = performance.now();
    
    // Debug logging to help identify the issue
    console.log('SearchPage received results:', results);
    
    try {
      setSearchResults(results);
      
      // Track search analytics
      try {
        const searchTime = Math.round(performance.now() - startTime);
        
        const analyticsResponse = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchQuery: results.query,
            location: results.location,
            country: results.country,
            productCategory: results.productCategory,
            searchResults: results.stores.length,
            searchTime: searchTime,
            searchSource: 'google_api',
            coordinates: results.coordinates,
            sessionId: 'session_' + Date.now(),
            deviceType: 'desktop',
            browser: 'Chrome',
            os: 'Windows'
          }),
        });

        if (!analyticsResponse.ok) {
          console.warn('Analytics tracking failed, but search completed successfully');
        }
      } catch (error) {
        console.error('Error tracking analytics:', error);
      }
    } catch (error) {
      console.error('Error processing search results:', error);
    }
  }, []);

  const saveToHistory = useCallback(async (result: SearchResult) => {
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
  }, [searchResults?.query, query]);

  // Memoized no results message
  const noResultsMessage = useMemo(() => {
    if (!searchResults && query) {
      return (
        <div className={styles.noResults}>
          <p>No results found for "{query}". Try using the search form above.</p>
        </div>
      );
    }
    return null;
  }, [searchResults, query]);

  return (
    <div className={styles.container}>
      <DevelopmentModeIndicator />
      
      <h1 className={styles.title}>Search Stores</h1>
      
      <Suspense fallback={<div className={styles.searchLoading}>Loading search...</div>}>
        <SearchBar onSearch={handleSearch} />
      </Suspense>

      {searchResults && (
        <SearchResultsDisplay 
          searchResults={searchResults} 
          onSaveToHistory={saveToHistory} 
        />
      )}

      {noResultsMessage}
    </div>
  );
} 