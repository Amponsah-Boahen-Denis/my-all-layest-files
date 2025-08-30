'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CountryInput from './CountryInput';
import LocationAutocomplete from './LocationAutocomplete';
import { getGoogleApiKey, isGoogleApiConfigured } from '@/lib/googleConfig';

// SearchBar component for searching stores by product, country, and city
const SearchBar = ({ onSearch }: { onSearch: (results: any) => void }) => {
  // Get Google API key from centralized configuration
  const GOOGLE_API_KEY = getGoogleApiKey();
  const isGoogleConfigured = isGoogleApiConfigured();

  // State for user inputs and component status
  const [query, setQuery] = useState(''); // Product search query
  const [country, setCountry] = useState(''); // Selected country
  const [location, setLocation] = useState(''); // Selected city
  const [countries, setCountries] = useState<string[]>([]); // List of country names
  const [apiError, setApiError] = useState<string | null>(null); // Error messages
  const [isLoading, setIsLoading] = useState(false); // Loading state for search
  const [isDetectingLocation, setIsDetectingLocation] = useState(false); // Location detection loading
  const [layout, setLayout] = useState('grid'); // Display layout (grid or list)
  const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(false); // Track if auto-detection is enabled
  const [searchHistory, setSearchHistory] = useState<string[]>([]); // Recent search queries

  // Fallback country list
  const fallbackCountries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  // Check for Google API key on component mount
  useEffect(() => {
    if (!isGoogleConfigured) {
      setApiError('Google API key is missing. Please configure Google API key.');
    } else {
      setApiError(null);
    }
  }, [isGoogleConfigured]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Use fallback countries for now to avoid API issues
  useEffect(() => {
    setCountries(fallbackCountries);
  }, []);

  // Function to handle auto-detection of user's location
  const handleAutoDetect = useCallback(async () => {
    if (!navigator.geolocation) {
      setApiError('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    setIsDetectingLocation(true);
    setIsAutoDetectEnabled(true);
    setApiError(null);

    try {
      // Get user's coordinates using browser's free geolocation API
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // 15 second timeout
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // Successfully got coordinates - show success message
      setApiError(null);
      
      // Store coordinates for potential use (you could save these to state if needed)
      const userCoordinates = { lat: latitude, lng: longitude };
      
      // Show success message with coordinates
      setApiError(`✅ Location detected! Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Please select your country and enter your city manually.`);
      
      // You could also try to get city/country from IP address as a free alternative
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        if (ipData.city && ipData.country_name) {
          setLocation(ipData.city);
          setCountry(ipData.country_name);
          setApiError(`✅ Location detected! City: ${ipData.city}, Country: ${ipData.country_name}`);
        }
      } catch (ipError) {
        // IP geolocation failed, but coordinates are still available
        console.log('IP geolocation failed, but coordinates obtained successfully');
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      // Handle specific geolocation errors
      let errorMessage = 'Failed to detect location. Please enter manually.';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions or enter manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please enter manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location detection timed out. Please try again or enter manually.';
            break;
        }
      }
      
      setApiError(errorMessage);
      setIsAutoDetectEnabled(false);
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  // Function to switch to manual input
  const handleUseCustomField = useCallback(() => {
    setIsAutoDetectEnabled(false);
    setCountry('');
    setLocation('');
    setApiError(null); // Clear any auto-detection errors
  }, []);

  // Function to save search to history
  const saveToSearchHistory = useCallback((searchQuery: string) => {
    try {
      const newHistory = [searchQuery, ...searchHistory.filter(q => q !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [searchHistory]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!query.trim() || !country.trim() || !location.trim()) {
      setApiError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      // Save search query to history
      saveToSearchHistory(query.trim());

      // Call the search API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          country: country.trim(),
          location: location.trim(),
          productCategory: '', // Will be determined by the API
          radius: 50,
          limit: 20
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Call onSearch with the results - only pass expected properties
        onSearch({
          query: data.query,
          country: data.country,
          location: data.location,
          productCategory: data.productCategory,
          stores: data.stores,
          coordinates: data.coordinates,
          layout: layout,
          totalResults: data.totalResults,
          searchSource: data.searchSource,
        });
      } else {
        setApiError(data.error || 'Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setApiError('Search failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query, country, location, layout, onSearch, saveToSearchHistory]);

  // Update layout preference
  const handleLayoutChange = useCallback((newLayout: string) => {
    setLayout(newLayout);
  }, []);

  // Handle search history item click
  const handleHistoryItemClick = useCallback((historyItem: string) => {
    setQuery(historyItem);
  }, []);

  // Render the search form
  return (
    <div className="search-form-container">
      <div className="search-form-header">
        <h2>Find Stores Near You</h2>
        <p>Search for stores that sell the products you need</p>
      </div>
      
      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="search-history">
          <h4>Recent Searches:</h4>
          <div className="history-tags">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleHistoryItemClick(item)}
                className="history-tag"
                aria-label={`Search for ${item}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form className="search-form" onSubmit={handleSubmit}>
        {/* Product Search Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">🛍️</div>
            <h3>What are you looking for?</h3>
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter product name (e.g., laptop, coffee, shoes)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              aria-label="Product search"
              role="textbox"
              className="product-input"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">📍</div>
            <h3>Where are you located?</h3>
          </div>
          
          {/* Auto-detect buttons */}
          <div className="location-buttons">
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={isLoading || isAutoDetectEnabled || isDetectingLocation}
              aria-label="Auto-detect my location"
              className="auto-detect-btn"
            >
              <span className="btn-icon">
                {isDetectingLocation ? '⏳' : '🌍'}
              </span>
              {isDetectingLocation ? 'Detecting...' : 'Auto-Detect My Location'}
            </button>
            <button
              type="button"
              onClick={handleUseCustomField}
              disabled={isLoading || !isAutoDetectEnabled}
              aria-label="Use custom location fields"
              className="custom-location-btn"
            >
              <span className="btn-icon">✏️</span>
              Enter Manually
            </button>
          </div>

          {/* Location inputs */}
          <div className="location-inputs">
            <CountryInput
              country={country}
              setCountry={setCountry}
              countries={countries}
              translations={{
                placeholderCountry: 'Select your country',
                placeholderCity: 'Enter city name',
                buttonSearch: 'Search Stores',
                buttonSearching: 'Searching...',
                errorQuota: 'Too many requests. Please try again later.',
                errorNoStores: 'Failed to fetch stores. Try different terms.',
                grid: 'Grid',
                list: 'List',
              }}
            />

            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              onLocationSelect={(locationData) => {
                setLocation(locationData.description);
              }}
              country={country}
              placeholder="Enter city name"
            />
          </div>
        </div>

        {/* Display Options Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">🎨</div>
            <h3>How would you like to view results?</h3>
          </div>
          <div className="layout-selector">
            <label htmlFor="layout-select">Display Layout:</label>
            <select
              id="layout-select"
              value={layout}
              onChange={(e) => handleLayoutChange(e.target.value)}
              aria-label="Layout selection"
              className="layout-select"
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>

        {/* Search Button Section */}
        <div className="form-section">
          <button 
            type="submit" 
            disabled={isLoading || isDetectingLocation} 
            aria-busy={isLoading}
            className="search-button"
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Searching...
              </>
            ) : (
              <>
                <span className="btn-icon">🔍</span>
                Search Stores
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {apiError && (
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span>
            {apiError}
          </div>
        )}

        {/* API Key Status */}
        {!isGoogleConfigured && (
          <div className="warning-message" role="alert">
            <span className="warning-icon">🔑</span>
            Google API key not configured. Some features may be limited.
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar; 