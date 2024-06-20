import React from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimalCarousel from './Sections/animalCarousel';
import TechCarousel from './Sections/techCarosuel'; // import TechCarousel similarly
import ChildrenCarousel from './Sections/childrenCarosuel'; // import ChildrenCarousel similarly
import SeniorsCarousel from './Sections/seniorsCarousel'; // import SeniorsCarousel similarly
import HospitalCarousel from './Sections/hospitalCarousel'; // import HospitalCarousel similarly

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

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('animals');
  const CarouselComponent = DATA[selectedCategory];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <CarouselComponent />
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <FlatList
            style={{ flexGrow: 0, backgroundColor: 'transparent' }}
            data={Object.keys(DATA)}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingLeft: _spacing }}
            showsHorizontalScrollIndicator={false}
            horizontal
            renderItem={({ item: category, index: fIndex }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(category);
                  }}
                >
                  <View
                    style={{
                      marginRight: _spacing,
                      padding: _spacing,
                      borderWidth: 2,
                      borderColor: _colors.active,
                      borderRadius: 12,
                      backgroundColor: selectedCategory === category ? _colors.active : _colors.inactive,
                    }}
                  >
                    <Text style={{ color: '#36303F', fontWeight: '700' }}>
                      {category}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
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
});
