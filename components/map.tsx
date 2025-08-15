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

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (!place) return;

          let displayValue = '';
          if (place.name && place.formatted_address) {
            displayValue = `${place.name}, ${place.formatted_address}`;
          } else if (place.formatted_address) {
            displayValue = place.formatted_address;
          } else if (place.name) {
            displayValue = place.name;
          }

          // Set input manually (bypass React state issues)
          if (inputRef.current && displayValue) {
            inputRef.current.value = displayValue;
            onChange(displayValue);
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
      <Input
        id='address'
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search for a place, landmark, or area...'}
        required={required}
        autoComplete='off'
        className='w-full'
      />
      {error ? (
        <p className='text-xs text-red-500 mt-1'>{error}</p>
      ) : (
        <p className='text-xs text-slate-500 mt-1'>
          {isLoaded
            ? 'Type a location and select from suggestions.'
            : 'Initializing suggestions...'}
        </p>
      )}
    </div>
  );
}
