'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceChange?: (place: any) => void;
  placeholder?: string;
  required?: boolean;
}

declare global {
  interface Window {
    google: any;
    googleMapsLoaded: boolean;
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceChange,
  placeholder,
  required,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  // Prevent modal from closing when clicking on autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on a Google Places Autocomplete suggestion
      const target = event.target as Element;
      if (target && target.closest('.pac-container')) {
        // Only stop propagation, don't prevent default to allow selection
        event.stopPropagation();
        return false;
      }
    };

    // Add event listeners to prevent modal closing
    document.addEventListener('click', handleClickOutside, true);

    // Add specific listener for pac-container clicks
    const handlePacClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target && target.closest('.pac-container')) {
        event.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handlePacClick, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('mousedown', handlePacClick, true);
    };
  }, []);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      try {
        // Remove previous listeners if any
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(
            autocompleteRef.current
          );
        }

        // Initialize Autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'gh' },
            fields: [
              'formatted_address',
              'geometry',
              'name',
              'place_id',
              'address_components',
            ],
          }
        );

        // Add event listener for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          console.log('Place changed event triggered');
          const place = autocompleteRef.current.getPlace();
          console.log('Selected place:', place);
          if (!place) return;

          let displayValue = '';
          if (place.name && place.formatted_address) {
            displayValue = `${place.name}, ${place.formatted_address}`;
          } else if (place.formatted_address) {
            displayValue = place.formatted_address;
          } else if (place.name) {
            displayValue = place.name;
          }

          console.log('Display value:', displayValue);

          // Set input value and trigger onChange
          if (inputRef.current && displayValue) {
            inputRef.current.value = displayValue;
            onChange(displayValue);
            console.log('Input value set to:', inputRef.current.value);
          }

          if (onPlaceChange) onPlaceChange(place);
        });

        setIsLoaded(true);
        setError('');
        console.log('Google Autocomplete initialized');
      } catch (err) {
        console.error('Autocomplete init error:', err);
        setError('Failed to initialize Google Places Autocomplete.');
      }
    };

    const waitForGoogleMaps = () => {
      if (window.google?.maps?.places) {
        initializeAutocomplete();
      } else {
        const retry = setTimeout(waitForGoogleMaps, 300);
        return () => clearTimeout(retry);
      }
    };

    waitForGoogleMaps();

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(
            autocompleteRef.current
          );
        } catch (e) {
          console.warn('Cleanup failed:', e);
        }
      }
    };
  }, [onChange, onPlaceChange]);

  return (
    <div>
      <Label htmlFor='address'>Pickup Location *</Label>
      <div
        onClick={e => {
          // Prevent modal from closing when clicking on the input container
          e.stopPropagation();
        }}
      >
        <Input
          id='address'
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={
            placeholder || 'Search for a place, landmark, or area...'
          }
          required={required}
          autoComplete='off'
          className='w-full'
          onClick={e => {
            // Prevent modal from closing when clicking on the input
            e.stopPropagation();
          }}
          onFocus={e => {
            // Ensure the input is focused properly
            e.target.focus();
          }}
        />
      </div>
      {error ? (
        <p className='text-xs text-red-500 mt-1'>{error}</p>
      ) : (
        <p className='text-xs text-slate-500 mt-1'>
          {isLoaded
            ? 'Type a location and select from suggestions.'
            : 'Initializing suggestions...'}
        </p>
      )}

      {/* Add CSS to ensure Google Places Autocomplete appears above modal */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pac-container {
            z-index: 99999 !important;
            position: fixed !important;
            pointer-events: auto !important;
          }
          .pac-item {
            cursor: pointer !important;
            pointer-events: auto !important;
          }
          .pac-item:hover {
            background-color: #f3f4f6 !important;
          }
        `,
        }}
      />
    </div>
  );
}
