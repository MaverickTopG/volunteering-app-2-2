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
import { BlurView } from 'expo-blur';

import { auth, db } from '../../auth/firebase';
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

// ─── Badge definitions ───────────────────────────────────────────────
const BADGE_DEFINITIONS = [
  { id: 'badge_1',  title: 'First Step',         target: 1,   icon: 'time-outline' },
  { id: 'badge_5',  title: 'Committed',          target: 5,   icon: 'flash-outline' },
  { id: 'badge_10', title: 'Champion',           target: 10,  icon: 'trophy-outline' },
  { id: 'badge_15', title: 'Hero',               target: 15,  icon: 'medal-outline' },
  { id: 'badge_20', title: 'Superstar',          target: 20,  icon: 'star-outline' },
  { id: 'badge_25', title: 'Legend',             target: 25,  icon: 'ribbon-outline' },
  { id: 'badge_30', title: 'Guardian',           target: 30,  icon: 'heart-outline' },
  { id: 'badge_40', title: 'Community Leader',   target: 40,  icon: 'people-outline' },
  { id: 'badge_50', title: 'Diamond Volunteer',  target: 50,  icon: 'diamond-outline' },
  { id: 'badge_75', title: 'Master Volunteer',   target: 75,  icon: 'checkmark-circle-outline' },
];
const BADGE_IDS = BADGE_DEFINITIONS.map((b) => b.id);

// Firestore doc IDs:
const CLAIMED_DOC_ID   = 'status'; // users/{uid}/claimedBadges/status
const FAVORITES_DOC_ID = 'list';   // users/{uid}/favorites/list

export default function VolunteerBadgesScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // ─── Auth & loading ─────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── Badge state ────────────────────────────────────────────────────
  const [totalHours, setTotalHours]       = useState(0);
  const [claimedStatus, setClaimedStatus] = useState({}); // { badge_1: boolean, … }
  const [favorites, setFavorites]         = useState([]); // up to 3 badge IDs
  const [loading, setLoading]             = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Animated "pulse" for each badge
  const animatedValuesRef = useRef({});
  useEffect(() => {
    const vals = {};
    BADGE_IDS.forEach(id => {
      vals[id] = new Animated.Value(0);
    });
    animatedValuesRef.current = vals;
  }, []);

  // ─── On login, load data ────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) {
      // reset state if logged out
      setTotalHours(0);
      const emptyMap = {};
      BADGE_IDS.forEach(id => (emptyMap[id] = false));
      setClaimedStatus(emptyMap);
      setFavorites([]);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      await loadTotalHours(authUser.uid);
      await loadClaimedStatus(authUser.uid);
      await loadFavorites(authUser.uid);
      setLoading(false);
    };
    loadData();
  }, [authUser]);

  // ─── Load total volunteer hours ─────────────────────────────────────
  const loadTotalHours = async uid => {
    try {
      const logsRef = collection(db, 'volunteer_logs');
      const q = query(logsRef, where('user_id', '==', uid));
      const snap = await getDocs(q);
      let sum = 0;
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const hrs = parseFloat(data.hours_contributed) || 0;
        sum += hrs;
      });
      setTotalHours(sum);
    } catch (e) {
      console.error('loadTotalHours error:', e);
      Alert.alert('Error', 'Could not load volunteer hours.');
      setTotalHours(0);
    }
  };

  // ─── Load or initialize claimed badges ───────────────────────────────
  const loadClaimedStatus = async uid => {
    try {
      const ref = doc(db, 'users', uid, 'claimedBadges', CLAIMED_DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setClaimedStatus(snap.data());
      } else {
        const initMap = {};
        BADGE_IDS.forEach(id => (initMap[id] = false));
        await setDoc(ref, initMap);
        setClaimedStatus(initMap);
      }
    } catch (e) {
      console.error('loadClaimedStatus error:', e);
      Alert.alert('Error', 'Could not load claimed badges.');
      const fallback = {};
      BADGE_IDS.forEach(id => (fallback[id] = false));
      setClaimedStatus(fallback);
    }
  };

  // ─── Load or initialize favorites ────────────────────────────────────
  const loadFavorites = async uid => {
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
      console.error('loadFavorites error:', e);
      Alert.alert('Error', 'Could not load favorite badges.');
      setFavorites([]);
    }
  };

  // ─── Toggle favorite badge ──────────────────────────────────────────
  const toggleFavorite = async badgeId => {
    if (!claimedStatus[badgeId]) {
      Alert.alert('Locked', 'You must claim this badge before favoriting.');
      return;
    }
    let newList = [...favorites];
    if (newList.includes(badgeId)) {
      newList = newList.filter(id => id !== badgeId);
    } else {
      if (newList.length >= 3) {
        Alert.alert('Max Favorites', 'Can only favorite up to 3 badges.');
        return;
      }
      newList.push(badgeId);
    }
    setFavorites(newList);
    try {
      await updateDoc(
        doc(db, 'users', authUser.uid, 'favorites', FAVORITES_DOC_ID),
        { list: newList }
      );
    } catch (e) {
      console.error('toggleFavorite error:', e);
    }
  };

  // ─── Claim a badge ──────────────────────────────────────────────────
  const claimBadge = async (badgeId, target) => {
    if (totalHours < target) {
      Alert.alert('Not Ready', `You need ${target} hours to unlock this badge.`);
      return;
    }
    // Pulse animation
    const animVal = animatedValuesRef.current[badgeId];
    if (animVal) {
      Animated.sequence([
        Animated.timing(animVal, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(animVal, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
    // Update Firestore
    try {
      await updateDoc(
        doc(db, 'users', authUser.uid, 'claimedBadges', CLAIMED_DOC_ID),
        { [badgeId]: true }
      );
      setClaimedStatus(prev => ({ ...prev, [badgeId]: true }));
      Alert.alert('Badge Claimed!', 'Congratulations on unlocking a new badge!');
    } catch (e) {
      console.error('claimBadge error:', e);
      Alert.alert('Error', 'Could not claim badge. Try again later.');
    }
  };

  // Helper to check if a given route is active
  const isActiveRoute = (routeName) => route.name === routeName;

  // ─── Demo Background Content Component ──────────────────────────────
  const DemoBackgroundContent = () => (
    <>
      {/* HERO SECTION */}
      <View style={styles.heroSection}>
        <View style={styles.totalBadgesContainer}>
          <View style={styles.badgeCountCircle}>
            <Text style={styles.totalBadgesNumber}>0</Text>
          </View>
          <Text style={styles.totalBadgesLabel}>Badges Unlocked</Text>
          <Text style={styles.totalHoursText}>0 volunteer hours</Text>
        </View>

        <View style={styles.featuredRow}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <View key={'demo-fav-' + idx} style={styles.featuredBadgeContainer}>
              <View style={styles.featuredBadgeBorder}>
                <Ionicons name="help-circle-outline" size={32} color="#D1D5DB" />
              </View>
              <Text style={[styles.featuredBadgeTitle, { color: '#9CA3AF' }]}>
                Favorite
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* "Your Next Badge" */}
      <View style={styles.sectionContainer}>
        <View style={styles.nextBadgeHeader}>
          <Text style={styles.nextBadgeTitle}>Your Next Badge</Text>
          <Text style={styles.nextBadgeSeeAll}>See All</Text>
        </View>

        <View style={styles.nextBadgeList}>
          {BADGE_DEFINITIONS.slice(0, 4).map(info => (
            <View key={info.id}>
              <View style={styles.progressRow}>
                <View style={[styles.rowIconWrapper, styles.rowIconLocked]}>
                  <Ionicons name={info.icon} size={24} color="#9CA3AF" />
                  <ProgressRing percentage={0} size={70} strokeWidth={4} />
                </View>

                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowBadgeTitle}>{info.title}</Text>
                  <Text style={styles.rowBadgeSubtitle}>
                    {`${info.target} hours to go`}
                  </Text>
                  <View style={styles.smallProgressBar}>
                    <View style={[styles.smallProgressFill, { width: '0%' }]} />
                  </View>
                  <Text style={styles.rowProgressNumbers}>
                    {`0 / ${info.target} hrs`}
                  </Text>
                </View>

                <View style={styles.rowButtonWrapper}>
                  <View style={styles.rowBadgeLockedIcon}>
                    <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* MOTIVATION */}
      <View style={styles.motivationSection}>
        <Text style={styles.motivationTitle}>Keep Going!</Text>
        <Text style={styles.motivationText}>
          Every hour of volunteering makes a difference. You're building a stronger community! 🌟
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </>
  );

  // ─── If checking auth, show loader ───────────────────────────────────
  if (checkingAuth) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // ─── Main return ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>My Badges</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── TWO BUTTONS SIDE BY SIDE ─────────────────────────────────────── */}
      <View style={styles.buttonRow}>
        {/* Badges Button */}
        <TouchableOpacity
          style={[
            styles.singleButton,
            isActiveRoute('Badges') && styles.activeButton,
          ]}
          onPress={() => {
            if (!isActiveRoute('Badges')) {
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

      {/* ── CONTENT AREA ─────────────────────────────────────────────────── */}
      {authUser ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={[styles.container, styles.centerContent]}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          ) : (
            <>
              {/* HERO SECTION */}
              <View style={styles.heroSection}>
                <View style={styles.totalBadgesContainer}>
                  <View style={styles.badgeCountCircle}>
                    <Text style={styles.totalBadgesNumber}>
                      {Object.values(claimedStatus).filter(v => v).length}
                    </Text>
                  </View>
                  <Text style={styles.totalBadgesLabel}>Badges Unlocked</Text>
                  <Text style={styles.totalHoursText}>
                    {totalHours} volunteer hours
                  </Text>
                </View>

                <View style={styles.featuredRow}>
                  {favorites.map(favId => {
                    const info = BADGE_DEFINITIONS.find(b => b.id === favId);
                    return (
                      <View key={favId} style={styles.featuredBadgeContainer}>
                        <View style={styles.featuredBadgeBorder}>
                          <Ionicons name={info.icon} size={32} color="#FF6B35" />
                        </View>
                        <Text style={styles.featuredBadgeTitle}>{info.title}</Text>
                      </View>
                    );
                  })}
                  {Array.from({ length: 3 - favorites.length }).map((_, idx) => (
                    <View
                      key={'empty-fav-' + idx}
                      style={styles.featuredBadgeContainer}
                    >
                      <View style={styles.featuredBadgeBorder}>
                        <Ionicons
                          name="help-circle-outline"
                          size={32}
                          color="#D1D5DB"
                        />
                      </View>
                      <Text
                        style={[styles.featuredBadgeTitle, { color: '#9CA3AF' }]}
                      >
                        Favorite
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* "Your Next Badge" */}
              <View style={styles.sectionContainer}>
                <View style={styles.nextBadgeHeader}>
                  <Text style={styles.nextBadgeTitle}>Your Next Badge</Text>
                  <TouchableOpacity
                    onPress={() => setShowAllProgress(!showAllProgress)}
                  >
                    <Text style={styles.nextBadgeSeeAll}>
                      {showAllProgress ? 'Show Less' : 'See All'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.nextBadgeList}>
                  {(showAllProgress
                    ? BADGE_DEFINITIONS
                    : BADGE_DEFINITIONS.slice(0, 4)
                  ).map(info => {
                    const percentage = Math.min((totalHours / info.target) * 100, 100);
                    const isUnlocked = totalHours >= info.target;
                    const isClaimed = Boolean(claimedStatus[info.id]);
                    const isFav = favorites.includes(info.id);

                    return (
                      <View key={info.id}>
                        <BadgeProgressRow
                          info={info}
                          current={totalHours}
                          target={info.target}
                          percentage={percentage}
                          isUnlocked={isUnlocked}
                          isClaimed={isClaimed}
                          onClaim={() => claimBadge(info.id, info.target)}
                          animVal={animatedValuesRef.current[info.id]}
                        />
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

              {/* MOTIVATION */}
              <View style={styles.motivationSection}>
                <Text style={styles.motivationTitle}>Keep Going!</Text>
                <Text style={styles.motivationText}>
                  Every hour of volunteering makes a difference. You're building
                  a stronger community! 🌟
                </Text>
              </View>

              <View style={styles.bottomPadding} />
            </>
          )}
        </ScrollView>
      ) : (
        // ── Background UI with Blur Overlay for Not Logged In ──────────
        <View style={styles.container}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <DemoBackgroundContent />
          </ScrollView>
          
          {/* Blur Overlay */}
          <BlurView intensity={80} tint="light" style={styles.blurOverlay}>
            <View style={styles.loginPromptContainer}>
              <View style={styles.loginIconContainer}>
                <Ionicons name="ribbon-outline" size={80} color="#FF6B35" />
              </View>
              <Text style={styles.loginPromptTitle}>Login to Access Badges</Text>
              <Text style={styles.loginPromptSubtitle}>
                Flaunt your volunteering skills with amazing badges!
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  // Navigate to login screen or show login modal
                  // You can customize this based on your app's navigation structure
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.loginButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Badge Row Component ───────────────────────────────────────────────
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

      <View style={styles.rowTextContainer}>
        <Text style={styles.rowBadgeTitle}>{info.title}</Text>
        <Text style={styles.rowBadgeSubtitle}>
          {current >= target
            ? 'Ready to Claim!'
            : `${Math.ceil(target - current)} hours to go`}
        </Text>
        <View style={styles.smallProgressBar}>
          <View
            style={[styles.smallProgressFill, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={styles.rowProgressNumbers}>
          {`${Math.floor(current)} / ${target} hrs`}
        </Text>
      </View>

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
}const styles = StyleSheet.create({
  // ── Container ───────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },

  // ── TWO-BUTTON ROW ─────────────────────────────────────────────────
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

  // ── CONTENT ────────────────────────────────────────────────────────
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    width: '30%', // Approximation of (width - 80) / 3
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

  // ── "Your Next Badge" Section ───────────────────────────────────────
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
    // Empty style object as placeholder
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
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  rowIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  rowIconLocked: {
    backgroundColor: '#F3F4F6',
  },
  rowIconReady: {
    backgroundColor: '#FEF3E2',
  },
  rowIconClaimed: {
    backgroundColor: '#FF6B35',
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
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  smallProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
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
    backgroundColor: '#10B981',
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
  smallHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // ── MOTIVATION SECTION ─────────────────────────────────────────────
  motivationSection: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── BLUR OVERLAY & LOGIN PROMPT ────────────────────────────────────
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loginPromptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loginIconContainer: {
    marginBottom: 24,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginPromptSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── BOTTOM PADDING ─────────────────────────────────────────────────
  bottomPadding: {
    height: 80,
  },
});