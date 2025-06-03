// /src/screens/StatsScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const StatsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Tab button navigates via parent navigator
  const TabButton = ({ title }) => {
    const isActive = route.name === title;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => {
          if (!isActive) {
            navigation.getParent()?.navigate(title);
          }
        }}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  // When “Privacy Policy” is tapped, open external link
  const openPrivacyPolicy = () => {
    const url = 'https://mavericktopg.github.io/privacy_policy.html'; // ← Replace this with your actual privacy URL
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.warn("Can't open URL:", url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER (no back/settings icons) ───────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        {/* We deliberately leave an empty View on the right so title stays centered */}
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── TAB NAVIGATION ─────────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <TabButton title="Badges" />
        <TabButton title="Leaderboard" />
        <TabButton title="Account" />
      </View>

      {/* ─── MAIN CONTENT: two cards (About + Privacy) ───────────────────── */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.linksGrid}>
          {/* ABOUT CARD: in‐app navigation to AboutScreen */}
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: '#FF6B35' }]}
            onPress={() => navigation.navigate('About')}
          >
            <Ionicons name="information-circle-outline" size={32} color="#FFFFFF" />
            <Text style={[styles.linkCardValue, { color: '#FFFFFF' }]}>
              About
            </Text>
            <Text style={[styles.linkCardLabel, { color: '#FFFFFF' }]}>
              Learn more about NexoLink
            </Text>
          </TouchableOpacity>

          {/* PRIVACY POLICY CARD: opens external URL */}
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: '#4285F4' }]}
            onPress={openPrivacyPolicy}
          >
            <Ionicons name="document-text-outline" size={32} color="#FFFFFF" />
            <Text style={[styles.linkCardValue, { color: '#FFFFFF' }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.linkCardLabel, { color: '#FFFFFF' }]}>
              View our privacy policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── THANK YOU MESSAGE ──────────────────────────────────────────── */}
        <View style={styles.thankYouContainer}>
          <Text style={styles.thankYouText}>
            Thank you for using NexoLink! We appreciate your support.
          </Text>
        </View>

        {/* Bottom padding so nothing gets overlapped by bottom nav */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  // ── SCREEN CONTAINER ───────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── HEADER (no back/settings) ──────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // center title
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
  },

  // ── TAB NAVIGATION ────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // ── MAIN CONTENT WRAPPER ───────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // ── LINKS GRID 2×2 ─────────────────────────────────────────────────
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  linkCard: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  linkCardValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  linkCardLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },

  // ── THANK YOU SECTION ──────────────────────────────────────────────
  thankYouContainer: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
