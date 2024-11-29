import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';

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

    useEffect(() => {
        const onRegionChange = (region: Region) => {
            const clamp = (value: number, min: number, max: number) =>
                Math.min(Math.max(value, min), max);

            const constrainedLatitude = clamp(region.latitude, yalaRegionBounds.minLatitude, yalaRegionBounds.maxLatitude);
            const constrainedLongitude = clamp(region.longitude, yalaRegionBounds.minLongitude, yalaRegionBounds.maxLongitude);

            const constrainedRegion: Region = {
                latitude: constrainedLatitude,
                longitude: constrainedLongitude,
                latitudeDelta: Math.min(region.latitudeDelta, 0.1),
                longitudeDelta: Math.min(region.longitudeDelta, 0.1),
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
    }, [mapRegion]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                region={mapRegion}
                onRegionChangeComplete={(region) => setMapRegion(region)}
            >
                <Polygon
                    coordinates={yalaRegionCoordinates}
                    strokeColor="rgba(0, 128, 0, 1.0)"  
                    fillColor="rgba(0, 128, 0, 0.2)"   
                    strokeWidth={2}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});

export default MapScreen;
