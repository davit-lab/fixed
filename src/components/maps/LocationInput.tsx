import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationResult {
  address: string;
  lat: number;
  lng: number;
}

interface LocationInputProps {
  label: string;
  placeholder: string;
  onLocationSelect: (location: LocationResult) => void;
  defaultValue?: string;
}

export const LocationInput = ({ label, placeholder, onLocationSelect, defaultValue }: LocationInputProps) => {
  const [value, setValue] = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ge&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'ka,en' } }
      );
      const data = await res.json();
      const results: LocationResult[] = data.map((item: any) => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(val), 400);
  };

  const handleSelect = (result: LocationResult) => {
    setValue(result.address);
    setSuggestions([]);
    setOpen(false);
    onLocationSelect(result);
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-amber-500" />
        {label}
      </Label>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="h-12 rounded-xl border-border/50 bg-secondary/50 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-secondary/70 text-sm font-medium transition-colors border-b last:border-none border-border/30 flex items-start gap-2"
            >
              <MapPin className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{result.address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
