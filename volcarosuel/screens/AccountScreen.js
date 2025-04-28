// AccountScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../../auth/AuthContext';
// Make sure your shop file exports these two arrays:
import { themePacks, seasonal } from './shop';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = s => (width  / guidelineBaseWidth)  * s;
const vScale= s => (height / guidelineBaseHeight) * s;

// Your original default light/pink palette:
const DEFAULT_PALETTE = [
  '#FFF6E7', // background
  '#FFF0D4', // header gradient start
  '#FFE8C9', // header gradient end
  '#333333'  // text/icons
];

function AccountScreen() {
  const { user } = useContext(AuthContext);
  const nav      = useNavigation();
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loading, setLoading] = useState(true);

  const loadActiveTheme = async () => {
    if (!user) {
      setPalette(DEFAULT_PALETTE);
      setLoading(false);
      return;
    }
    try {
      const key = `@shop/active-${user.uid}`;
      const id  = await AsyncStorage.getItem(key);
      if (id) {
        const pack =
          themePacks.find(t => t.id === id) ||
          seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          // fill out exactly 4 slots
          setPalette([
            c[0] ?? DEFAULT_PALETTE[0],
            c[1] ?? DEFAULT_PALETTE[1],
            c[2] ?? DEFAULT_PALETTE[2],
            c[3] ?? DEFAULT_PALETTE[3],
          ]);
          return;
        }
      }
      // no active theme found
      setPalette(DEFAULT_PALETTE);
    } catch (e) {
      console.warn('Failed loading active theme', e);
      setPalette(DEFAULT_PALETTE);
    } finally {
      setLoading(false);
    }
  };

  // run on mount...
  useEffect(() => { loadActiveTheme(); }, [user]);
  // ...and every time screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      loadActiveTheme();
    }, [user])
  );

  // not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.locked}>
        <Text style={styles.lockedTxt}>
          You must be logged in to view your account.
        </Text>
      </SafeAreaView>
    );
  }

  // still waiting on AsyncStorage
  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: palette[0] }]}>
        <ActivityIndicator size="large" color={palette[3]} />
      </View>
    );
  }

  // finally: render with dynamic palette
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette[0] }]}>
      {/* pill header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[palette[1], palette[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerPill}
        >
          <Text style={[styles.headerTitle, { color: palette[3] }]}>
            Account
          </Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: palette[1] }]}
          onPress={() =>
            Linking.openURL('https://mavericktopg.github.io/privacy_policy.html')
          }
        >
          <Text style={[styles.rowText, { color: palette[3] }]}>
            Privacy Policy
          </Text>
          <Ionicons
            name="chevron-forward"
            size={scale(20)}
            color={palette[3]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { backgroundColor: palette[1] }]}
          onPress={() => nav.navigate('AboutNexolink')}
        >
          <Text style={[styles.rowText, { color: palette[3] }]}>
            About Nexolink
          </Text>
          <Ionicons
            name="chevron-forward"
            size={scale(20)}
            color={palette[3]}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AboutNexolinkScreen({ navigation }) {
  return (
    <SafeAreaView style={aboutStyles.container}>
      <TouchableOpacity
        style={aboutStyles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={scale(24)} color="#333" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={aboutStyles.scrollContent}>
        <Text style={aboutStyles.header}>About Nexolink</Text>
        <Text style={aboutStyles.bodyText}>
          Welcome to Nexolink! We believe that volunteering is the heart of
          community connection. Nexolink is dedicated to bridging passionate
          volunteers with organizations that need them most. Our mission is to
          create a vibrant network where every act of kindness makes a
          difference. Thank you for joining us in making the world a better
          place.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();
export default function AccountStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Account"       component={AccountScreen} />
      <Stack.Screen name="AboutNexolink" component={AboutNexolinkScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  loading:       { flex:1,justifyContent:'center',alignItems:'center' },
  locked:        {
    flex:1,justifyContent:'center',alignItems:'center',
    backgroundColor:'#FFF6E7'
  },
  lockedTxt:     { fontSize:scale(18),color:'#333' },

  headerWrapper: {
    alignItems:'center',
    marginTop:vScale(20),
    marginBottom:vScale(10)
  },
  headerPill:    {
    width:'90%',
    paddingVertical:vScale(14),
    borderRadius:scale(50),
    alignItems:'center'
  },
  headerTitle:   {
    fontSize:scale(22),
    fontWeight:'700'
  },

  scrollContent: { paddingHorizontal:scale(16) },
  row:           {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    borderRadius:scale(12),
    padding:scale(12),
    marginBottom:vScale(12)
  },
  rowText:       { fontSize:scale(14),fontWeight:'500' },
});

const aboutStyles = StyleSheet.create({
  container:     { flex:1, backgroundColor:'#fff6e7' },
  backButton:    {
    position:'absolute',top:vScale(10),left:scale(10),
    zIndex:1,padding:scale(10)
  },
  scrollContent: {
    padding:scale(20),
    paddingTop:vScale(60)
  },
  header:        {
    fontSize:scale(26),fontWeight:'bold',
    color:'#333',marginBottom:vScale(20),
    textAlign:'center'
  },
  bodyText:      {
    fontSize:scale(16),color:'#333',
    lineHeight:scale(24),textAlign:'center'
  },
});
