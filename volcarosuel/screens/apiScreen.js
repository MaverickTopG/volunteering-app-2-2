// ApiMode.js

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Replace these constants with your actual Charity Navigator credentials.
const CHARITY_NAVIGATOR_API_URL = 'https://api.charitynavigator.org/v2/Organizations';
const APP_ID = 'YOUR_APP_ID';
const APP_KEY = 'YOUR_APP_KEY';

const ApiMode = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const referenceParam = route.params?.reference || 'Animal';

  const [loading, setLoading] = useState(true);
  const [apiResults, setApiResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fixed radius 200 miles, filtered by the provided reference.
        const url = `${CHARITY_NAVIGATOR_API_URL}?app_id=${APP_ID}&app_key=${APP_KEY}&search=${referenceParam}&distance=200`;
        console.log('Fetching API data from:', url);
        const response = await fetch(url);
        const data = await response.json();
        setApiResults(data);
      } catch (error) {
        console.error('Error fetching API data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [referenceParam]);

  const handleLiveOpportunitiesPress = () => {
    // Navigate to DisplayScreen passing reference and fixed radius.
    navigation.navigate('DisplayScreen', { reference: referenceParam, radius: 200 });
  };

  const handleCardPress = (item) => {
    navigation.navigate('DisplayScreen', { item });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading opportunities...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title Header */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{referenceParam}</Text>
      </View>

      {/* Live Opportunities Button */}
      <TouchableOpacity style={styles.liveButton} onPress={handleLiveOpportunitiesPress}>
        <LinearGradient
          colors={['#fff0d4', '#ffe8c9']}
          style={styles.liveButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.liveButtonText}>Live Opportunities</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* List of Organizations */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {apiResults && apiResults.length > 0 ? (
          apiResults.map((orgItem, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cardWrapper}
              onPress={() => handleCardPress(orgItem)}
            >
              <LinearGradient
                colors={['#fff0d4', '#ffe8c9']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.cardTitle}>
                  {orgItem.charityName || orgItem.title}
                </Text>
                {/* Additional info such as mission, website, etc., can be added here */}
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No organizations found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApiMode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  backButton: {
    position: 'absolute',
    top: -10,
    left: 5,
    padding: 10,
    zIndex: 100,
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333',
    top:-15,
  },
  liveButton: {
    marginVertical: 10,
    alignSelf: 'center',
    width: '90%',
  },
  liveButtonGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveButtonText: {
    fontSize: RFPercentage(2.2),
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    paddingTop: 10,
  },
  cardWrapper: {
    marginVertical: 8,
    alignSelf: 'center',
    width: width * 0.9,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    elevation: 3,
  },
  cardTitle: {
    fontSize: RFPercentage(2.2),
    color: '#333',
    textAlign: 'center',
  },
  emptyContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFPercentage(2.2),
    color: '#333',
  },
});
