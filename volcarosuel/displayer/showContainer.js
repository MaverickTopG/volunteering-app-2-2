import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const VolunteerSelectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Pass a reference if available; default to "Animal"
  const referenceParam = route.params?.reference || 'Animal';

  const handleApiPress = () => {
    navigation.navigate('api', { reference: referenceParam });
  };

  const handleDbPress = () => {
    navigation.navigate('db', { reference: referenceParam });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Select Data Source</Text>
      <TouchableOpacity style={styles.buttonWrapper} onPress={handleApiPress}>
        <LinearGradient
          colors={['#fff0d4', '#ffe8c9']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>API Mode</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonWrapper} onPress={handleDbPress}>
        <LinearGradient
          colors={['#fff0d4', '#ffe8c9']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Database Mode</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default VolunteerSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: -10,
    left: 5,
    padding: 10,
    zIndex: 100,
  },
  title: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    top: -50,
    alignSelf: 'center',
  },
  buttonWrapper: {
    marginVertical: 10,
    width: width * 0.7,
    alignSelf: 'center',
    top: -50,
  },
  buttonGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: RFPercentage(2.2),
    color: '#333',
  },
});
