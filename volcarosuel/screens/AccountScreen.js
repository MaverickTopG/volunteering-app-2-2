// /src/screens/StatsScreen.js

import React, { useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../auth/AuthContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Dimensions
const DIAMETER   = SCREEN_W;        // full-width circle
const RADIUS     = DIAMETER / 2;
const WRAPPER_H  = RADIUS;          // show only top half
const CARD_BASE  = 100;
const CARD_SIZE  = CARD_BASE * 2; // 150 × 2.25 = 337.5

// Category images
const CATEGORY_IMAGES = {
  Animal: require('../../assets/animal.png'),
  'Advocacy & Change': require('../../assets/advocacy.png'),
  Arts: require('../../assets/art.png'),
  Education: require('../../assets/education.png'),
  Environment: require('../../assets/enviroment.png'),
  Family: require('../../assets/family.png'),
  Hospital: require('../../assets/hospital.png'),
  Library: require('../../assets/library.png'),
  Seniors: require('../../assets/seniors.png'),
  Tech: require('../../assets/tech.png'),
};

const cardData = Object.entries(CATEGORY_IMAGES).map(([title, image], i) => ({
  id: i,
  title,
  image,
}));

export default function StatsScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { user }   = useContext(AuthContext);

  // Rotation animation
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  // Interpolate degrees
  const spinDeg     = rotation.interpolate({ inputRange:[0,1], outputRange:['0deg','360deg'] });
  const antiSpinDeg = rotation.interpolate({ inputRange:[0,1], outputRange:['0deg','-360deg'] });

  // Tabs
  const isBadges = route.name === 'Badges';
  const isStats  = route.name === 'Stats';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF"/>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* TAB BAR */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, isBadges && styles.tabActive]}
          onPress={() => !isBadges && navigation.navigate('Badges')}
        >
          <Text style={isBadges ? styles.tabTxtActive : styles.tabTxtInactive}>
            Badges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, isStats && styles.tabActive]}
          onPress={() => !isStats && navigation.navigate('Stats')}
        >
          <Text style={isStats ? styles.tabTxtActive : styles.tabTxtInactive}>
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: WRAPPER_H }]}
        showsVerticalScrollIndicator={false}
      >
        {/* LINK CARDS */}
        <View style={styles.linksGrid}>
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: '#FF6B35' }]}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle-outline" size={28} color="#FFF" />
            </View>
            <Text style={[styles.linkTitle, { color: '#FFF' }]}>About</Text>
            <Text style={[styles.linkSubtitle, { color: '#FFF' }]}>
              Learn more about NexoLink
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: '#4285F4' }]}
            onPress={() => Linking.openURL('https://mavericktopg.github.io/privacy_policy.html')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={28} color="#FFF" />
            </View>
            <Text style={[styles.linkTitle, { color: '#FFF' }]}>Privacy Policy</Text>
            <Text style={[styles.linkSubtitle, { color: '#FFF' }]}>
              View our privacy policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* THANK YOU */}
        <View style={styles.thanks}>
          <Text style={styles.thanksTxt}>
            Thank you for using NexoLink! We appreciate your support.
          </Text>
        </View>

        {/* LOGO */}
        {/* <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/new_icon.png')} // Replace with your actual logo path
            style={styles.logo}
            resizeMode="contain"
          />
        </View> */}
      </ScrollView>

      {/* CIRCLE + CARDS at bottom, showing top half */}
      <View style={styles.carouselWrapper}>
        {/* invisible circle background to define geometry */}
        <View style={styles.circleBg} />

        {/* cards around the circle */}
        {cardData.map((card, i) => {
          const baseDeg = (i / cardData.length) * 360;
          const baseDegStr = `${baseDeg}deg`;

          return (
            <Animated.View
              key={card.id}
              style={[
                styles.cardWrapper,
                {
                  transform: [
                    // center origin
                    { translateX: RADIUS - CARD_SIZE/2 },
                    { translateY: RADIUS - CARD_SIZE/2 },
                    // dynamic rotation
                    { rotate: spinDeg },
                    // static offset
                    { rotate: baseDegStr },
                    // push outward
                    { translateY: -RADIUS },
                  ],
                },
              ]}
            >
              {/* keep the image upright by undoing the spin+offset */}
              <Animated.View
                style={{ transform: [{ rotate: antiSpinDeg }, { rotate: `-${baseDeg}deg` }] }}
              >
                <Image source={card.image} style={styles.cardImage} />
              </Animated.View>
            </Animated.View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: {
    alignItems: 'center',
    padding: SCREEN_W * 0.04,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  headerTitle: { fontSize: SCREEN_W * 0.05, fontWeight: '600', color: '#000' },

  tabRow:{
    flexDirection:'row',
    marginHorizontal: SCREEN_W * 0.04,
    marginTop: SCREEN_H * 0.015,
  },
  tabBtn:{
    flex:1,
    paddingVertical: SCREEN_H * 0.015,
    marginHorizontal: SCREEN_W * 0.01,
    borderRadius: SCREEN_W * 0.06,
    alignItems:'center',
  },
  tabActive:{ borderWidth: 2, borderColor:'#000' },
  tabTxtActive:   { color:'#000', fontWeight:'600', fontSize: SCREEN_W * 0.04 },
  tabTxtInactive: { color:'#666', fontSize: SCREEN_W * 0.04 },

  content:{
    paddingHorizontal: SCREEN_W * 0.04,
    paddingTop: SCREEN_H * 0.015,
  },

  linksGrid:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom: SCREEN_H * 0.03,
  },
  linkCard:{
    width:'48%',
    borderRadius: SCREEN_W * 0.04,
    padding: SCREEN_W * 0.06,
    alignItems:'center',
    elevation:3,
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowRadius:4,
  },
  linkTitle:   { fontSize: SCREEN_W * 0.045, fontWeight:'600', marginTop: SCREEN_H * 0.01 },
  linkSubtitle:{ fontSize: SCREEN_W * 0.03, textAlign:'center', marginTop: SCREEN_H * 0.005, opacity:0.9 },

  thanks: { 
    marginBottom: SCREEN_H * 0.04, 
    alignItems: 'center' 
  },
  thanksTxt: { 
    fontSize: SCREEN_W * 0.035, 
    color: '#666', 
    textAlign: 'center' 
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_H * 0.05,
  },
  logo: {
    width: SCREEN_W * 0.25,
    height: SCREEN_W * 0.25,
    borderRadius:20
  },

  iconContainer: {
    width: SCREEN_W * 0.12,
    height: SCREEN_W * 0.12,
    borderRadius: SCREEN_W * 0.06,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_H * 0.005,
  },

  carouselWrapper:{
    position:'absolute',
    bottom:0,
    left:0,
    width: SCREEN_W,
    height: WRAPPER_H,
    overflow:'visible',
  },
  circleBg:{
    position:'absolute',
    width: DIAMETER,
    height: DIAMETER,
    borderRadius: RADIUS,
    top: 0,    // show the top half
    left: 0,
  },
  cardWrapper:{
    position:'absolute',
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  cardImage:{
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: SCREEN_W * 0.04,
  },
});