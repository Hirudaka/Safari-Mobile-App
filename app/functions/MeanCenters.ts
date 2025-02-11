interface Location {
  lat: number;
  lang: number;
}

interface Animal {
  [key: string]: Location[];
}

interface MeanCenter {
  [key: string]: {
    [key: string]: {
      meanLatitude: number;
      meanLongitude: number;
    };
  };
}

export default function calculateMeanCenter(animals: Animal, clusterSize: number): MeanCenter {
  const meanCenters: MeanCenter = {};

  for (const animal in animals) {
    if (Object.prototype.hasOwnProperty.call(animals, animal)) {
      const locations = animals[animal];
      const groupedLocations = groupLocationsByCluster(locations, clusterSize);

      meanCenters[animal] = {};

      for (const group in groupedLocations) {
        if (Object.prototype.hasOwnProperty.call(groupedLocations, group)) {
          const groupLocations = groupedLocations[group];
          const sumLatitude = groupLocations.reduce((acc, current) => acc + current.lat, 0);
          const sumLongitude = groupLocations.reduce((acc, current) => acc + current.lang, 0);
          const count = groupLocations.length;

          if (count > 0) {
            const meanLatitude = sumLatitude / count;
            const meanLongitude = sumLongitude / count;

            meanCenters[animal][group] = {
              meanLatitude,
              meanLongitude,
            };
          } else {
            console.log(`No locations found for ${animal} in group ${group}`);
          }
        }
      }
    }
  }

  return meanCenters;
}

function groupLocationsByCluster(locations: Location[], clusterSize: number) {
  const groupedLocations: { [key: string]: Location[] } = {};

  for (let i = 0; i < locations.length; i += clusterSize) {
    const group = Math.floor(i / clusterSize);
    if (!groupedLocations[group]) {
      groupedLocations[group] = [];
    }
    groupedLocations[group].push(...locations.slice(i, i + clusterSize));
  }

  return groupedLocations;
}