import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation, X, Clock, RotateCcw, ArrowRight } from "lucide-react";

interface Coordinates {
    lat: number;
    lng: number;
}

interface LocationData {
    address: string;
    coordinates: Coordinates;
    placeId?: string;
}

interface GooglePlacesInputProps {
    label?: string;
    onPlaceSelected: (place: LocationData | null) => void;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    id: string;
}

declare global {
    interface Window {
        google: any;
        initGoogleMaps: () => void;
    }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDUsmAa5CVGF9iN_vwwVyUYluJ0-4Ht_dE";

// Simple API loader
let apiLoadPromise: Promise<void> | null = null;

const loadGoogleMapsAPI = (): Promise<void> => {
    if (window.google?.maps?.places) return Promise.resolve();

    if (apiLoadPromise) return apiLoadPromise;

    apiLoadPromise = new Promise((resolve, reject) => {
        window.initGoogleMaps = resolve;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return apiLoadPromise;
};

export function GooglePlacesInput({
                                      label,
                                      onPlaceSelected,
                                      value,
                                      onChange,
                                      placeholder = "Type location in Kenya...",
                                      id
                                  }: GooglePlacesInputProps) {
    const [predictions, setPredictions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);
    const [apiLoaded, setApiLoaded] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteService = useRef<any>(null);
    const placesService = useRef<any>(null);
    const geocoder = useRef<any>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Load API and initialize services
    useEffect(() => {
        loadGoogleMapsAPI()
            .then(() => {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
                geocoder.current = new window.google.maps.Geocoder();
                setApiLoaded(true);
            })
            .catch(console.error);
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (!apiLoaded || value.length < 1) {
            setPredictions([]);
            setShowSuggestions(value.length >= 1);
            setIsLoading(false);
            return;
        }

        if (value.length < 2) {
            setPredictions([]);
            setShowSuggestions(true);
            return;
        }

        setIsLoading(true);
        debounceTimeout.current = setTimeout(() => {
            autocompleteService.current?.getPlacePredictions(
                {
                    input: value,
                    componentRestrictions: { country: 'ke' },
                    // Fixed: Remove conflicting types - use geocode for general locations
                    types: ['geocode']
                },
                (predictions: any[], status: any) => {
                    setIsLoading(false);
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        setPredictions(predictions || []);
                        setShowSuggestions(true);
                    } else {
                        setPredictions([]);
                        setShowSuggestions(true);
                    }
                }
            );
        }, 300);

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [value, apiLoaded]);

    const handleSelectSuggestion = (prediction: any, isRecent = false) => {
        if (isRecent) {
            onPlaceSelected(prediction);
            onChange({ target: { value: prediction.address } } as React.ChangeEvent<HTMLInputElement>);
            setShowSuggestions(false);
            return;
        }

        placesService.current?.getDetails(
            {
                placeId: prediction.place_id,
                fields: ['geometry', 'formatted_address', 'place_id']
            },
            (place: any, status: any) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    const locationData: LocationData = {
                        address: place.formatted_address,
                        coordinates: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        },
                        placeId: place.place_id
                    };

                    // Update recent searches
                    setRecentSearches(prev => {
                        const filtered = prev.filter(item => item.placeId !== locationData.placeId);
                        return [locationData, ...filtered].slice(0, 5);
                    });

                    onPlaceSelected(locationData);
                    onChange({ target: { value: place.formatted_address } } as React.ChangeEvent<HTMLInputElement>);
                    setShowSuggestions(false);
                }
            }
        );
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) return;

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                geocoder.current?.geocode(
                    { location: { lat, lng } },
                    (results: any[], status: any) => {
                        setIsGettingLocation(false);
                        if (status === 'OK' && results[0]) {
                            const locationData: LocationData = {
                                address: results[0].formatted_address,
                                coordinates: { lat, lng },
                                placeId: results[0].place_id
                            };
                            onPlaceSelected(locationData);
                            onChange({ target: { value: results[0].formatted_address } } as React.ChangeEvent<HTMLInputElement>);
                            setShowSuggestions(false);
                        }
                    }
                );
            },
            () => setIsGettingLocation(false),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const recentCount = value.length < 2 ? recentSearches.length : 0;
        const totalSuggestions = recentCount + predictions.length;

        if (!showSuggestions || totalSuggestions === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalSuggestions);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev <= 0 ? totalSuggestions - 1 : prev - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    if (selectedIndex < recentCount) {
                        handleSelectSuggestion(recentSearches[selectedIndex], true);
                    } else {
                        handleSelectSuggestion(predictions[selectedIndex - recentCount]);
                    }
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                inputRef.current?.blur();
                break;
        }
    };

    const clearInput = () => {
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        onPlaceSelected(null);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const recentToShow = value.length < 2 ? recentSearches : [];

    return (
        <div className="relative">
            {label && <Label htmlFor={id} className="mb-2 block">{label}</Label>}

            <div className="relative">
                <Input
                    id={id}
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    onFocus={() => value.length >= 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="pr-20"
                />

                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={clearInput}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation || !apiLoaded}
                >
                    {isGettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                        <Navigation className="h-4 w-4 text-blue-600" />
                    )}
                </Button>
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute right-20 top-9 text-xs text-blue-500 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Searching...
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-80 overflow-hidden">
                    <ul className="max-h-72 overflow-y-auto">
                        {/* Recent searches */}
                        {recentToShow.length > 0 && (
                            <>
                                <li className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase border-b">
                                    Recent Searches
                                </li>
                                {recentToShow.map((recent, index) => (
                                    <li
                                        key={`recent-${recent.placeId}`}
                                        className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${
                                            index === selectedIndex ? 'bg-blue-50' : ''
                                        }`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSelectSuggestion(recent, true);
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 truncate">{recent.address}</span>
                                        </div>
                                    </li>
                                ))}
                            </>
                        )}

                        {/* Search results */}
                        {predictions.length > 0 && recentToShow.length > 0 && (
                            <li className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase border-b">
                                Search Results
                            </li>
                        )}

                        {predictions.map((prediction, index) => {
                            const adjustedIndex = index + recentToShow.length;
                            return (
                                <li
                                    key={prediction.place_id}
                                    className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${
                                        adjustedIndex === selectedIndex ? 'bg-blue-50' : ''
                                    }`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectSuggestion(prediction);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(adjustedIndex)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {prediction.structured_formatting?.main_text || prediction.description}
                                            </div>
                                            {prediction.structured_formatting?.secondary_text && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {prediction.structured_formatting.secondary_text}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}

                        {/* No results */}
                        {predictions.length === 0 && recentToShow.length === 0 && !isLoading && (
                            <li className="px-4 py-3 text-sm text-gray-500 text-center">
                                {value.length < 2 ? 'Start typing to search...' : 'No locations found'}
                            </li>
                        )}
                    </ul>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
                        <span>↑↓ navigate • Enter select</span>
                        <span className="flex items-center">
                            <Navigation className="h-3 w-3 mr-1" />
                            GPS
                        </span>
                    </div>
                </div>
            )}

            {/* Helper text */}
            <div className="mt-1 text-xs text-gray-500">
                {apiLoaded ? 'Type to search locations in Kenya' : 'Loading Google Maps...'}
            </div>
        </div>
    );
}

// Demo component showing the autocomplete in action
export default function GooglePlacesDemo() {
    const [originValue, setOriginValue] = useState("");
    const [destinationValue, setDestinationValue] = useState("");
    const [originLocation, setOriginLocation] = useState<LocationData | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
    const [distance, setDistance] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);

    // Calculate distance when both locations are selected
    useEffect(() => {
        if (originLocation && destinationLocation && window.google) {
            const service = new window.google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [originLocation.coordinates],
                destinations: [destinationLocation.coordinates],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC,
            }, (response: any, status: any) => {
                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const element = response.rows[0].elements[0];
                    setDistance(element.distance.text);
                    setDuration(element.duration.text);
                }
            });
        } else {
            setDistance(null);
            setDuration(null);
        }
    }, [originLocation, destinationLocation]);

    const handleSwap = () => {
        const tempValue = originValue;
        const tempLocation = originLocation;
        setOriginValue(destinationValue);
        setOriginLocation(destinationLocation);
        setDestinationValue(tempValue);
        setDestinationLocation(tempLocation);
    };

    const handleClear = () => {
        setOriginValue("");
        setDestinationValue("");
        setOriginLocation(null);
        setDestinationLocation(null);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Places Autocomplete</h1>

            <div className="space-y-6">
                {/* Origin */}
                <GooglePlacesInput
                    id="origin"
                    label="From (Origin)"
                    value={originValue}
                    onChange={(e) => setOriginValue(e.target.value)}
                    onPlaceSelected={setOriginLocation}
                    placeholder="Enter pickup location..."
                />

                {/* Swap button */}
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSwap}
                        disabled={!originValue && !destinationValue}
                        title="Swap locations"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Destination */}
                <GooglePlacesInput
                    id="destination"
                    label="To (Destination)"
                    value={destinationValue}
                    onChange={(e) => setDestinationValue(e.target.value)}
                    onPlaceSelected={setDestinationLocation}
                    placeholder="Enter destination..."
                />

                {/* Route summary */}
                {originLocation && destinationLocation && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Route Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">From:</span> {originLocation.address}
                            </div>
                            <div>
                                <span className="font-medium">To:</span> {destinationLocation.address}
                            </div>
                            {distance && duration && (
                                <div className="flex gap-4 mt-2">
                                    <div><span className="font-medium">Distance:</span> {distance}</div>
                                    <div><span className="font-medium">Duration:</span> {duration}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        className="flex-1"
                        disabled={!originLocation || !destinationLocation}
                    >
                        Plan Route
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={!originValue && !destinationValue}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}