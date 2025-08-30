'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getGoogleApiKey, getGoogleMapsEmbedUrl } from '@/lib/googleConfig';

interface Store {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  rating?: number;
  source: string;
}

interface GoogleMapProps {
  stores: Store[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showStoreMarkers?: boolean;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = React.memo(({
  stores,
  center,
  zoom = 12,
  height = '400px',
  showStoreMarkers = true,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Calculate center from stores if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    
    if (stores.length === 0) {
      return { lat: 0, lng: 0 };
    }
    
    const totalLat = stores.reduce((sum, store) => sum + store.coordinates.lat, 0);
    const totalLng = stores.reduce((sum, store) => sum + store.coordinates.lng, 0);
    
    return {
      lat: totalLat / stores.length,
      lng: totalLng / stores.length
    };
  }, [center, stores]);

  // Build Google Maps URL with markers
  const buildMapUrl = useCallback(() => {
    const apiKey = getGoogleApiKey();
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return null;
    }

    let url = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${mapCenter.lat},${mapCenter.lng}&zoom=${zoom}`;
    
    // Add store markers if requested and stores exist
    if (showStoreMarkers && stores.length > 0) {
      const markers = stores.map(store => 
        `&markers=color:red|label:${encodeURIComponent(store.name.charAt(0))}|${store.coordinates.lat},${store.coordinates.lng}`
      ).join('');
      url += markers;
    }
    
    return url;
  }, [mapCenter, zoom, stores, showStoreMarkers]);

  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapError(null);
  }, []);

  // Handle map error
  const handleMapError = useCallback(() => {
    setMapError('Failed to load Google Maps');
    setMapLoaded(false);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleApiKey()}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setMapError('Failed to load Google Maps API');
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Show loading state
  if (!mapLoaded && !mapError) {
    return (
      <div 
        ref={mapRef}
        className={`google-map-loading ${className}`}
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
          <div>Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (mapError) {
    return (
      <div 
        ref={mapRef}
        className={`google-map-error ${className}`}
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '8px',
          color: '#c53030'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
          <div>{mapError}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#c53030',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show map
  const mapUrl = buildMapUrl();
  if (!mapUrl) {
    return (
      <div 
        ref={mapRef}
        className={`google-map-error ${className}`}
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '8px',
          color: '#c53030'
        }}
      >
        <div>Google Maps not available</div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className={`google-map ${className}`}
      style={{ 
        height, 
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={handleMapLoad}
        onError={handleMapError}
        title="Store Locations Map"
      />
    </div>
  );
});

GoogleMap.displayName = 'GoogleMap';

export default GoogleMap;
