import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { SeasonalPredictions, RouteResult, Season, TimeOfDay } from '../types/map.types';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAoawehOlPhviHJxHRin7Fu3iTX9mTjwZU';

export const useLocationAndRoute = (predictions: SeasonalPredictions, season: Season, timeOfDay: TimeOfDay) => {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const hasCalculatedInitialRoute = useRef(false);

    const generateSearchPoints = useCallback((
        centerLat: number,
        centerLng: number,
        radius: number,
        points: number = 8
    ) => {
        const result = [];
        for (let i = 0; i < points; i++) {
            const angle = (i * 2 * Math.PI) / points;
            result.push({
                latitude: centerLat + radius * Math.cos(angle),
                longitude: centerLng + radius * Math.sin(angle)
            });
        }
        return result;
    }, []);

    const findNearestAccessibleRoute = useCallback(async (
        userLocation: { latitude: number; longitude: number },
        predictionData: SeasonalPredictions
    ): Promise<RouteResult | null> => {
        // Extract all predictions into a flat array with their details
        const allPredictions = Object.entries(predictionData).flatMap(([animalType, seasonData]) => {
            const timeSpecificData = seasonData[season as Season]?.[timeOfDay as TimeOfDay];
            return timeSpecificData?.predictions?.map(pred => ({
                ...pred,
                animalType
            })) || [];
        });

        // Sort predictions by distance from user
        const predictionsWithDistance = allPredictions.map(pred => ({
            ...pred,
            distance: Math.sqrt(
                Math.pow(pred.latitude - userLocation.latitude, 2) + 
                Math.pow(pred.longitude - userLocation.longitude, 2)
            )
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        // Try to find a route to each prediction, starting from the nearest
        for (const prediction of predictionsWithDistance) {
            try {
                const result = await new Promise<RouteResult>((resolve, reject) => {
                    const destination = {
                        latitude: prediction.latitude,
                        longitude: prediction.longitude
                    };
                    
                    fetch(
                        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                    )
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'OK') {
                            resolve({ destination, prediction });
                        } else {
                            reject('No route found');
                        }
                    })
                    .catch(reject);
                });

                return result;
            } catch (error) {
                console.log('Failed to find route to prediction:', error);
                continue;
            }
        }

        return null;
    }, [season, timeOfDay, generateSearchPoints]);

    useEffect(() => {
        let isMounted = true;

        const initializeLocationAndRoute = async () => {
            if (hasCalculatedInitialRoute.current) return;

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted' || !isMounted) {
                    setIsLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                if (!isMounted) return;

                const currentLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
                setUserLocation(currentLocation);

                if (!hasCalculatedInitialRoute.current) {
                    setIsRouteLoading(true);
                    const result = await findNearestAccessibleRoute(currentLocation, predictions);
                    if (result && isMounted) {
                        setSelectedLocation(result.destination);
                        hasCalculatedInitialRoute.current = true;
                        Alert.alert(
                            'Route Found',
                            `Found a route to ${result.prediction.animalType} prediction area.`
                        );
                    }
                    if (isMounted) {
                        setIsRouteLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error initializing location:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeLocationAndRoute();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        userLocation,
        selectedLocation,
        setSelectedLocation,
        isLoading,
        isRouteLoading,
    };
};
