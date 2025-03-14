import { NavigationProp } from '@react-navigation/native';
import { MapFilters } from './map.types';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: {
    data: {
      class_name: string;
      classification_confidence: number;
      height_pixels: number;
      detection_confidence: number;
      imageUri: string;
    };
  };
  MapScreen: {
    filters: MapFilters;
  };
  MapFilters: undefined;
};

export type NavigationProps = NavigationProp<RootStackParamList>;