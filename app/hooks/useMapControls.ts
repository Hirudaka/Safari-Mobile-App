import { useState, useEffect, useCallback } from 'react';
import { Region, YalaRegionBounds } from '../types/map.types';
import MapView from 'react-native-maps';

export const useMapControls = (mapRef: React.RefObject<MapView>, yalaRegionBounds: YalaRegionBounds) => {
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: 6.4163,
        longitude: 81.4612,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const onRegionChange = useCallback((region: Region) => {
        const clamp = (value: number, min: number, max: number) =>
            Math.min(Math.max(value, min), max);

        const constrainedRegion: Region = {
            latitude: clamp(region.latitude, yalaRegionBounds.minLatitude, yalaRegionBounds.maxLatitude),
            longitude: clamp(region.longitude, yalaRegionBounds.minLongitude, yalaRegionBounds.maxLongitude),
            latitudeDelta: Math.min(region.latitudeDelta, 0.1),
            longitudeDelta: Math.min(region.longitudeDelta, 0.1),
        };

        if (region.latitude !== constrainedRegion.latitude || region.longitude !== constrainedRegion.longitude) {
            setMapRegion(constrainedRegion);
            mapRef.current?.animateToRegion(constrainedRegion, 500);
        } else {
            setMapRegion(region);
        }
    }, [yalaRegionBounds]);

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

    return {
        mapRegion,
        onRegionChange,
        zoomIn,
        zoomOut,
    };
};
