'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getGoogleApiKey, isGoogleApiConfigured } from '@/lib/googleConfig';

interface Location {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  country?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = React.memo(({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Enter location...',
  className = '',
  disabled = false,
  required = false,
  country = ''
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Check if Google API is available
  const isGoogleAvailable = useMemo(() => isGoogleApiConfigured(), []);

  // Fetch location suggestions from Google Places API
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || !isGoogleAvailable) {
      setSuggestions([]);
      return;
    }

    try {
    setIsLoading(true);
    setError(null);

      const apiKey = getGoogleApiKey();
      const params = new URLSearchParams({
        input: input.trim(),
        key: apiKey,
        types: 'geocode',
        language: 'en'
      });

      if (country) {
        params.append('components', `country:${country}`);
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK') {
        setSuggestions(data.predictions || []);
      } else if (data.status === 'ZERO_RESULTS') {
        setSuggestions([]);
      } else {
        throw new Error(`Google API error: ${data.status}`);
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [country, isGoogleAvailable]);

  // Debounced search
  const debouncedSearch = useCallback((input: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(input);
    }, 300);
  }, [fetchSuggestions]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim()) {
      debouncedSearch(newValue);
      setShowSuggestions(true);
        } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onChange, debouncedSearch]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((location: Location) => {
    onChange(location.description);
    onLocationSelect(location);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, onLocationSelect]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show fallback message if Google API is not available
  if (!isGoogleAvailable) {
    return (
      <div className={`location-autocomplete-fallback ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="location-input"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: disabled ? '#f8f9fa' : 'white'
          }}
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d', 
          marginTop: '4px',
          fontStyle: 'italic'
        }}>
          Google Places API not configured - basic text input only
        </div>
      </div>
    );
  }

  return (
    <div className={`location-autocomplete ${className}`} style={{ position: 'relative' }}>
        <input
        ref={inputRef}
          type="text"
        value={value}
          onChange={handleInputChange}
        onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="location-input"
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '2px solid #e9ecef',
          borderRadius: '8px',
          fontSize: '16px',
          backgroundColor: disabled ? '#f8f9fa' : 'white',
          transition: 'border-color 0.3s ease'
        }}
      />
      
      {/* Loading indicator */}
        {isLoading && (
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '16px' }}>⏳</div>
          </div>
        )}

      {/* Error message */}
      {error && (
        <div style={{
          fontSize: '12px',
          color: '#dc3545',
          marginTop: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="location-suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((location) => (
            <div
              key={location.place_id}
              className="location-suggestion-item"
              onClick={() => handleSuggestionClick(location)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f8f9fa',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '4px'
              }}>
                {location.structured_formatting.main_text}
              </div>
              <div style={{
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>
                {location.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.trim() && (
        <div
          className="location-no-results"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            padding: '16px',
            textAlign: 'center',
            color: '#6c757d'
          }}
        >
          No locations found
        </div>
      )}
    </div>
  );
});

LocationAutocomplete.displayName = 'LocationAutocomplete';

export default LocationAutocomplete; 