// carousel.js
import React from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimalCarousel from './Sections/animalCarousel';
import TechCarousel from './Sections/techCarosuel';
import ChildrenCarousel from './Sections/childrenCarosuel';
import SeniorsCarousel from './Sections/seniorsCarousel';
import HospitalCarousel from './Sections/hospitalCarousel';
import { handleNavigation } from './navigationHandler';

const { width } = Dimensions.get('screen');

const DATA = {
  animals: AnimalCarousel,
  tech: TechCarousel,
  children: ChildrenCarousel,
  seniors: SeniorsCarousel,
  hospital: HospitalCarousel,
};

const _spacing = 10;
const _colors = {
  active: `#FCD259ff`,
  inactive: `#FCD25900`,
};

export default function EventsPage({ navigation }) {
  const [selectedCategory, setSelectedCategory] = React.useState('animals');
  const CarouselComponent = DATA[selectedCategory];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <CarouselComponent navigation={navigation} />
        <View style={styles.categoriesContainer}>
          <FlatList
            style={styles.flatList}
            data={Object.keys(DATA)}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.flatListContent}
            showsHorizontalScrollIndicator={false}
            horizontal
            renderItem={({ item: category }) => (
              <TouchableOpacity onPress={() => setSelectedCategory(category)}>
                <View
                  style={[
                    styles.categoryButton,
                    { backgroundColor: selectedCategory === category ? _colors.active : _colors.inactive },
                  ]}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  flatList: {
    flexGrow: 0,
    backgroundColor: 'transparent',
  },
  flatListContent: {
    paddingLeft: _spacing,
  },
  categoryButton: {
    marginRight: _spacing,
    paddingVertical: _spacing,
    paddingHorizontal: _spacing * 2,
    borderWidth: 2,
    borderColor: _colors.active,
    borderRadius: 12,
  },
  categoryText: {
    color: '#36303F',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
