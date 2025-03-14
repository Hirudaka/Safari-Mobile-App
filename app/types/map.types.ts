export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface YalaRegionBounds {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
}

export interface MeanCenter {
    [animal: string]: {
        [group: string]: {
            meanLatitude: number;
            meanLongitude: number;
        };
    };
}

export interface SeasonalMeanCenter {
    [animal: string]: {
        [season: string]: {
            dayTime: { meanLatitude: number; meanLongitude: number; };
            evening: { meanLatitude: number; meanLongitude: number; };
        };
    };
}

export interface Animal {
    lat: number;
    lang: number;
    timestamp: string; // ISO string format
}

export interface Animals {
    [key: string]: Animal[];
}

export interface CustomMarkerProps {
    image: number;
}

export interface Location {
    lat: number;
    lang: number;
}

export interface MapFilters {
    season: Season;
    timeOfDay: TimeOfDay;
    animal: string[];
}

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type TimeOfDay = 'dayTime' | 'evening';

export interface PredictionPoint {
    latitude: number;
    longitude: number;
    probability: number;
}

export interface PredictionWithAnimal extends PredictionPoint {
    animalType: string;
    distance?: number;
}

export interface RouteResult {
    destination: {
        latitude: number;
        longitude: number;
    };
    prediction: PredictionWithAnimal;
}

export interface TimeSpecificPredictions {
    predictions: PredictionPoint[];
}

export interface SeasonData {
    dayTime: TimeSpecificPredictions;
    evening: TimeSpecificPredictions;
}

export interface AnimalPredictions {
    [key: string]: {
        [K in Season]?: SeasonData;
    };
}

export interface SeasonalPredictions extends AnimalPredictions {}