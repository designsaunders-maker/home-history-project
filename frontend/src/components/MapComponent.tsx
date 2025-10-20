import React, { useEffect, useRef, useState, useCallback } from 'react';

type MapComponentProps = {
  address: string;
  zoom?: number;
  onLoad?: (map: google.maps.Map) => void;
};

const MapComponent = ({
  address,
  zoom = 15,
  onLoad
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const initMap = useCallback((centerPosition: google.maps.LatLngLiteral) => {
    if (!mapRef.current || !window.google) return;

    if (!mapInstanceRef.current) {
      const mapOptions: google.maps.MapOptions = {
        center: centerPosition,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      if (onLoad) {
        onLoad(map);
      }
    } else {
      mapInstanceRef.current.setCenter(centerPosition);
    }

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition(centerPosition);
    } else {
      markerRef.current = new google.maps.Marker({
        position: centerPosition,
        map: mapInstanceRef.current
      });
    }
  }, [zoom, onLoad]);

  useEffect(() => {
    if (!address || !window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
        const location = results[0].geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng()
        };
        initMap(newCenter);
      }
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [address, initMap]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapComponent;