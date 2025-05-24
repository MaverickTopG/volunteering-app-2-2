// ShowScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';
import { themePacks, seasonal } from '../screens/shop';

const { width, height } = Dimensions.get('window');
const scale = s => (width  / 428)  * s;
const vScale = s => (height / 926) * s;
const SHAPE_SIZE = width * 0.8;

// Default 4-color palette
const DEFAULT_PALETTE = [
  '#FFF6E7', // screen bg
  '#FFF0D4', // card & header bg
  '#FFE8C9', // button bg
  '#333333'  // text/icons
];

export default function ShowScreen({ route, navigation }) {
  const { item } = route.params;
  const { user } = useContext(AuthContext);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`@shop/active-${user.uid}`)
      .then(id => {
        if (!id) return;
        const pack =
          themePacks.find(t => t.id === id) ||
          seasonal.find(s => s.id === id);
        if (pack?.colors) {
          setPalette([
            pack.colors[0] ?? DEFAULT_PALETTE[0],
            pack.colors[1] ?? DEFAULT_PALETTE[1],
            pack.colors[2] ?? DEFAULT_PALETTE[2],
            pack.colors[3] ?? DEFAULT_PALETTE[3],
          ]);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleVisit = () => {
    if (!item.website) return;
    Linking.canOpenURL(item.website)
      .then(supported => {
        supported
          ? Linking.openURL(item.website)
          : Alert.alert('Error','Cannot open link');
      })
      .catch(() => Alert.alert('Error','Unexpected error'));
  };

  return (
    <View style={[styles.container, { backgroundColor: palette[0] }]}>
      {/* ▷ Background circles (must precede SafeAreaView to sit behind) */}
      <View style={[
        styles.circle,
        styles.circleLeft,
        { backgroundColor: palette[2] }
      ]}/>
      <View style={[
        styles.circle,
        styles.circleRight,
        { backgroundColor: palette[1] }
      ]}/>

      <SafeAreaView />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerPill, { backgroundColor: palette[1] }]}>
          <Text style={[styles.headerText, { color: palette[3] }]}>
            {item.title}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: palette[1] }]}>
          <Text style={[styles.bodyText, { color: palette[3] }]}>
            {item.description}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Map', { address: item.address })}
          >
            <Text style={[styles.linkText, { color: palette[3] }]}>
              {item.address}
            </Text>
          </TouchableOpacity>
          {item.email && (
            <Text style={[styles.bodyText, { color: palette[3] }]}>
              Contact: {item.email}
            </Text>
          )}
        </View>

        {item.website && (
          <TouchableOpacity
            style={[styles.visitBtn, { backgroundColor: palette[2] }]}
            onPress={handleVisit}
          >
            <Text style={[styles.visitTxt, { color: palette[3] }]}>
              Visit Website
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: palette[2] }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backTxt, { color: palette[3] }]}>
            ← Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',    // ensure offscreen shapes don't clip odd
  },
  scroll: {
    padding: scale(16),
    paddingBottom: vScale(50),
  },

  headerPill: {
    borderRadius: scale(25),
    paddingVertical: vScale(14),
    paddingHorizontal: scale(20),
    marginBottom: vScale(30),
    alignSelf: 'center',
    minWidth: '90%',
    top: vScale(10),
  },
  headerText: {
    fontSize: scale(22),
    fontWeight: '700',
    textAlign: 'center',
  },

  card: {
    borderRadius: scale(20),
    padding: scale(20),
    marginBottom: vScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bodyText: {
    fontSize: scale(16),
    lineHeight: vScale(24),
    marginBottom: vScale(12),
  },
  linkText: {
    fontSize: scale(16),
    textDecorationLine: 'underline',
    marginBottom: vScale(12),
  },

  visitBtn: {
    borderRadius: scale(25),
    paddingVertical: vScale(14),
    alignItems: 'center',
    marginBottom: vScale(20),
  },
  visitTxt: {
    fontSize: scale(18),
    fontWeight: '600',
  },

  backBtn: {
    borderRadius: scale(25),
    paddingVertical: vScale(14),
    alignItems: 'center',
  },
  backTxt: {
    fontSize: scale(18),
    fontWeight: '600',
  },

  // background circles
  circle: {
    position: 'absolute',
    width: SHAPE_SIZE * 0.4,
    height: SHAPE_SIZE * 0.4,
    borderRadius: (SHAPE_SIZE * 0.4) / 2,
    opacity: 0.2,
    zIndex: -1,
  },
  circleLeft: {
    bottom: -SHAPE_SIZE * 0.2,
    left: -SHAPE_SIZE * 0.1,
  },
  circleRight: {
    bottom: -SHAPE_SIZE * 0.2,
    right: -SHAPE_SIZE * 0.1,
  },
});
