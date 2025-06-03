// /src/screens/AboutScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const AboutScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER WITH BACK BUTTON ──────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About NexoLink</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="heart" size={32} color="#FF6B35" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Welcome to NexoLink</Text>
          <Text style={styles.heroSubtitle}>
            Empowering volunteers through meaningful connections and recognition
          </Text>
        </View>

        {/* Main Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardText}>
            NexoLink exists to empower and celebrate every volunteer's journey. Our goal is to provide you with an intuitive, beautiful, and rewarding experience that helps you stay organized, motivated, and recognized for all your hours of service.
          </Text>
          <Text style={styles.cardText}>
            Whether you're just beginning your volunteering adventure or you've been giving back for years, NexoLink is designed to keep track of your progress, highlight your impact, and encourage you to reach new milestones.
          </Text>
        </View>

        {/* Philosophy Section */}
        <View style={styles.philosophySection}>
          <Text style={styles.philosophyText}>
            At the heart of NexoLink lies a simple philosophy: every act of kindness, no matter how small, deserves recognition.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionDescription}>
            To build a welcoming platform that makes volunteering easy to track, genuinely fun to pursue, and deeply rewarding to share.
          </Text>
          
          <Text style={styles.beliefsTitle}>We believe:</Text>
          <View style={styles.beliefsList}>
            <View style={styles.beliefItem}>
              <View style={styles.beliefDot} />
              <Text style={styles.beliefText}>
                Every volunteer should feel celebrated for their contributions
              </Text>
            </View>
            <View style={styles.beliefItem}>
              <View style={styles.beliefDot} />
              <Text style={styles.beliefText}>
                Clear, visual feedback fosters long-term commitment to service
              </Text>
            </View>
            <View style={styles.beliefItem}>
              <View style={styles.beliefDot} />
              <Text style={styles.beliefText}>
                Tracking hours should be seamless—no frustration, just inspiration
              </Text>
            </View>
            <View style={styles.beliefItem}>
              <View style={styles.beliefDot} />
              <Text style={styles.beliefText}>
                Community service grows when people see the difference they've made
              </Text>
            </View>
          </View>
        </View>

        {/* Partnership Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community Partnership</Text>
          <Text style={styles.cardText}>
            We partner with local organizations, schools, and nonprofits to help you find new opportunities and stay connected. Our easy-to-use logging system ensures your hours are accurately recorded, and our milestone badges help you reflect on the real impact you're having.
          </Text>
        </View>

        {/* Impact Statement */}
        <View style={styles.impactSection}>
          <Text style={styles.impactText}>
            Whether you're helping a neighbor, cleaning up a park, or mentoring a child, NexoLink is here to support and encourage your volunteer spirit.
          </Text>
        </View>

        {/* Closing Section */}
        <View style={styles.closingSection}>
          <Text style={styles.closingText}>
            Thank you for being part of this journey. Together, we can magnify the power of volunteerism—one hour, one badge, and one life at a time.
          </Text>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  // ── SCREEN CONTAINER ───────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },

  // ── HEADER BAR ───────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    position: 'absolute',
    right: 24,
    width: 44,
    height: 44,
  },

  // ── SCROLL CONTAINER ──────────────────────────────────────────────
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120, // Extra padding for bottom tab bar
  },

  // ── HERO SECTION ──────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
    maxWidth: 280,
  },

  // ── CARD COMPONENTS ───────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  cardText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    marginBottom: 16,
    fontWeight: '400',
  },

  // ── PHILOSOPHY SECTION ────────────────────────────────────────────
  philosophySection: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 28,
    marginBottom: 32,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  philosophyText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // ── MISSION SECTION ───────────────────────────────────────────────
  missionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  missionDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    marginBottom: 28,
    fontWeight: '400',
  },
  beliefsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // ── BELIEFS LIST ──────────────────────────────────────────────────
  beliefsList: {
    paddingLeft: 4,
  },
  beliefItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  beliefDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginTop: 9,
    marginRight: 16,
    flexShrink: 0,
  },
  beliefText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    flex: 1,
    fontWeight: '400',
  },

  // ── IMPACT SECTION ────────────────────────────────────────────────
  impactSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  impactText: {
    fontSize: 16,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },

  // ── CLOSING SECTION ───────────────────────────────────────────────
  closingSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  closingText: {
    fontSize: 17,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },

  // ── BOTTOM PADDING ────────────────────────────────────────────────
  bottomPadding: {
    height: 40,
  },
});