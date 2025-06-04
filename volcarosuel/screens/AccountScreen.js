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

  // Helper to check if a given route is active
  const isActiveRoute = (routeName) => route.name === routeName;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── TAB BAR ──────────────────────────────────────────────────── */}

      <View style={styles.buttonRow}>
        {/* Badges Button */}
        <TouchableOpacity
          style={[
            styles.singleButton,
            isActiveRoute('Account') && styles.activeButton,
          ]}
          onPress={() => {
            if (!isActiveRoute('Account')) {
              navigation.getParent()?.navigate('Badges');
            }
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              isActiveRoute('Badges') ? styles.activeButtonText : styles.inactiveButtonText,
            ]}
          >
            Badges
          </Text>
        </TouchableOpacity>

        {/* Account Button */}
        <TouchableOpacity
          style={[
            styles.singleButton,
            isActiveRoute('Stats') && styles.activeButton,
          ]}
          onPress={() => {
            if (!isActiveRoute('Stats')) {
              navigation.getParent()?.navigate('Stats');
            }
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              isActiveRoute('Stats') ? styles.activeButtonText : styles.inactiveButtonText,
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.linksGrid}>
          {/* ABOUT CARD */}
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: '#FF6B35' }]}
            onPress={() => navigation.navigate('About')}
          >
            <Ionicons
              name="information-circle-outline"
              size={32}
              color="#FFFFFF"
            />
            <Text style={[styles.linkCardValue, { color: '#FFFFFF' }]}>
              About
            </Text>
            <Text style={[styles.linkCardLabel, { color: '#FFFFFF' }]}>
              Learn more about NexoLink
            </Text>
          </TouchableOpacity>

          {/* PRIVACY POLICY CARD */}
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: '#4285F4' }]}
            onPress={() => {
              const url = 'https://mavericktopg.github.io/privacy_policy.html';
              Linking.canOpenURL(url)
                .then((supported) => {
                  if (supported) {
                    return Linking.openURL(url);
                  }
                })
                .catch((err) => console.error('An error occurred', err));
            }}
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

        {/* ─── THANK YOU MESSAGE ──────────────────────────────────────── */}
        <View style={styles.thankYouContainer}>
          <Text style={styles.thankYouText}>
            Thank you for using NexoLink! We appreciate your support.
          </Text>
        </View>

        {/* Bottom padding so nothing gets overlapped */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  // ── SCREEN CONTAINER ─────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── HEADER ───────────────────────────────────────────────────────
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

  // ── TAB BAR ───────────────────────────────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  singleButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  activeButton: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#000000',
  },
  inactiveButtonText: {
    color: '#666666',
  },


  // ── MAIN CONTENT WRAPPER ─────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },

  // ── LINKS GRID 2×2 ───────────────────────────────────────────────
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

  // ── THANK YOU SECTION ─────────────────────────────────────────────
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
