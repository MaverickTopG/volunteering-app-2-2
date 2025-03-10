import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Colors and thickness constants
const BLACK = '#000';
const BRONZE = '#cd7f32';
const SILVER = '#c0c0c0';
const GOLD = '#FFD700';
const BACKGROUND = '#fff6e7';
const ORIGINAL_THICKNESS = 20;

// Base diameters for original UI (all the same => no gap)
const baseSize = scale(200); // black ring
const blackSize = baseSize;  // black ring
// We’ll also define expansions for the “expanded UI”:
const bronzeSize = baseSize + ORIGINAL_THICKNESS;
const silverSize = bronzeSize + ORIGINAL_THICKNESS;
const goldSize   = silverSize + ORIGINAL_THICKNESS;

export default function VolunteerLogs() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation();

  // Data states
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  // Weekly goal
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [goalSetTime, setGoalSetTime] = useState(Date.now());
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  // Expanded UI
  const [expanded, setExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const [showExpandedUI, setShowExpandedUI] = useState(false);

  // Modals
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [addHoursModal, setAddHoursModal] = useState(false);

  // "Log Hours" fields
  const [newHours, setNewHours] = useState('');
  const [newSite, setNewSite] = useState('');

  // Fade animations
  const logsOpacity = useRef(new Animated.Value(1)).current;
  const expandedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      fetchLogs();
    }
  }, [user]);

  // Auto-reset weekly goal after 1 week
  useEffect(() => {
    const now = Date.now();
    if (now - goalSetTime >= ONE_WEEK_MS) {
      setTotalHours(0);
      setGoalSetTime(Date.now());
      Alert.alert('Weekly Goal Reset', 'A new week has started. Your goal has been reset!');
    }
  }, [goalSetTime]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'volunteer_logs'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const logsData = [];
      let total = 0;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logsData.push({ id: docSnap.id, ...data });
        total += data.hours_contributed;
      });
      setLogs(logsData);
      setTotalHours(total);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Log hours
  const handleSaveHours = async () => {
    if (!newHours || !newSite) {
      Alert.alert('Error', 'Please fill both site and hours');
      return;
    }
    try {
      await addDoc(collection(db, 'volunteer_logs'), {
        user_id: user.uid,
        site: newSite,
        hours_contributed: parseFloat(newHours),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
      setAddHoursModal(false);
      setNewHours('');
      setNewSite('');
      fetchLogs();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Fractions for black, bronze, silver, gold
  const fractionBlack = Math.min(totalHours / weeklyGoal, 1);
  const fractionBronze = totalHours > weeklyGoal
    ? Math.min((totalHours - weeklyGoal) / weeklyGoal, 1)
    : 0;
  const fractionSilver = totalHours > 2 * weeklyGoal
    ? Math.min((totalHours - 2 * weeklyGoal) / weeklyGoal, 1)
    : 0;
  const fractionGold = totalHours > 3 * weeklyGoal
    ? Math.min((totalHours - 3 * weeklyGoal) / weeklyGoal, 1)
    : 0;

  // Toggle expanded UI
  const handleCirclePress = () => {
    if (expanded) {
      // collapse
      Animated.timing(expandedOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowExpandedUI(false));
      fadeInLogs();
    } else {
      // expand
      fadeOutLogs();
      setShowExpandedUI(true);
      Animated.timing(expandedOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    setExpanded(!expanded);
  };

  const fadeOutLogs = () => {
    Animated.timing(logsOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start(() => setShowLogs(false));
  };

  const fadeInLogs = () => {
    setShowLogs(true);
    Animated.timing(logsOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  };

  // Weekly goal settings
  const handleSettingsPress = () => {
    setTempGoal(String(weeklyGoal));
    setShowGoalModal(true);
  };

  const saveNewGoal = () => {
    const val = parseFloat(tempGoal);
    if (!val || val < 0) {
      Alert.alert('Invalid goal', 'Please enter a valid number.');
      return;
    }
    setWeeklyGoal(val);
    setGoalSetTime(Date.now());
    setShowGoalModal(false);
  };

  // Show all logs
  const handleShowAllLogs = () => {
    setShowLogsModal(true);
  };

  // Sign out
  const handleSignOut = () => {
    signOut();
    navigation.navigate('NexoLink');
  };

  // Render each log
  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>Site: {item.site}</Text>
      <Text style={styles.logText}>Hours: {item.hours_contributed}</Text>
      <Text style={styles.logText}>Date: {item.date}</Text>
      <Text style={styles.logText}>Time: {item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Weekly Goal Modal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.goalModal}>
            <Text style={styles.modalTitle}>Set Weekly Goal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter weekly goal"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={tempGoal}
              onChangeText={setTempGoal}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: BLACK }]} onPress={saveNewGoal}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Show All Logs Modal */}
      <Modal visible={showLogsModal} transparent animationType="slide">
        <View style={styles.logsModalOverlay}>
          <View style={styles.logsModal}>
            <Text style={styles.modalTitle}>All Volunteer Logs</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#000" style={{ marginVertical: verticalScale(20) }} />
            ) : logs.length === 0 ? (
              <Text style={styles.noLogsText}>No logs yet.</Text>
            ) : (
              <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                renderItem={renderLogItem}
                style={styles.allLogsList}
                showsVerticalScrollIndicator={false}
              />
            )}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: BLACK, marginTop: verticalScale(15) }]}
              onPress={() => {
                setShowLogsModal(false);
                setAddHoursModal(true);
              }}
            >
              <Text style={styles.modalButtonText}>Log Hours</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'gray', marginTop: verticalScale(10) }]}
              onPress={() => setShowLogsModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Hours Modal */}
      <Modal visible={addHoursModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addHoursModal}>
            <Text style={styles.modalTitle}>Log Hours</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Site name"
              placeholderTextColor="#aaa"
              value={newSite}
              onChangeText={setNewSite}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hours"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={newHours}
              onChangeText={setNewHours}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: BLACK }]} onPress={handleSaveHours}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => setAddHoursModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expanded UI Overlay */}
      {showExpandedUI && (
        <Animated.View style={[styles.expandedOverlay, { opacity: expandedOpacity }]}>
          {/* Large circle with stacked rings */}
          <View style={styles.expandedCircleContainer}>
            {/* Black ring */}
            <Progress.Circle
              size={scale(350)}
              progress={fractionBlack}
              thickness={30}
              color={BLACK}
              unfilledColor="transparent"
              borderWidth={0}
              strokeCap="round"
              rotation={270}
              style={styles.absoluteCircle}
            />
            {/* Bronze ring */}
            {fractionBronze > 0 && (
              <Progress.Circle
                size={scale(350) + 2 * (30 / 4)}
                progress={fractionBronze}
                thickness={30 / 4}
                color={BRONZE}
                unfilledColor="transparent"
                borderWidth={0}
                strokeCap="round"
                rotation={270}
                style={styles.absoluteCircle}
              />
            )}
            {/* Silver ring */}
            {fractionSilver > 0 && (
              <Progress.Circle
                size={scale(350) + 2 * (30 / 4) * 2}
                progress={fractionSilver}
                thickness={30 / 4}
                color={SILVER}
                unfilledColor="transparent"
                borderWidth={0}
                strokeCap="round"
                rotation={270}
                style={styles.absoluteCircle}
              />
            )}
            {/* Gold ring */}
            {fractionGold > 0 && (
              <Progress.Circle
                size={scale(350) + 2 * (30 / 4) * 3}
                progress={fractionGold}
                thickness={30 / 4}
                color={GOLD}
                unfilledColor="transparent"
                borderWidth={0}
                strokeCap="round"
                rotation={270}
                style={styles.absoluteCircle}
              />
            )}
            <View style={styles.centerExpanded}>
              <Text style={styles.expandedHours}>{totalHours}</Text>
              <Text style={styles.expandedLabel}>hours</Text>
              <Text style={styles.motivationText}>Keep It Up!</Text>
              <Text style={styles.expandedGoalText}>Weekly Goal: {weeklyGoal} hrs</Text>
            </View>
          </View>

          {/* Top-right container: settings + sign out side by side */}
          <View style={styles.expandedTopIconsContainer}>
            {/* Settings icon */}
            <TouchableOpacity style={styles.expandedIconButton} onPress={handleSettingsPress}>
              <Ionicons name="settings-outline" size={scale(24)} color="black" />
            </TouchableOpacity>
            {/* Sign out icon */}
            <TouchableOpacity style={[styles.expandedIconButton, { marginLeft: scale(15) }]} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={scale(24)} color="black" />
            </TouchableOpacity>
          </View>

          {/* Bottom-right: revert UI button */}
          <View style={styles.expandedBottomContainer}>
            <TouchableOpacity
              style={styles.expandedButton}
              onPress={() => {
                setShowExpandedUI(false);
                setExpanded(false);
                fadeInLogs();
              }}
            >
              <Text style={styles.expandedButtonText}>Revert UI</Text>
            </TouchableOpacity>
          </View>

          {/* "Show All Logs" button (center bottom) */}
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: BLACK, marginTop: verticalScale(20) }]}
            onPress={handleShowAllLogs}
          >
            <Text style={styles.modalButtonText}>Show All Logs</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Header (original UI) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Goal: {weeklyGoal} hrs</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleSettingsPress} style={{ marginRight: scale(20) }}>
            <Ionicons name="settings-outline" size={scale(24)} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={scale(24)} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Original UI Circle */}
      <View style={styles.circleWrapper}>
        {/* Black ring */}
        <Progress.Circle
          size={blackSize}
          progress={fractionBlack}
          thickness={ORIGINAL_THICKNESS}
          color={BLACK}
          unfilledColor="transparent"
          borderWidth={0}
          strokeCap="round"
          rotation={270}
          style={styles.absoluteCircle}
        />
        {/* Bronze ring (no gap => same size) */}
        {fractionBronze > 0 && (
          <Progress.Circle
            size={blackSize}
            progress={fractionBronze}
            thickness={ORIGINAL_THICKNESS / 4}
            color={BRONZE}
            unfilledColor="transparent"
            borderWidth={0}
            strokeCap="round"
            rotation={270}
            style={styles.absoluteCircle}
          />
        )}
        {/* Silver ring */}
        {fractionSilver > 0 && (
          <Progress.Circle
            size={blackSize}
            progress={fractionSilver}
            thickness={ORIGINAL_THICKNESS / 4}
            color={SILVER}
            unfilledColor="transparent"
            borderWidth={0}
            strokeCap="round"
            rotation={270}
            style={styles.absoluteCircle}
          />
        )}
        {/* Gold ring */}
        {fractionGold > 0 && (
          <Progress.Circle
            size={blackSize}
            progress={fractionGold}
            thickness={ORIGINAL_THICKNESS / 4}
            color={GOLD}
            unfilledColor="transparent"
            borderWidth={0}
            strokeCap="round"
            rotation={270}
            style={styles.absoluteCircle}
          />
        )}
        <View style={styles.centerHoursContainer} pointerEvents="none">
          <Text style={styles.centerHours}>{totalHours}</Text>
          <Text style={styles.centerLabel}>hours</Text>
        </View>
        {/* Press area toggles expanded UI */}
        <TouchableOpacity style={styles.circlePressArea} onPress={handleCirclePress} />
      </View>

      {/* Logs list */}
      {showLogs && (
        <Animated.View style={[styles.logsContainer, { opacity: logsOpacity }]}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
          ) : logs.length === 0 ? (
            <View style={styles.noLogsContainer}>
              <Text style={styles.noLogsText}>Time to start racking those points up!</Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.logItem}>
                  <Text style={styles.logText}>Site: {item.site}</Text>
                  <Text style={styles.logText}>Hours: {item.hours_contributed}</Text>
                  <Text style={styles.logText}>Date: {item.date}</Text>
                  <Text style={styles.logText}>Time: {item.time}</Text>
                </View>
              )}
              contentContainerStyle={styles.logsListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      )}

      {/* Log Hours button */}
      <TouchableOpacity style={styles.logHoursButton} onPress={() => setAddHoursModal(true)}>
        <Text style={styles.logHoursButtonText}>Log Hours</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    backgroundColor: BACKGROUND,
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#000',
  },
  circleWrapper: {
    alignSelf: 'center',
    marginTop: verticalScale(10),
    width: blackSize,
    height: blackSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteCircle: {
    position: 'absolute',
  },
  centerHoursContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHours: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#000',
  },
  centerLabel: {
    fontSize: scale(14),
    color: '#333',
  },
  circlePressArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logsContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },
  logsListContent: {
    paddingBottom: verticalScale(80),
  },
  noLogsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLogsText: {
    fontSize: scale(16),
    color: '#aaa',
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: BACKGROUND,
    borderRadius: scale(20),
    marginVertical: verticalScale(5),
    padding: scale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
  },
  logText: {
    fontSize: scale(14),
    color: '#000',
  },
  logHoursButton: {
    position: 'absolute',
    bottom: verticalScale(20),
    right: scale(20),
    backgroundColor: BLACK,
    borderRadius: scale(20),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    zIndex: 10,
  },
  logHoursButtonText: {
    color: BACKGROUND,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  // Expanded UI overlay
  expandedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  expandedCircleContainer: {
    width: scale(350),
    height: scale(350),
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerExpanded: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedHours: {
    fontSize: scale(32),
    fontWeight: 'bold',
    color: '#000',
  },
  expandedLabel: {
    fontSize: scale(18),
    color: '#333',
    marginTop: verticalScale(5),
  },
  motivationText: {
    fontSize: scale(16),
    color: '#000',
    marginTop: verticalScale(10),
  },
  expandedGoalText: {
    fontSize: scale(14),
    color: '#333',
    marginTop: verticalScale(5),
  },

  // Top-right container for settings + sign out side by side
  expandedTopIconsContainer: {
    position: 'absolute',
    top: verticalScale(0),
    right: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedIconButton: {
    backgroundColor: '#fff6e7',
    borderRadius: scale(20),
    padding: scale(10),
  },

  // Bottom-right container for Revert UI
  expandedBottomContainer: {
    position: 'absolute',
    bottom: verticalScale(90),
    right: scale(20),
  },
  expandedButton: {
    backgroundColor: '#000',
    borderRadius: scale(15),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    marginVertical: verticalScale(5),
  },
  expandedButtonText: {
    color: BACKGROUND,
    fontSize: scale(14),
    fontWeight: 'bold',
  },

  // Modal overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  logsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(10),
  },
  goalModal: {
    width: '90%',
    backgroundColor: BACKGROUND,
    borderRadius: scale(20),
    padding: scale(30),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },
  modalInput: {
    height: verticalScale(45),
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: scale(15),
    paddingHorizontal: scale(15),
    fontSize: scale(16),
    backgroundColor: BACKGROUND,
    color: '#000',
    width: '100%',
    marginBottom: verticalScale(10),
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    borderRadius: scale(15),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
  },
  modalButtonText: {
    color: BACKGROUND,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  logsModal: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: BACKGROUND,
    borderRadius: scale(20),
    padding: scale(30),
    alignItems: 'center',
  },
  allLogsList: {
    width: '100%',
    maxHeight: verticalScale(350),
    marginTop: verticalScale(10),
  },
  addHoursModal: {
    width: '90%',
    backgroundColor: BACKGROUND,
    borderRadius: scale(20),
    padding: scale(30),
    alignItems: 'center',
  },
});
