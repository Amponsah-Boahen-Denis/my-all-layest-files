'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import sanitizeHtml from 'sanitize-html';
import CountryInput from './CountryInput';
import LocationAutocomplete from './LocationAutocomplete';
import { getProductCategory } from '../utils/productCategories';

// SearchBar component for searching stores by product, country, and city with optional auto-detected location
const SearchBar = ({ onSearch }: { onSearch: (results: any) => void }) => {
  // Environment variable for Google Maps API key
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // State for user inputs and component status
  const [query, setQuery] = useState(''); // Product search query
  const [country, setCountry] = useState(''); // Selected country (auto-detected or manual)
  const [location, setLocation] = useState(''); // Selected city (auto-detected or manual)
  const [countries, setCountries] = useState<string[]>([]); // List of country names
  const [apiError, setApiError] = useState<string | null>(null); // Error messages for API failures
  const [isLoading, setIsLoading] = useState(false); // Loading state for search
  const [layout, setLayout] = useState('grid'); // Display layout (grid or list)
  const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(false); // Track if auto-detection is enabled

  // Fallback country list if REST Countries API fails
  const fallbackCountries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Japan', 'Australia', 'India', 'Brazil', 'South Africa',
  ];

  // Check for Google API key on component mount
  useEffect(() => {
    if (!GOOGLE_API_KEY) {
      setApiError('Google API key is missing. Please configure NEXT_PUBLIC_GOOGLE_API_KEY.');
    }
  }, [GOOGLE_API_KEY]);

  // Fetch country list from REST Countries API
  useEffect(() => {
    const controller = new AbortController();
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all', {
          signal: controller.signal,
        });
        const countryNames = response.data
          .map((c: any) => c.name?.common || c.name)
          .sort();
        setCountries(countryNames);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setApiError('Failed to load countries. Using fallback list.');
          setCountries(fallbackCountries);
        }
      }
    };
    fetchCountries();
    return () => controller.abort(); // Cleanup on unmount
  }, []);

  // Fetch user layout preference from API
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        // TEMPORARY: Skip authentication for development
        const response = await axios.get('/api/user-preferences');
        setLayout(response.data.layout || 'grid');
      } catch (error) {
        setApiError('Failed to load preferences. Using defaults.');
      }
    };
    fetchUserPreferences();
  }, []);

  // Function to handle auto-detection of user's location
  const handleAutoDetect = useCallback(async () => {
    if (!navigator.geolocation) {
      setApiError('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    setIsAutoDetectEnabled(true);
    setApiError(null);

    const controller = new AbortController();
    try {
      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse-geocode coordinates to get city and country
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`,
        { signal: controller.signal }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const components = response.data.results[0].address_components;
        const city = components.find((c: any) => c.types.includes('locality'))?.long_name || '';
        const countryName = components.find((c: any) => c.types.includes('country'))?.long_name || '';
        
        if (city && countryName) {
          setLocation(city);
          setCountry(countryName);
        } else {
          setApiError('Unable to detect city or country. Please enter manually.');
          setIsAutoDetectEnabled(false);
        }
      } else {
        setApiError('Failed to detect location. Please enter manually.');
        setIsAutoDetectEnabled(false);
      }
    } catch (error) {
      setApiError('Failed to detect location. Please enter manually.');
      setIsAutoDetectEnabled(false);
    } finally {
      controller.abort(); // Cleanup
    }
  }, [GOOGLE_API_KEY]);

  // Function to switch to manual input
  const handleUseCustomField = useCallback(() => {
    setIsAutoDetectEnabled(false);
    setCountry('');
    setLocation('');
    setApiError(null); // Clear any auto-detection errors
  }, []);

  // Extract core product name by removing common words and irrelevant characters
  const extractProductName = useMemo(() => (input: string) => {
    const commonWords = new Set([
      'buy', 'find', 'shop', 'near', 'me', 'my', 'the', 'a', 'an',
      'where', 'can', 'i', 'get', 'locate', 'find', 'search', 'for',
      'best', 'place', 'to', 'in', 'stores', 'that', 'sell', 'purchase',
      'looking', 'for', 'need', 'want', 'locate', 'nearby', 'around',
    ]);
    const words = input
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove non-alphanumeric characters except spaces
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !commonWords.has(word) &&
          !/^[0-9.,]+$/.test(word) // Exclude numbers
      );
    return words.join(' ') || input;
  }, []);

  // Query MongoDB Store collection for cached store data
  const checkMongoDB = useCallback(async (country: string, city: string, productInfo: any) => {
    try {
      // Use the category directly from productInfo
      const storeType = productInfo?.category || 'general';
      const response = await axios.get('/api/stores', {
        params: {
          storeType,
          address: `${city}.*${country}`, // Regex to match city and country in address
        },
      });
      return response.data;
    } catch (error) {
      console.error('MongoDB query failed:', error);
      return null;
    }
  }, []);

  // Save new store data to MongoDB Store collection
  const saveToMongoDB = useCallback(async (country: string, city: string, productInfo: any, stores: any[], coordinates: any) => {
    try {
      const storeType = productInfo?.category || 'general';
      // Save each store as a separate document
      const storePromises = stores.map(store =>
        axios.post('/api/stores', {
          storeName: store.tags?.name || 'Unknown Store',
          storeType,
          address: store.address || `${city}, ${country}`,
          phone: store.phone || null,
          email: null, // Google Maps API typically doesn't provide email
        })
      );
      await Promise.all(storePromises);
    } catch (error) {
      console.error('Failed to save to MongoDB:', error);
    }
  }, []);

  // Fetch stores from Google Maps API or MongoDB cache
  const fetchStores = useCallback(async (country: string, city: string, productInfo: any, query: string) => {
    if (!GOOGLE_API_KEY) throw new Error('Google API key is missing');
    // Sanitize inputs to prevent XSS
    const sanitizedCountry = sanitizeHtml(country, { allowedTags: [] });
    const sanitizedCity = sanitizeHtml(city, { allowedTags: [] });
    const sanitizedQuery = sanitizeHtml(query, { allowedTags: [] });

    try {
      // Check MongoDB for cached data
      const cachedData = await checkMongoDB(sanitizedCountry, sanitizedCity, productInfo);
      if (cachedData?.stores?.length > 0) return cachedData;

      // Geocode city and country to get coordinates
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(sanitizedCity)},${encodeURIComponent(sanitizedCountry)}&key=${GOOGLE_API_KEY}`,
        { timeout: 5000 }
      );

      if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results?.length) {
        throw new Error('Location not found');
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
      const radius = 5000; // Search radius in meters
      let stores: any[] = [];

      // Fetch stores from Google Maps Places API if productInfo has googleTypes
      if (productInfo?.googleTypes) {
        const placePromises = productInfo.googleTypes.map((type: string) =>
          axios
            .get(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&keyword=${encodeURIComponent(sanitizedQuery)}&key=${GOOGLE_API_KEY}`,
              { timeout: 10000 }
            )
            .then((response) => ({
              status: 'fulfilled',
              value: response.data.status === 'OK'
                ? response.data.results.map((place: any) => ({
                    id: place.place_id,
                    tags: { name: place.name, shop: type },
                    lat: place.geometry.location.lat,
                    lon: place.geometry.location.lng,
                    phone: place.formatted_phone_number || null,
                    address: place.vicinity || place.formatted_address || sanitizedCity,
                    email: null,
                  }))
                : [],
            }))
            .catch((error) => ({ status: 'rejected', reason: error }))
        );

        const results = await Promise.allSettled(placePromises);
        stores = results
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result: any) => result.value);
      }

      // Remove duplicate stores by name
      const uniqueStores: any[] = [];
      const seenNames = new Set();
      for (const store of stores) {
        const name = store.tags?.name?.toLowerCase();
        if (name && !seenNames.has(name)) {
          seenNames.add(name);
          uniqueStores.push(store);
        }
      }

      // Save new stores to MongoDB and return up to 20 stores
      if (uniqueStores.length > 0) {
        await saveToMongoDB(sanitizedCountry, sanitizedCity, productInfo, uniqueStores, { lat, lng });
        return { location: { lat, lng }, stores: uniqueStores.slice(0, 20) };
      }

      throw new Error('No stores found');
    } catch (error) {
      throw error;
    }
  }, [GOOGLE_API_KEY, checkMongoDB, saveToMongoDB]);

  // Calculate relevance score for sorting stores
  const calculateRelevance = useCallback((store: any, query: string) => {
    const storeName = (store.tags?.name || '').toLowerCase();
    const queryLower = query.toLowerCase();
    let relevance = storeName.includes(queryLower) ? 100 : 0;
    queryLower.split(/\s+/).forEach((word) => {
      if (storeName.includes(word)) relevance += 20;
      if ((store.tags?.shop || '').includes(word)) relevance += 10;
    });
    return relevance;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate inputs
    if (!query.trim() || !country.trim() || !location.trim()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      // Extract product and get category using the new system
      const productInfo = getProductCategory(extractProductName(query));
      if (!productInfo) {
        setApiError('Unable to categorize this product. Please try a different search term.');
        setIsLoading(false);
        return;
      }

      const storeData = await fetchStores(country, location, productInfo, query);

      // Format stores for onSearch, ensuring storeName and address are compulsory
      const formattedStores = storeData.stores.map((store: any) => ({
        id: store.id,
        name: store.tags?.name || 'Unknown Store', // Compulsory
        localizedName: store.tags?.name || 'Unknown Store',
        address: store.address || `${location}, ${country}`, // Compulsory
        phone: store.phone || null, // Optional
        email: store.email || null, // Optional
        coordinates: {
          lat: store.lat || store.center?.lat || 0,
          lon: store.lon || store.center?.lon || 0,
        },
        type: store.tags?.shop || productInfo.category,
        relevance: calculateRelevance(store, query),
      })).sort((a: any, b: any) => b.relevance - a.relevance);

      // Call onSearch with formatted results
      onSearch({
        query,
        country,
        location,
        productCategory: productInfo.category,
        stores: formattedStores,
        coordinates: storeData.location || { lat: 0, lng: 0 },
        layout,
      });
    } catch (error: any) {
      // Handle API errors
      setApiError(
        error.response?.status === 429
          ? 'Too many requests. Please try again later.'
          : 'Failed to fetch stores. Try different terms.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [query, country, location, layout, onSearch, extractProductName, calculateRelevance, fetchStores]);

  // Update layout preference
  const handleLayoutChange = useCallback(async (newLayout: string) => {
    setLayout(newLayout);
    try {
      // TEMPORARY: Skip authentication for development
      await axios.put('/api/user-preferences', { layout: newLayout });
    } catch (error) {
      console.error('Failed to update layout preference:', error);
    }
  }, []);

  // Render the search form
  return (
    <div className="search-form-container">
      <div className="search-form-header">
        <h2>Find Stores Near You</h2>
        <p>Search for stores that sell the products you need</p>
      </div>
      
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
              onChange={(e) => setQuery(sanitizeHtml(e.target.value, { allowedTags: [] }))}
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
              disabled={isLoading || !GOOGLE_API_KEY || isAutoDetectEnabled}
              aria-label="Auto-detect my location"
              className="auto-detect-btn"
            >
              <span className="btn-icon">🌍</span>
              Auto-Detect My Location
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
              location={location}
              setLocation={setLocation}
              country={country}
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
              GOOGLE_API_KEY={GOOGLE_API_KEY || ''}
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
            disabled={isLoading || !GOOGLE_API_KEY} 
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
      </form>
    </div>
  );
};

export default SearchBar; 