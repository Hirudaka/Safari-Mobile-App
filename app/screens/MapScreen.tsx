import React, { useState, useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, Alert } from 'react-native';
import MapView, { Polygon, Marker, Callout } from 'react-native-maps';
import animals from '../json/animals.json';
import calculateMeanCenter from '../functions/MeanCenters';

interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

interface YalaRegionBounds {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
}

interface MeanCenter {
    [animal: string]: {
        [group: string]: {
            meanLatitude: number;
            meanLongitude: number;
        };
    };
}

interface Animal {
    lat: number;
    lang: number;
}

interface Animals {
    [key: string]: Animal[];
}

interface CustomMarkerProps {
    image: number; 
}

const MapScreen = () => {
    const yalaRegionCoordinates = [
        { latitude: 6.5150, longitude: 81.3850 },  
        { latitude: 6.3750, longitude: 81.3900 },  
        { latitude: 6.3700, longitude: 81.5600 },  
        { latitude: 6.5100, longitude: 81.5550 },  
        { latitude: 6.5150, longitude: 81.3850 }   
    ];

    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: 6.4450,
        longitude: 81.4725,
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

    const [pressedMarker, setPressedMarker] = useState(null);

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

    const meanCenters: MeanCenter = calculateMeanCenter(animals, 2);

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

    const CustomMarker = memo(({ image }: CustomMarkerProps) => (
        <View style={styles.markerContainer}>
            <Image source={image} style={{ width: 30, height: 30 }} />
        </View>
    ));

    const handleMarkerPress = (coordinate: { latitude: number; longitude: number }, label: string) => {
        mapRef.current?.animateToRegion({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 500);
        Alert.alert(
            label,
            `Latitude: ${coordinate.latitude.toFixed(4)}\nLongitude: ${coordinate.longitude.toFixed(4)}`,
            [
                {
                    text: 'OK',
                    onPress: () => console.log('OK Pressed')
                }
            ]
        );
    };

    const handleMapPress = (e: any) => {
        // Do nothing when map is pressed
    };

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

                minZoomLevel={13}
                maxZoomLevel={15}

                showsUserLocation={false}
                showsPointsOfInterest={false}
                showsBuildings={false}
                showsIndoors={false}
                showsTraffic={false}
                showsCompass={false}
                showsScale={false}

                onPress={handleMapPress}
            >
                <Polygon
                    coordinates={yalaRegionCoordinates}
                    strokeColor="rgba(0, 128, 0, 1.0)"  
                    fillColor="rgba(0, 128, 0, 0.2)"   
                    strokeWidth={2}
                />

                {Object.keys(meanCenters).map((animal: string, index: number) => (
                    Object.keys(meanCenters[animal]).map((group: string, groupIndex: number) => (
                        <Marker
                            key={`${index}-${groupIndex}`}
                            coordinate={{
                                latitude: meanCenters[animal][group].meanLatitude,
                                longitude: meanCenters[animal][group].meanLongitude,
                            }}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleMarkerPress({
                                    latitude: meanCenters[animal][group].meanLatitude,
                                    longitude: meanCenters[animal][group].meanLongitude,
                                }, `${animal} - Group ${group}`);
                            }}
                        >
                            <CustomMarker
                                image={getAnimalIcon(animal)}
                            />
                        </Marker>
                    ))
                ))}

                {Object.keys(animals as { [key: string]: Animal[] }).map((animal: string, index: number) => (
                    (animals as { [key: string]: Animal[] })[animal].map((location: Animal, locationIndex: number) => (
                        <Marker
                            key={`${index}-${locationIndex}`}
                            coordinate={{
                                latitude: location.lat,
                                longitude: location.lang,
                            }}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleMarkerPress({
                                    latitude: location.lat,
                                    longitude: location.lang,
                                }, animal);
                            }}
                        >
                            <CustomMarker
                                image={getAnimalIcon(animal)}
                            />
                        </Marker>
                    ))
                ))}
            </MapView>
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
});

export default MapScreen;