import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MapFiltersNavigationProp = StackNavigationProp<RootStackParamList, 'MapFilters'>;

interface SelectionCardProps {
  icon?: string;
  image?: any;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ icon, image, label, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, isSelected && styles.selectedCard]} 
    onPress={onPress}
  >
    {icon ? (
      <Ionicons name={icon} size={32} color={isSelected ? '#f4511e' : '#666'} />
    ) : (
      <Image source={image} style={styles.animalImage} />
    )}
    <Text style={[styles.cardLabel, isSelected && styles.selectedLabel]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const MapFiltersScreen = () => {
    const navigation = useNavigation<MapFiltersNavigationProp>();
    const [season, setSeason] = useState<'Spring' | 'Summer' | 'Fall' | 'Winter'>('Spring');
    const [timeOfDay, setTimeOfDay] = useState<'dayTime' | 'evening'>('dayTime');
    const [selectedAnimals, setSelectedAnimals] = useState<string[]>(['all']);

    const toggleAnimalSelection = (value: string) => {
        if (value === 'all') {
            setSelectedAnimals(['all']);
        } else {
            let newSelection = [...selectedAnimals];
            if (newSelection.includes('all')) {
                newSelection = [];
            }
            if (newSelection.includes(value)) {
                newSelection = newSelection.filter(item => item !== value);
            } else {
                newSelection.push(value);
            }
            if (newSelection.length === 0) {
                newSelection = ['all'];
            }
            setSelectedAnimals(newSelection);
        }
    };

    const seasons = [
        { value: 'Spring', icon: 'leaf' },
        { value: 'Summer', icon: 'sunny' },
        { value: 'Fall', icon: 'umbrella' },
        { value: 'Winter', icon: 'snow' }
    ];

    const timeOptions = [
        { value: 'dayTime', icon: 'sunny', label: 'Day Time' },
        { value: 'evening', icon: 'moon', label: 'Evening' }
    ];

    const animals = [
        { value: 'all', image: require('../../assets/images/default-icon.png'), label: 'All' },
        { value: 'Deer', image: require('../../assets/images/deer-icon.png'), label: 'Deer' },
        { value: 'Leopard', image: require('../../assets/images/leopard-icon.png'), label: 'Leopard' },
        { value: 'Elephant', image: require('../../assets/images/elephant-icon.png'), label: 'Elephant' },
        { value: 'Peacock', image: require('../../assets/images/peacock-icon.png'), label: 'Peacock' }
    ];

    const handleGoToMap = () => {
        navigation.navigate('MapScreen', {
            filters: {
                season,
                timeOfDay,
                animal: selectedAnimals
            }
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Animal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.cardRow}>
                        {animals.map((animal) => (
                            <SelectionCard
                                key={animal.value}
                                image={animal.image}
                                label={animal.label}
                                isSelected={selectedAnimals.includes(animal.value)}
                                onPress={() => toggleAnimalSelection(animal.value)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Season</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.cardRow}>
                        {seasons.map((item) => (
                            <SelectionCard
                                key={item.value}
                                icon={item.icon}
                                label={item.value}
                                isSelected={season === item.value}
                                onPress={() => setSeason(item.value as any)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time of Day</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.cardRow}>
                        {timeOptions.map((item) => (
                            <SelectionCard
                                key={item.value}
                                icon={item.icon}
                                label={item.label}
                                isSelected={timeOfDay === item.value}
                                onPress={() => setTimeOfDay(item.value as any)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleGoToMap}>
                <Text style={styles.buttonText}>View on Map</Text>
                <Ionicons name="map" size={24} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    section: {
     paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 10,
        color: '#333',

    },
    cardRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    card: {
        width: 100,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 12,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCard: {
        borderColor: '#322a28',
        backgroundColor: '#fff9f7',
    },
    animalImage: {
        width: 40,
        height: 40,
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    selectedLabel: {
        color: '#322a28',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#5A8200',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        margin: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 8,
    }
});

export default MapFiltersScreen;