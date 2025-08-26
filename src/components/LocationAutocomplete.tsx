import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface LocationAutocompleteProps {
  location: string;
  setLocation: (location: string) => void;
  country: string;
  translations: {
    placeholderCountry: string;
    placeholderCity: string;
    buttonSearch: string;
    buttonSearching: string;
    errorQuota: string;
    errorNoStores: string;
    grid: string;
    list: string;
  };
  GOOGLE_API_KEY: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  location,
  setLocation,
  country,
  translations,
  GOOGLE_API_KEY
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced function to fetch location suggestions
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || !GOOGLE_API_KEY) {
      setSuggestions([]);
      setError(null);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const currentRequest = input.trim();
    setLastRequest(currentRequest);

    setIsLoading(true);
    setError(null);

    try {
      // Build the API URL with proper parameters
      const params = new URLSearchParams({
        input: input.trim(),
        types: '(cities)',
        key: GOOGLE_API_KEY,
        timeout: '5000'
      });

      // Add country restriction if available
      if (country && country.trim()) {
        params.append('components', `country:${country.trim()}`);
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
        { 
          signal: abortControllerRef.current.signal,
          timeout: 8000 // Increased timeout
        }
      );

      // Check if this is still the current request
      if (currentRequest !== lastRequest) {
        return;
      }

      if (response.data.status === 'OK') {
        const cities = response.data.predictions
          .map((prediction: any) => {
            // Extract city name from prediction description
            const description = prediction.description;
            const cityName = description.split(',')[0].trim();
            return cityName;
          })
          .filter((city: string) => city.length > 0 && city !== input.trim())
          .slice(0, 8); // Limit to 8 suggestions

        setSuggestions(cities);
        setError(null);
      } else if (response.data.status === 'ZERO_RESULTS') {
        setSuggestions([]);
        setError(null);
      } else if (response.data.status === 'OVER_QUERY_LIMIT') {
        setSuggestions([]);
        setError('API quota exceeded. Please try again later.');
      } else if (response.data.status === 'REQUEST_DENIED') {
        setSuggestions([]);
        setError('API access denied. Please check your API key configuration.');
      } else if (response.data.status === 'INVALID_REQUEST') {
        setSuggestions([]);
        setError('Invalid request. Please check your input.');
      } else {
        setSuggestions([]);
        setError(`API error: ${response.data.status}`);
      }
    } catch (error) {
      // Check if this is still the current request
      if (currentRequest !== lastRequest) {
        return;
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError('Request timeout. Please try again.');
        } else if (error.name === 'AbortError') {
          // Request was cancelled, don't show error
          return;
        } else if (error.response?.status === 429) {
          setError('Too many requests. Please try again later.');
        } else if (error.response?.status === 403) {
          setError('Access denied. Please check your API key.');
        } else {
          setError(`Network error: ${error.message}`);
        }
      } else {
        setError('An unexpected error occurred.');
      }
      
      setSuggestions([]);
      console.error('Failed to fetch location suggestions:', error);
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequest === lastRequest) {
        setIsLoading(false);
      }
    }
  }, [country, GOOGLE_API_KEY, lastRequest]);

  // Debounce the API call
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(location);
    }, 400); // Increased debounce time

    return () => {
      clearTimeout(timeoutId);
      // Cancel any pending request when component unmounts or location changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location, fetchSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setShowSuggestions(true);
    setError(null); // Clear previous errors
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    setError(null);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <input
          type="text"
          placeholder={translations.placeholderCity}
          value={location}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          required
          aria-label="City input"
          role="textbox"
          aria-describedby={error ? 'location-error' : undefined}
          className={error ? 'input-error' : ''}
        />
        {isLoading && (
          <div className="input-loading" aria-hidden="true">
            <span className="spinner-small"></span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div id="location-error" className="input-error-message" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown" role="listbox">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={false}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }
              }}
            >
              <span className="suggestion-icon">🏙️</span>
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && location.trim() && !error && (
        <div className="no-suggestions">
          <span className="no-results-icon">🔍</span>
          No cities found for "{location}"
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete; 