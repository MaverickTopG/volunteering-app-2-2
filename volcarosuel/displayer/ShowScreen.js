// /src/screens/ShowScreen.js

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '../../auth/AuthContext';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

// Simple map from two‐letter state codes to full names
const STATE_MAP = {
  CA: 'California',
  NY: 'New York',
  TX: 'Texas',
  FL: 'Florida',
  WA: 'Washington',
  // add more as needed
};

// Category → header image URLs
const CATEGORY_IMAGES = {
  Animal: require('../../assets/animal.png'),
  Arts: require('../../assets/art.png'),
  Education: require('../../assets/education.png'),
  Environment: require('../../assets/enviroment.png'),
  Family: require('../../assets/family.png'),
  Hospital: require('../../assets/hospital.png'),
  Library: require('../../assets/library.png'),
  Seniors: require('../../assets/seniors.png'),
  Tech: require('../../assets/tech.png'),
};
const DEFAULT_HEADER_IMAGE = require('../../assets/animal.png');

// Compute status‐bar height (Android vs. iOS)
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
const HEADER_IMAGE_HEIGHT = 200; // Actual image height (excluding status bar)
const TOTAL_HEADER_HEIGHT = HEADER_IMAGE_HEIGHT + STATUS_BAR_HEIGHT;

const BOTTOM_SHEET_HEIGHT = height * 0.77;

export default function ShowScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);

  // "item" passed via route params (organization object)
  const item = route.params?.item || {};

  // If the item has a "reference" field (category), pick its header image
  const category = item.reference || 'Animal';
  const headerBgImage = CATEGORY_IMAGES[category] || DEFAULT_HEADER_IMAGE;

  // Color palette defaults (can be overridden by theme)
  const DEFAULT_PALETTE = [
    '#F7F7F7', // background behind cards (greyish white)
    '#FFFFFF', // card & header bg (pure white)
    '#FFFFFF', // button bg
    '#333333', // text/icons
  ];
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`@shop/active-${user.uid}`)
      .then((id) => {
        if (!id) return;
        const { themePacks, seasonal } = require('../screens/shop');
        const pack =
          themePacks.find((t) => t.id === id) ||
          seasonal.find((s) => s.id === id);
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

  // ─── Open maps with the address (matching MapScreen’s behavior) ───────
  const openMaps = () => {
    if (!item.address) return;

    const encodedAddress = encodeURIComponent(item.address);
    let url = '';

    if (Platform.OS === 'ios') {
      // Use the Apple Maps URI scheme for directions
      url = `maps://?daddr=${encodedAddress}`;
    } else {
      // Android: use Google Maps navigation intent
      url = `google.navigation:q=${encodedAddress}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback: open Google Maps web directions
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => Alert.alert('Error', 'Unable to open maps.'));
  };

  // ─── Copy email to clipboard ────────────────────────────────────────
  const copyToClipboard = (text) => {
    Clipboard.setStringAsync(text)
      .then(() => {
        Alert.alert('Copied!', `${text} has been copied to clipboard.`);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to copy.');
      });
  };

  // Handle "Visit Website" button tap
  const handleVisit = () => {
    if (!item.website) return;
    let url = item.website;
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        supported
          ? Linking.openURL(url)
          : Alert.alert('Error', 'Cannot open link');
      })
      .catch(() => Alert.alert('Error', 'Unexpected error'));
  };

  return (
    <View style={[styles.container, { backgroundColor: palette[0] }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ─── HEADER IMAGE ────────────────────────────────────── */}
      <ImageBackground
        source={headerBgImage}
        style={[
          styles.headerImage,
          { width: width, height: TOTAL_HEADER_HEIGHT },
        ]}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <View style={[styles.backCircle, { backgroundColor: palette[1] }]}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: '#FFF' }]}>
              {item.title}
            </Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>
      </ImageBackground>

      {/* ─── BOTTOM SHEET ────────────────────────────────────── */}
      <View
        style={[
          styles.bottomSheet,
          { height: BOTTOM_SHEET_HEIGHT, backgroundColor: palette[0] },
        ]}
      >
        <View style={styles.handleBar} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── DESCRIPTION CARD ─────────────────────────── */}
          <View style={[styles.card, { backgroundColor: palette[1] }]}>
            <Text style={[styles.sectionLabel, { color: palette[3] }]}>
              Description
            </Text>
            <Text style={[styles.bodyText, { color: palette[3] }]}>
              {item.description}
            </Text>
          </View>

          {/* ─── ADDRESS CARD ─────────────────────────────── */}
          {item.address && (
            <View style={[styles.card, { backgroundColor: palette[1] }]}>
              <Text style={[styles.sectionLabel, { color: palette[3] }]}>
                Address
              </Text>
              <TouchableOpacity onPress={openMaps}>
                <Text style={[styles.linkText, { color: '#1E90FF' }]}>
                  {item.address}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── CONTACT CARD ─────────────────────────────── */}
          {item.email && (
            <View style={[styles.card, { backgroundColor: palette[1] }]}>
              <Text style={[styles.sectionLabel, { color: palette[3] }]}>
                Contact
              </Text>
              <View style={styles.contactRow}>
                <Text style={[styles.bodyText, { color: palette[3] }]}>
                  {item.email}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(item.email)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color={palette[3]} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ─── VISIT WEBSITE BUTTON ──────────────────────── */}
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
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    flex: 1,
    marginTop: STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: HEADER_IMAGE_HEIGHT,
  },
  backButton: {
    padding: 6,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFPercentage(3),
    fontWeight: '800',
    color: '#FFF',
  },
  headerRightPlaceholder: {
    width: 32,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    zIndex: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'black',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  scrollView: {
    flex: 1,
    marginTop: TOTAL_HEADER_HEIGHT - HEADER_IMAGE_HEIGHT - 30,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },

  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: RFPercentage(1.8),
    lineHeight: RFPercentage(2.6),
  },
  linkText: {
    fontSize: RFPercentage(1.8),
    textDecorationLine: 'underline',
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyButton: {
    padding: 4,
  },

  visitBtn: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
  },
  visitTxt: {
    fontSize: RFPercentage(2),
    fontWeight: '600',
  },
});
