// CustomSideBarMenu.js
import React, { useEffect, useRef, useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions, 
  Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDrawerStatus } from '@react-navigation/drawer';
import { AuthContext } from '../auth/AuthContext';
import { auth, db } from '../auth/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { themePacks, seasonal } from '../volcarosuel/screens/shop';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = s => (width / guidelineBaseWidth) * s;
const verticalScale = s => (height / guidelineBaseHeight) * s;

export default function CustomSideBarMenu(props) {
  const navigation = props.navigation;
  const { user, setUser } = useContext(AuthContext);

  // ---- Theme palette ----
  // [ background, gradStart, gradEnd, text/icon ]
  const DEFAULT = ['#fff6e7','#fff0d4','#ffe8c9','#333'];
  const [palette, setPalette] = useState(DEFAULT);
  const [themeLoading, setThemeLoading] = useState(true);

  // ---- Animation ----
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  // ---- Drawer status ----
  const isDrawerOpen = useDrawerStatus() === 'open';

  // ---- Fun fact ----
  const [randomFact, setRandomFact] = useState('');

  // ---- Load theme ----
  useEffect(() => {
    if (!user) {
      setThemeLoading(false);
      return;
    }
    const key = `@shop/active-${user.uid}`;
    AsyncStorage.getItem(key)
      .then(id => {
        if (!id) return;
        const pack = themePacks.find(t => t.id === id) || seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          setPalette([
            c[0] || DEFAULT[0],
            c[1] || DEFAULT[1],
            c[2] || DEFAULT[2],
            c[3] || DEFAULT[3],
          ]);
        }
      })
      .catch(console.warn)
      .finally(() => setThemeLoading(false));
  }, [user]);

  // ---- Fetch fun fact on open ----
  useEffect(() => {
    if (isDrawerOpen && !themeLoading) {
      (async () => {
        try {
          const snap = await getDocs(collection(db, 'volunteer_funfacts'));
          const facts = [];
          snap.forEach(d => {
            if (d.data().fun_fact) facts.push(d.data().fun_fact);
          });
          setRandomFact(facts.length
            ? facts[Math.floor(Math.random()*facts.length)]
            : 'No facts found.');
        } catch {
          setRandomFact('Error fetching facts.');
        }
      })();
    }
  }, [isDrawerOpen, themeLoading]);

  // ---- Rotate spaceship when open ----
  useEffect(() => {
    if (isDrawerOpen) {
      rotation.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      rotation.setValue(0);
    }
    return () => animationRef.current?.stop();
  }, [isDrawerOpen]);

  // ---- Logout ----
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // ---- Show email ----
  const handleSpaceshipPress = () => {
    Alert.alert(
      'Your Email',
      user?.email || 'Not logged in.'
    );
  };

  // ---- Rotation interpolate ----
  const rotate = rotation.interpolate({
    inputRange: [0,1],
    outputRange: ['0deg','360deg']
  });

  if (themeLoading) {
    // blank until theme loads
    return null;
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        <View style={styles.navSection}>
          {/** HOME */}
          <View style={[styles.cardContainer,{ backgroundColor: palette[0], borderColor: palette[3] }]}>
            <DrawerItem
              label="Home"
              labelStyle={[styles.drawerItemLabel,{ color: palette[3] }]}
              icon={() => null}
              onPress={() => navigation.navigate('NexoLink')}
              style={styles.drawerItem}
            />
          </View>
          {/** ADD ORG */}
          <View style={[styles.cardContainer,{ backgroundColor: palette[0], borderColor: palette[3] }]}>
            <DrawerItem
              label="Add an Org"
              labelStyle={[styles.drawerItemLabel,{ color: palette[3] }]}
              icon={() => null}
              onPress={() => navigation.navigate('Organizations')}
              style={styles.drawerItem}
            />
          </View>
          {/** ACCOUNT */}
          <View style={[styles.cardContainer,{ backgroundColor: palette[0], borderColor: palette[3] }]}>
            <DrawerItem
              label="Account"
              labelStyle={[styles.drawerItemLabel,{ color: palette[3] }]}
              icon={() => null}
              onPress={() => navigation.navigate('Account')}
              style={styles.drawerItem}
            />
          </View>
          {/** MAP */}
          <View style={[styles.cardContainer,{ backgroundColor: palette[0], borderColor: palette[3] }]}>
            <DrawerItem
              label="Volunteer Map"
              labelStyle={[styles.drawerItemLabel,{ color: palette[3] }]}
              icon={() => <Ionicons name="map-outline" size={24} color={palette[3]} />}
              onPress={() => navigation.navigate('VolunteerMap')}
              style={styles.drawerItem}
            />
          </View>

          {/** Fun Fact Card */}
          <View style={[styles.funCard,{ backgroundColor: palette[3] }]}>
            <Ionicons name="planet" size={scale(80)} color={palette[0]} />
            <Text style={[styles.funText,{ color: palette[0] }]}>
              Explore the Universe of Volunteering!
            </Text>
            <Text style={[styles.funFact,{ color: palette[0] }]}>
              {randomFact}
            </Text>
          </View>
        </View>
      </DrawerContentScrollView>

      {/** Spaceship button */}
      <TouchableOpacity style={styles.spaceshipContainer} onPress={handleSpaceshipPress}>
        <View style={[styles.spaceshipCircle,{ backgroundColor: palette[0] }]} />
        <Animated.Image
          source={require('../assets/spaceship.png')}
          style={[
            styles.spaceship,
            { transform: [{ rotate }] }
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  drawerContent: {
    paddingTop: verticalScale(0.15 * height),
  },
  navSection: {
    marginLeft: scale(30),
  },
  cardContainer: {
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
    borderWidth: scale(1),
    // shadows
    shadowColor: '#000',
    shadowOffset: { width:0, height:verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  drawerItem: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
  },
  drawerItemLabel: {
    fontSize: scale(16),
  },
  funCard: {
    borderRadius: scale(12),
    marginTop: verticalScale(30),
    padding: scale(15),
    alignItems: 'center',
    minHeight: verticalScale(120),
    justifyContent: 'center',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width:0, height:verticalScale(2) },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 4,
  },
  funText: {
    marginTop: verticalScale(10),
    fontSize: scale(18),
    textAlign: 'center',
  },
  funFact: {
    marginTop: verticalScale(10),
    fontSize: scale(14),
    textAlign: 'center',
  },
  spaceshipContainer: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: scale(30),
    width: scale(60),
    height: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceshipCircle: {
    position: 'absolute',
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    zIndex: -1,
  },
  spaceship: {
    width: scale(50),
    height: scale(50),
  },
});
