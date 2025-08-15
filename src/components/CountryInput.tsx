import React from 'react';

interface CountryInputProps {
  country: string;
  setCountry: (country: string) => void;
  countries: string[];
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
}

const CountryInput: React.FC<CountryInputProps> = ({
  country,
  setCountry,
  countries,
  translations
}) => {
  return (
    <div className="input-container">
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
        aria-label="Country selection"
      >
        <option value="">{translations.placeholderCountry}</option>
        {countries.map((countryName) => (
          <option key={countryName} value={countryName}>
            {countryName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountryInput; 