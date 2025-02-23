import * as React from 'react';
import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Image, Alert, TouchableOpacity, Text, Linking, ActivityIndicator } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import animals from '../json/animals';
import calculateMeanCenter from '../functions/MeanCenters';
import { 
    Region, 
    YalaRegionBounds, 
    CustomMarkerProps,
    SeasonalPredictions,
    Season,
    TimeOfDay,
    RouteResult,
    PredictionWithAnimal
} from '../types/map.types';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'MapScreen'>;

const MapScreen = () => {
    const route = useRoute<MapScreenRouteProp>();
    const { season, timeOfDay, animal } = route.params.filters;
    
    // Memoize predictions to prevent recalculation
    const predictions = useMemo(() => 
        calculateMeanCenter(animals, season, timeOfDay),
        [season, timeOfDay]
    );

    const yalaRegionCoordinates = [
        { latitude: 6.5150, longitude: 81.3850 },  
        { latitude: 6.3258, longitude: 81.3832 },
        { latitude: 6.3232,longitude: 81.4801 },
        { latitude:6.3420, longitude:81.4950  },
        { latitude:6.3664, longitude:81.5225  },
        { latitude: 6.3700, longitude: 81.5600 },  
        { latitude: 6.5100, longitude: 81.5600 },  
        { latitude: 6.5150, longitude: 81.3850 }   
    ];
     
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: 6.4163, 
        longitude: 81.4612,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const yalaRegionBounds: YalaRegionBounds = {
        minLatitude: 6.3700,
        maxLatitude: 6.5150,
        minLongitude: 81.3850,
        maxLongitude: 81.5600,
    };

    const mapRef = useRef<MapView>(null);

    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const GOOGLE_MAPS_API_KEY = 'AIzaSyAoawehOlPhviHJxHRin7Fu3iTX9mTjwZU';
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    // Memoize findNearestAccessibleRoute to prevent recreation
    const findNearestAccessibleRoute = useCallback(async (
        userLocation: { latitude: number; longitude: number },
        predictionData: SeasonalPredictions
    ): Promise<RouteResult | null> => {
        // Extract all predictions into a flat array with their details
        const allPredictions: PredictionWithAnimal[] = Object.entries(predictionData).flatMap(([animalType, seasonData]) => {
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
                const result: RouteResult = await new Promise((resolve, reject) => {
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

        // If no direct routes to predictions are found, find nearest accessible point
        if (predictionsWithDistance.length > 0) {
            const searchRadius = 0.1;
            const searchPoints = generateSearchPoints(
                predictionsWithDistance[0].latitude,
                predictionsWithDistance[0].longitude,
                searchRadius
            );

            for (const point of searchPoints) {
                try {
                    const result: RouteResult = await new Promise((resolve, reject) => {
                        fetch(
                            `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${point.latitude},${point.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                        )
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'OK') {
                                resolve({
                                    destination: point,
                                    prediction: predictionsWithDistance[0]
                                });
                            } else {
                                reject('No route found');
                            }
                        })
                        .catch(reject);
                    });

                    return result;
                } catch (error) {
                    continue;
                }
            }
        }

        return null;
    }, [season, timeOfDay]); // Only recreate when filters change

    // Memoize generateSearchPoints
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

    // Use ref to track if initial route has been calculated
    const hasCalculatedInitialRoute = useRef(false);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            // Skip if we've already calculated the initial route
            if (hasCalculatedInitialRoute.current) return;

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted' || !isMounted) return;

            const location = await Location.getCurrentPositionAsync({});
            if (!isMounted) return;

            const currentLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            setUserLocation(currentLocation);

            // Only calculate route if we haven't done it yet
            if (!hasCalculatedInitialRoute.current) {
                setIsRouteLoading(true);
                const result = await findNearestAccessibleRoute(currentLocation, predictions);
                if (result && isMounted) {
                    setSelectedLocation(result.destination);
                    hasCalculatedInitialRoute.current = true;
                    Alert.alert(
                        'Route Found',
                        `Found a route to ${result.prediction.animalType} prediction area.\nDistance from prediction: ${
                            getDistanceFromLatLonInKm(
                                result.destination.latitude,
                                result.destination.longitude,
                                result.prediction.latitude,
                                result.prediction.longitude
                            ).toFixed(2)
                        } km`
                    );
                }
                if (isMounted) {
                    setIsRouteLoading(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array as we only want this to run once

    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    useEffect(() => {
        const onRegionChange = (region: Region) => {
            const clamp = (value: number, min: number, max: number) =>
                Math.min(Math.max(value, min), max);

            const constrainedLatitude = clamp(region.latitude, yalaRegionBounds.minLatitude, yalaRegionBounds.maxLatitude);
            const constrainedLongitude = clamp(region.longitude, yalaRegionBounds.minLongitude, yalaRegionBounds.maxLongitude);

            const constrainedLatitudeDelta = Math.min(region.latitudeDelta, 0.1);
            const constrainedLongitudeDelta = Math.min(region.longitudeDelta, 0.1);

            const constrainedRegion: Region = {
                latitude: constrainedLatitude,
                longitude: constrainedLongitude,
                latitudeDelta: constrainedLatitudeDelta,
                longitudeDelta: constrainedLongitudeDelta,
            };

            if (region.latitude !== constrainedRegion.latitude || region.longitude !== constrainedRegion.longitude) {
                setMapRegion(constrainedRegion);
                mapRef.current?.animateToRegion(constrainedRegion, 500);
            } else {
                setMapRegion(region);
            }
        };

        if (mapRef.current) {
            mapRef.current.animateToRegion(mapRegion, 0);
        }

        return () => {
        };
    }, [mapRegion]);

    const getAnimalIcon = (animal: string) => {
        switch (animal) {
            case 'Deer':
                return require('../../assets/images/deer-icon.png');
            case 'Leopard':
                return require('../../assets/images/leopard-icon.png');
            case 'Elephant':
                return require('../../assets/images/elephant-icon.png');
            default:
                return require('../../assets/images/default-icon.png');
        }
    };

    // Memoize CustomMarker component (already memoized with memo)
    const CustomMarker = memo(({ image }: CustomMarkerProps) => (
        <View style={styles.markerContainer}>
            <Image source={image} style={{ width: 30, height: 30 }} />
        </View>
    ));

    // Memoize handlers
    const handleMarkerPress = useCallback((coordinate: { latitude: number; longitude: number }, label: string) => {
        setSelectedLocation(coordinate);
        Alert.alert(
            label,
            `Latitude: ${coordinate.latitude.toFixed(4)}\nLongitude: ${coordinate.longitude.toFixed(4)}`,
            [
                { 
                    text: 'Get Directions', 
                    onPress: () => {
                        if (userLocation) {
                            // Zoom out to show both points
                            const points = [
                                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                                { latitude: coordinate.latitude, longitude: coordinate.longitude }
                            ];
                            
                            mapRef.current?.fitToCoordinates(points, {
                                edgePadding: {
                                    top: 50,
                                    right: 50,
                                    bottom: 50,
                                    left: 50
                                },
                                animated: true
                            });
                        }
                    }
                },
                { text: 'Close', style: 'cancel' }
            ]
        );
    }, [userLocation]);

    const zoomIn = useCallback(() => {
        if (mapRef.current) {
            const newRegion = {
                ...mapRegion,
                latitudeDelta: mapRegion.latitudeDelta / 2,
                longitudeDelta: mapRegion.longitudeDelta / 2,
            };
            mapRef.current.animateToRegion(newRegion, 300);
            setMapRegion(newRegion);
        }
    }, [mapRegion]);

    const zoomOut = useCallback(() => {
        if (mapRef.current) {
            const newRegion = {
                ...mapRegion,
                latitudeDelta: mapRegion.latitudeDelta * 2,
                longitudeDelta: mapRegion.longitudeDelta * 2,
            };
            mapRef.current.animateToRegion(newRegion, 300);
            setMapRegion(newRegion);
        }
    }, [mapRegion]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider="google"
                initialRegion={mapRegion}
                region={mapRegion}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={false}
                minZoomLevel={10}  // Decreased to allow more zoom out
                maxZoomLevel={18}  // Increased to allow more zoom in
                showsUserLocation={false}
                showsPointsOfInterest={false}
                showsBuildings={false}
                showsIndoors={false}
                showsTraffic={false}
                showsCompass={false}
                showsScale={false}
            >
                <Polygon
                    coordinates={yalaRegionCoordinates}
                    strokeColor="rgba(0, 128, 0, 1.0)"  
                    fillColor="rgba(0, 128, 0, 0.2)"   
                    strokeWidth={2}
                />

                {Object.entries(predictions as SeasonalPredictions).map(([animalType, seasonData]) => {
                    // If "all" isn’t selected and the animal type isn’t in the list, skip
                    if (!animal.includes('all') && !animal.includes(animalType)) {
                        return null;
                    }
                    const timeSpecificData = seasonData[season as Season]?.[timeOfDay as TimeOfDay];
                    if (!timeSpecificData?.predictions?.length) {
                        return null;
                    }
                    
                    return timeSpecificData.predictions.map((prediction, index) => (
                        <Marker
                            key={`${animalType}-${season}-${timeOfDay}-${index}`}
                            coordinate={{
                                latitude: prediction.latitude,
                                longitude: prediction.longitude,
                            }}
                            opacity={prediction.probability}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleMarkerPress({
                                    latitude: prediction.latitude,
                                    longitude: prediction.longitude,
                                }, `${animalType} - Predicted Location ${index + 1}\nProbability: ${(prediction.probability * 100).toFixed(0)}%\n${season} - ${timeOfDay}`);
                            }}
                        >
                            <CustomMarker
                                image={getAnimalIcon(animalType)}
                            />
                        </Marker>
                    ));
                })}

                {userLocation && selectedLocation && (
                    <MapViewDirections
                        origin={userLocation}
                        destination={selectedLocation}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={3}
                        strokeColor="#0066ff"
                        mode="DRIVING"
                        resetOnChange={false}
                        optimizeWaypoints={true}
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        onReady={result => {
                            Alert.alert(
                                'Route Info',
                                `Distance: ${result.distance.toFixed(2)} km\nDuration: ${(result.duration).toFixed(2)} min`,
                                [
                                    { text: 'OK' },
                                    { 
                                        text: 'Open in Google Maps',
                                        onPress: () => {
                                            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${selectedLocation.latitude},${selectedLocation.longitude}&travelmode=driving`;
                                            Linking.openURL(url);
                                        }
                                    }
                                ]
                            );
                            
                            mapRef.current?.fitToCoordinates(result.coordinates, {
                                edgePadding: {
                                    top: 100,
                                    right: 100,
                                    bottom: 100,
                                    left: 100
                                },
                                animated: true
                            });
                        }}
                        onError={(errorMessage) => {
                            console.log('Direction Error:', errorMessage);
                            Alert.alert(
                                'Route Not Available',
                                'Could not find a direct driving route. Would you like to open in Google Maps?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Open in Google Maps',
                                        onPress: () => {
                                            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${selectedLocation.latitude},${selectedLocation.longitude}&travelmode=driving`;
                                            Linking.openURL(url);
                                        }
                                    }
                                ]
                            );
                        }}
                    />
                )}
            </MapView>
            
            {/* Add Zoom Controls */}
            <View style={styles.zoomControlsContainer}>
                <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
                    <Text style={styles.zoomButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
                    <Text style={styles.zoomButtonText}>-</Text>
                </TouchableOpacity>
            </View>

            {/* Loading Spinner */}
            {isRouteLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066ff" />
                    <Text style={styles.loadingText}>Finding best route...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    markerContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomControlsContainer: {
        position: 'absolute',
        right: 16,
        bottom: 100,
        backgroundColor: 'transparent',
    },
    zoomButton: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    zoomButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

// Memoize the entire MapScreen component
export default memo(MapScreen);