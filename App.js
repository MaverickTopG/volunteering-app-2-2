import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './auth/AuthContext';  // Adjust the path
import DrawerNavigator from './navigation/drawer';
import LoginScreen from './auth/LoginScreen';  // Adjust path
import RegisterScreen from './auth/RegisterScreen';
import { registerRootComponent } from 'expo';
import AnimalTabNavigator from './volcarosuel/Navigators/AnimalTabNavigator.js';
import AppUpdateChecker from './AppUpdateChecker.js';
import AnimalCarousel from './volcarosuel/Sections/animalCarousel.js'; // Adjust path
import TechCarousel from './volcarosuel/Sections/environmentCarosuel.js'; // Adjust path
import FamilyCarousel from './volcarosuel/Sections/familyCarosuel.js'; // Adjust path
import HospitalCarousel from './volcarosuel/Sections/hospitalCarousel.js'; // Adjust path
import SeniorCarousel from './volcarosuel/Sections/libraryCarosuel.js'; // Adjust path
import DisplayScreen from './volcarosuel/displayer/ShowScreen.js'; // Adjust path

const Stack = createStackNavigator();

// Carousel Stack Navigator
const CarouselStack = ({ route }) => {
  const { carouselName } = route.params || {}; // Retrieve the carousel name dynamically
  let CarouselComponent;

  switch (carouselName) {
    case 'TechCarousel':
      CarouselComponent = TechCarousel;
      break;
    case 'FamilyCarousel':
      CarouselComponent = FamilyCarousel;
      break;
    case 'HospitalCarousel':
      CarouselComponent = HospitalCarousel;
      break;
    case 'SeniorCarousel':
      CarouselComponent = SeniorCarousel;
      break;
    default:
      CarouselComponent = AnimalCarousel;
      break;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Carousel" component={CarouselComponent} />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
    </Stack.Navigator>
  );
};

// Main Stack Navigator
const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={DrawerNavigator} />
    
      <Stack.Screen name="AnimalTabNavigator" component={AnimalTabNavigator} />
      <Stack.Screen name="CarouselStack" component={CarouselStack} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  // Check for app updates on app load
  useEffect(() => {
    AppUpdateChecker();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNav />
      </NavigationContainer>
    </AuthProvider>
  );
};

registerRootComponent(App);

export default App;
