import { Animal } from '../types/map.types';

const animals: { [key: string]: Animal[] } = {
    "Deer": [
        // Spring data
        { lat: 6.4800, lang: 81.4000, timestamp: "2024-03-15T08:00:00Z" }, // Spring day - Northwest
        { lat: 6.3800, lang: 81.5400, timestamp: "2024-03-15T20:00:00Z" }, // Spring evening - Southeast
        // Summer data
        { lat: 6.4900, lang: 81.5300, timestamp: "2024-06-15T08:00:00Z" }, // Summer day - Northeast
        { lat: 6.3900, lang: 81.4100, timestamp: "2024-06-15T20:00:00Z" }, // Summer evening - Southwest
        // Fall data
        { lat: 6.3900, lang: 81.4700, timestamp: "2024-09-15T08:00:00Z" }, // Fall day - South Central
        { lat: 6.4700, lang: 81.4600, timestamp: "2024-09-15T20:00:00Z" }, // Fall evening - North Central
        // Winter data
        { lat: 6.4300, lang: 81.4000, timestamp: "2024-12-15T08:00:00Z" }, // Winter day - West Central
        { lat: 6.4400, lang: 81.5200, timestamp: "2024-12-15T20:00:00Z" }  // Winter evening - East Central
    ],
    "Leopard": [
        // Spring data
        { lat: 6.4800, lang: 81.5200, timestamp: "2024-03-15T09:00:00Z" }, // Spring day - Northeast
        { lat: 6.3900, lang: 81.4200, timestamp: "2024-03-15T21:00:00Z" }, // Spring evening - Southwest
        // Summer data
        { lat: 6.3800, lang: 81.5100, timestamp: "2024-06-15T09:00:00Z" }, // Summer day - Southeast
        { lat: 6.4900, lang: 81.4100, timestamp: "2024-06-15T21:00:00Z" }, // Summer evening - Northwest
        // Fall data
        { lat: 6.4700, lang: 81.4400, timestamp: "2024-09-15T09:00:00Z" }, // Fall day - North Central
        { lat: 6.3900, lang: 81.4800, timestamp: "2024-09-15T21:00:00Z" }, // Fall evening - South Central
        // Winter data
        { lat: 6.4000, lang: 81.5300, timestamp: "2024-12-15T09:00:00Z" }, // Winter day - Southeast
        { lat: 6.4600, lang: 81.4000, timestamp: "2024-12-15T21:00:00Z" }  // Winter evening - Northwest
    ],
    "Elephant": [
        // Spring data
        { lat: 6.3900, lang: 81.4500, timestamp: "2024-03-15T10:00:00Z" }, // Spring day - South Central
        { lat: 6.4800, lang: 81.5100, timestamp: "2024-03-15T22:00:00Z" }, // Spring evening - Northeast
        // Summer data
        { lat: 6.4900, lang: 81.4400, timestamp: "2024-06-15T10:00:00Z" }, // Summer day - North Central
        { lat: 6.3800, lang: 81.5200, timestamp: "2024-06-15T22:00:00Z" }, // Summer evening - Southeast
        // Fall data
        { lat: 6.4600, lang: 81.4000, timestamp: "2024-09-15T10:00:00Z" }, // Fall day - Northwest
        { lat: 6.3900, lang: 81.5100, timestamp: "2024-09-15T22:00:00Z" }, // Fall evening - Southeast
        // Winter data
        { lat: 6.3800, lang: 81.4200, timestamp: "2024-12-15T10:00:00Z" }, // Winter day - Southwest
        { lat: 6.4900, lang: 81.4700, timestamp: "2024-12-15T22:00:00Z" }  // Winter evening - North Central
    ],
    "Peacock": [
        // Spring data
        { lat: 6.3801, lang: 81.4401, timestamp: "2024-03-15T10:01:00Z" }, // Spring day - South Central
        { lat: 6.4701, lang: 81.5001, timestamp: "2024-03-15T22:01:00Z" }, // Spring evening - Northeast
        // Summer data
        { lat: 6.4801, lang: 81.4301, timestamp: "2024-06-15T10:01:00Z" }, // Summer day - North Central
        { lat: 6.3701, lang: 81.5101, timestamp: "2024-06-15T22:01:00Z" }, // Summer evening - Southeast
        // Fall data
        { lat: 6.4501, lang: 81.3901, timestamp: "2024-09-15T10:01:00Z" }, // Fall day - Northwest
        { lat: 6.3801, lang: 81.5001, timestamp: "2024-09-15T22:01:00Z" }, // Fall evening - Southeast
        // Winter data
        { lat: 6.3701, lang: 81.4101, timestamp: "2024-12-15T10:01:00Z" }, // Winter day - Southwest
        { lat: 6.4801, lang: 81.4601, timestamp: "2024-12-15T22:01:00Z" }  // Winter evening - North Central
    ]
};

export default animals;