import React, { useState, useEffect, useCallback } from 'react';
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

  // Debounced function to fetch location suggestions
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || !GOOGLE_API_KEY) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&components=country:${country}&key=${GOOGLE_API_KEY}`,
        { timeout: 5000 }
      );

      if (response.data.status === 'OK') {
        const cities = response.data.predictions
          .map((prediction: any) => prediction.description.split(',')[0].trim())
          .filter((city: string) => city.length > 0);
        setSuggestions(cities);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error);
      setSuggestions([]);
    }
  }, [country, GOOGLE_API_KEY]);

  // Debounce the API call
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(location);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [location, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder={translations.placeholderCity}
        value={location}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setShowSuggestions(true)}
        required
        aria-label="City input"
        role="textbox"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete; 