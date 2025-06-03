// /src/screens/VolunteerBadgesScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';

import { auth, db } from '../../auth/firebase'; // Adjust this import if your Firebase setup lives elsewhere
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');

// ─── Exactly 10 badge thresholds (cumulative volunteer hours) ───────
const BADGE_DEFINITIONS = [
  { id: 'badge_1',  title: 'First Step',         target: 1,   icon: 'time-outline',            type: 'circle' },
  { id: 'badge_5',  title: 'Committed',          target: 5,   icon: 'flash-outline',           type: 'circle' },
  { id: 'badge_10', title: 'Champion',           target: 10,  icon: 'trophy-outline',          type: 'shield' },
  { id: 'badge_15', title: 'Hero',               target: 15,  icon: 'medal-outline',           type: 'circle' },
  { id: 'badge_20', title: 'Superstar',          target: 20,  icon: 'star-outline',            type: 'shield' },
  { id: 'badge_25', title: 'Legend',             target: 25,  icon: 'ribbon-outline',          type: 'banner' },
  { id: 'badge_30', title: 'Guardian',           target: 30,  icon: 'heart-outline',           type: 'circle' },
  { id: 'badge_40', title: 'Community Leader',   target: 40,  icon: 'people-outline',          type: 'shield' },
  { id: 'badge_50', title: 'Diamond Volunteer',  target: 50,  icon: 'diamond-outline',         type: 'banner' },
  { id: 'badge_75', title: 'Master Volunteer',   target: 75,  icon: 'checkmark-circle-outline', type: 'shield' },
];
const BADGE_IDS = BADGE_DEFINITIONS.map((b) => b.id);

// Firestore doc IDs:
const CLAIMED_DOC_ID   = 'status'; // users/{uid}/claimedBadges/status
const FAVORITES_DOC_ID = 'list';   // users/{uid}/favorites/list

export default function VolunteerBadgesScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // ───── App State ───────────────────────────────────────────────────
  const [totalHours, setTotalHours]       = useState(0);
  const [claimedStatus, setClaimedStatus] = useState({}); // { badge_1: boolean, … }
  const [favorites, setFavorites]         = useState([]); // up to 3 badge IDs
  const [loading, setLoading]             = useState(true);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Animated “pulse” values, one per badge
  const animatedValuesRef = useRef({});
  useEffect(() => {
    const vals = {};
    BADGE_IDS.forEach((id) => {
      vals[id] = new Animated.Value(0);
    });
    animatedValuesRef.current = vals;
  }, []);

  // ───── On mount / auth change: load hours, claimed badges, and favorites ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadTotalHours(user.uid);
        await loadClaimedStatus(user.uid);
        await loadFavorites(user.uid);
      } else {
        // If not signed in, reset
        setTotalHours(0);
        const emptyMap = {};
        BADGE_IDS.forEach((id) => (emptyMap[id] = false));
        setClaimedStatus(emptyMap);
        setFavorites([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  /**
   * Sum up all hours_contributed from volunteer_logs for this user.
   */
  const loadTotalHours = async (uid) => {
    try {
      const logsRef = collection(db, 'volunteer_logs');
      const q = query(logsRef, where('user_id', '==', uid));
      const snap = await getDocs(q);
      let sum = 0;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const hrs = parseFloat(data.hours_contributed) || 0;
        sum += hrs;
      });
      setTotalHours(sum);
    } catch (e) {
      console.error('▶︎ loadTotalHours error:', e);
      Alert.alert('Error', 'Could not load volunteer hours.');
      setTotalHours(0);
    }
  };

  /**
   * Fetch or initialize users/{uid}/claimedBadges/status
   * If missing, write all flags false.
   */
  const loadClaimedStatus = async (uid) => {
    setLoading(true);
    try {
      const ref = doc(db, 'users', uid, 'claimedBadges', CLAIMED_DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setClaimedStatus(snap.data());
      } else {
        // Initialize all badges=false
        const initMap = {};
        BADGE_IDS.forEach((id) => (initMap[id] = false));
        await setDoc(ref, initMap);
        setClaimedStatus(initMap);
      }
    } catch (e) {
      console.error('▶︎ loadClaimedStatus error:', e);
      Alert.alert('Error', 'Could not load claimed badges.');
      const fallback = {};
      BADGE_IDS.forEach((id) => (fallback[id] = false));
      setClaimedStatus(fallback);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch or initialize users/{uid}/favorites/list
   * If missing, write list: [].
   */
  const loadFavorites = async (uid) => {
    setLoading(true);
    try {
      const ref = doc(db, 'users', uid, 'favorites', FAVORITES_DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setFavorites(Array.isArray(data.list) ? data.list : []);
      } else {
        await setDoc(ref, { list: [] });
        setFavorites([]);
      }
    } catch (e) {
      console.error('▶︎ loadFavorites error:', e);
      Alert.alert('Error', 'Could not load favorite badges.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle a badge in favorites:
   *   • Only if that badge is already claimed
   *   • Max 3 favorites
   *   • Persist to Firestore at users/{uid}/favorites/list
   */
  const toggleFavorite = async (badgeId) => {
    if (!claimedStatus[badgeId]) {
      Alert.alert('Locked', 'You must claim this badge before favoriting.');
      return;
    }

    let newList = [...favorites];
    if (newList.includes(badgeId)) {
      newList = newList.filter((id) => id !== badgeId);
    } else {
      if (newList.length >= 3) {
        Alert.alert('Max Favorites', 'Can only favorite up to 3 badges.');
        return;
      }
      newList.push(badgeId);
    }
    setFavorites(newList);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, 'users', user.uid, 'favorites', FAVORITES_DOC_ID);
      await updateDoc(ref, { list: newList });
    } catch (e) {
      console.error('▶︎ toggleFavorite error:', e);
    }
  };

  /**
   * Attempt to claim a badge:
   *   • Only if totalHours >= target
   *   • Pulse animation
   *   • updateDoc → users/{uid}/claimedBadges/status.{badgeId} = true
   */
  const claimBadge = async (badgeId, target) => {
    if (totalHours < target) {
      Alert.alert('Not Ready', `You need ${target} hours to unlock this badge.`);
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    // Animate pulse
    const animVal = animatedValuesRef.current[badgeId];
    if (animVal) {
      Animated.sequence([
        Animated.timing(animVal, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(animVal, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    // Update Firestore
    try {
      const ref = doc(db, 'users', user.uid, 'claimedBadges', CLAIMED_DOC_ID);
      await updateDoc(ref, { [badgeId]: true });
      setClaimedStatus((prev) => ({ ...prev, [badgeId]: true }));
      Alert.alert('Badge Claimed!', 'Congratulations on unlocking a new badge!');
    } catch (e) {
      console.error('▶︎ claimBadge error:', e);
      Alert.alert('Error', 'Could not claim badge. Try again later.');
    }
  };

  // If still loading, show spinner:
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // How many badges have been claimed so far?
  const unlockedCount = Object.values(claimedStatus).filter((v) => v === true).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
      
        <Text style={styles.headerTitle}>My Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ─── TAB NAVIGATION ───────────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <TabButton title="Badges" navigation={navigation} />
        <TabButton title="Leaderboard" navigation={navigation} />
        <TabButton title="Stats" navigation={navigation} />
      </View>

      {/* ─── MAIN SCROLLABLE CONTENT ───────────────────────────────────────── */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ─── HERO SECTION (Now displays “favorite” badges) ─────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.totalBadgesContainer}>
            <View style={styles.badgeCountCircle}>
              <Text style={styles.totalBadgesNumber}>{unlockedCount}</Text>
            </View>
            <Text style={styles.totalBadgesLabel}>Badges Unlocked</Text>
            <Text style={styles.totalHoursText}>{totalHours} volunteer hours</Text>
          </View>

          {/* ─── Favorite badges appear here (up to 3) ───────────────────────── */}
          <View style={styles.featuredRow}>
            {favorites.map((favId) => {
              const info = BADGE_DEFINITIONS.find((b) => b.id === favId);
              return (
                <View key={favId} style={styles.featuredBadgeContainer}>
                  <View style={styles.featuredBadgeBorder}>
                    <Ionicons
                      name={info.icon}
                      size={32}
                      color="#FF6B35"
                    />
                  </View>
                  <Text style={styles.featuredBadgeTitle}>{info.title}</Text>
                </View>
              );
            })}
            {/*
              If fewer than 3 favorites, render placeholders
            */}
            {Array.from({ length: 3 - favorites.length }).map((_, idx) => (
              <View key={'empty-fav-' + idx} style={styles.featuredBadgeContainer}>
                <View style={styles.featuredBadgeBorder}>
                  <Ionicons
                    name="help-circle-outline"
                    size={32}
                    color="#D1D5DB"
                  />
                </View>
                <Text style={[styles.featuredBadgeTitle, { color: '#9CA3AF' }]}>
                  Favorite
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── “Your Next Badge” Section ────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.nextBadgeHeader}>
            <Text style={styles.nextBadgeTitle}>Your Next Badge</Text>
            <TouchableOpacity onPress={() => setShowAllProgress(!showAllProgress)}>
              <Text style={styles.nextBadgeSeeAll}>
                {showAllProgress ? 'Show Less' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nextBadgeList}>
            {(showAllProgress ? BADGE_DEFINITIONS : BADGE_DEFINITIONS.slice(0, 4)).map((info) => {
              const current    = totalHours;
              const target     = info.target;
              const percentage = Math.min((current / target) * 100, 100);
              const isUnlocked = current >= target;
              const isClaimed  = Boolean(claimedStatus[info.id]);
              const isFav      = favorites.includes(info.id);

              return (
                <View key={info.id}>
                  <BadgeProgressRow
                    info={info}
                    current={current}
                    target={target}
                    percentage={percentage}
                    isUnlocked={isUnlocked}
                    isClaimed={isClaimed}
                    onClaim={() => claimBadge(info.id, target)}
                    animVal={animatedValuesRef.current[info.id]}
                  />

                  {/* If the badge is claimed, show a small “heart” at top-right to toggle favorite */}
                  {isClaimed && (
                    <TouchableOpacity
                      style={styles.smallHeart}
                      onPress={() => toggleFavorite(info.id)}
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={16}
                        color={isFav ? '#EF4444' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ─── MOTIVATION SECTION ───────────────────────────────────────────── */}
        <View style={styles.motivationSection}>
          <Text style={styles.motivationTitle}>Keep Going!</Text>
          <Text style={styles.motivationText}>
            Every hour of volunteering makes a difference. You’re building a stronger community! 🌟
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── TabButton Component ─────────────────────────────────────────────────
function TabButton({ title, navigation }) {
  const route = useRoute();
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
}

// ─── A Single Badge Progress Row ─────────────────────────────────────────
function BadgeProgressRow({
  info,
  current,
  target,
  percentage,
  isUnlocked,
  isClaimed,
  onClaim,
  animVal,
}) {
  return (
    <Animated.View
      style={[
        styles.progressRow,
        {
          transform: [
            {
              scale: animVal.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02],
              }),
            },
          ],
        },
      ]}
    >
      {/* Left: Icon + circular progress ring */}
      <View
        style={[
          styles.rowIconWrapper,
          isClaimed
            ? styles.rowIconClaimed
            : isUnlocked
            ? styles.rowIconReady
            : styles.rowIconLocked,
        ]}
      >
        <Ionicons
          name={info.icon}
          size={24}
          color={isClaimed ? '#FFFFFF' : isUnlocked ? '#FF6B35' : '#9CA3AF'}
        />
        <ProgressRing percentage={percentage} size={70} strokeWidth={4} />
      </View>

      {/* Middle: Title / status text / small progress bar */}
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowBadgeTitle}>{info.title}</Text>
        <Text style={styles.rowBadgeSubtitle}>
          {current >= target
            ? 'Ready to Claim!'
            : `${Math.ceil(target - current)} hours to go`}
        </Text>
        <View style={styles.smallProgressBar}>
          <View style={[styles.smallProgressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.rowProgressNumbers}>
          {`${Math.floor(current)} / ${target} hrs`}
        </Text>
      </View>

      {/* Right: either “Claim” button if unlocked but not claimed,
           ✔️ if claimed, or lock icon if still locked */}
      <View style={styles.rowButtonWrapper}>
        {isClaimed ? (
          <View style={styles.rowBadgeClaimedCheck}>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </View>
        ) : isUnlocked ? (
          <TouchableOpacity style={styles.rowClaimButton} onPress={onClaim}>
            <Text style={styles.rowClaimButtonText}>Claim</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rowBadgeLockedIcon}>
            <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Circular Progress Ring ───────────────────────────────────────────
function ProgressRing({ percentage, size = 70, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FF6B35"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Container ───────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // white background everywhere
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── HEADER ─────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    
  },

  // ── TAB NAVIGATION ─────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    minWidth: 100,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#000000',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // ── HERO SECTION ───────────────────────────────────────────────────
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalBadgesContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeCountCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  totalBadgesNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalBadgesLabel: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 4,
  },
  totalHoursText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featuredBadgeContainer: {
    alignItems: 'center',
    width: (width - 80) / 3, // three equal columns with some margin
  },
  featuredBadgeBorder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featuredBadgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  // ── “Your Next Badge” Section ───────────────────────────────────────
  sectionContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  nextBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextBadgeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  nextBadgeSeeAll: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  nextBadgeList: {
    // stacked vertically
  },

  // ── Badge Progress Row ──────────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
  },
  rowIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  rowIconClaimed: {
    backgroundColor: '#FF6B35',
  },
  rowIconReady: {
    backgroundColor: '#FFF1F0', // very light orange tint
  },
  rowIconLocked: {
    backgroundColor: '#F9FAFB',
  },
  rowTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  rowBadgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  rowBadgeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  smallProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  smallProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  rowProgressNumbers: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  rowButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowClaimButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rowClaimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rowBadgeClaimedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981', // green check circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadgeLockedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── SMALL HEART ICON NEXT TO A PROGRESS ROW ─────────────────────────
  smallHeart: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },

  // ── MOTIVATION SECTION ─────────────────────────────────────────────
  motivationSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Bottom Padding ─────────────────────────────────────────────────
  bottomPadding: {
    height: 80,
  },
});
