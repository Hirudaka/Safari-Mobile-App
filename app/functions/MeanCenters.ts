import { 
    Animal, 
    SeasonalPredictions, 
    PredictionPoint,
    Season,
    TimeOfDay,
    SeasonData
} from '../types/map.types';

export default function calculatePredictions(
    animals: Animal[], // Updated to use the backend's Animal array
    season: Season,
    timeOfDay: TimeOfDay
): SeasonalPredictions {
    const predictions: SeasonalPredictions = {};

    const isDayTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const hour = date.getUTCHours();
        // Debug timestamp parsing
        console.log(`Parsing timestamp: ${timestamp}, Hour: ${hour}, TimeOfDay: ${timeOfDay}`);
        return timeOfDay === 'dayTime' ? (hour >= 6 && hour < 18) : (hour < 6 || hour >= 18);
    };

    const isInSeason = (timestamp: string, targetSeason: Season): boolean => {
        const date = new Date(timestamp);
        const month = date.getUTCMonth();
        const seasonRanges: Record<Season, number[]> = {
            'Spring': [2, 3, 4],
            'Summer': [5, 6, 7],
            'Fall': [8, 9, 10],
            'Winter': [11, 0, 1]
        };
        // Debug season matching
        console.log(`Checking season for month ${month} against target ${targetSeason}`);
        return seasonRanges[targetSeason].includes(month);
    };

    // Group animals by class_name
    const groupedAnimals: { [key: string]: Animal[] } = {};
    animals.forEach(animal => {
        if (!groupedAnimals[animal.class_name]) {
            groupedAnimals[animal.class_name] = [];
        }
        groupedAnimals[animal.class_name].push(animal);
    });

    for (const animalType in groupedAnimals) {
        if (!predictions[animalType]) {
            predictions[animalType] = {};
        }
        if (!predictions[animalType][season]) {
            predictions[animalType][season] = {
                dayTime: { predictions: [] },
                evening: { predictions: [] }
            } as SeasonData;
        }

        const filteredLocations = groupedAnimals[animalType].filter(loc => 
            isInSeason(loc.timestamp, season) && isDayTime(loc.timestamp)
        );

        if (filteredLocations.length > 0) {
            const meanLat = filteredLocations.reduce((sum, loc) => sum + loc.estimatedAnimalLocation.latitude, 0) / filteredLocations.length;
            const meanLng = filteredLocations.reduce((sum, loc) => sum + loc.estimatedAnimalLocation.longitude, 0) / filteredLocations.length;

            const predictionPoints: PredictionPoint[] = [
                {
                    latitude: meanLat,
                    longitude: meanLng,
                    probability: 0.9
                },
                {
                    latitude: meanLat + (Math.random() * 0.01 - 0.005),
                    longitude: meanLng + (Math.random() * 0.01 - 0.005),
                    probability: 0.7
                },
                {
                    latitude: meanLat + (Math.random() * 0.015 - 0.0075),
                    longitude: meanLng + (Math.random() * 0.015 - 0.0075),
                    probability: 0.5
                },
                {
                    latitude: meanLat + (Math.random() * 0.02 - 0.01),
                    longitude: meanLng + (Math.random() * 0.02 - 0.01),
                    probability: 0.3
                },
                {
                    latitude: meanLat + (Math.random() * 0.025 - 0.0125),
                    longitude: meanLng + (Math.random() * 0.025 - 0.0125),
                    probability: 0.1
                }
            ];

            if (predictions[animalType][season]) {
                predictions[animalType][season]![timeOfDay] = {
                    predictions: predictionPoints
                };
            }
        }
    }

    return predictions;
}