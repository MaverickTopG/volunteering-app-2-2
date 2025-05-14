// VolunteerLogs.js
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

// <-- pull from your shop file -->
import { themePacks, seasonal } from '../screens/shop';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = size => (width  / guidelineBaseWidth)  * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// default color palette (bg, gradient1, gradient2, text)
const DEFAULT_PALETTE = [
  '#fff6e7',
  '#fff0d4',
  '#ffe8c9',
  '#333333',
];

// ring constants (unchanged)
const BLACK   = '#000';
const BRONZE  = '#cd7f32';
const SILVER  = '#c0c0c0';
const GOLD    = '#FFD700';
const ORIGINAL_THICKNESS = 20;

const baseSize = scale(200);
const blackSize = baseSize;
const expandedBlackSize   = scale(350);
const expandedBronzeSize  = expandedBlackSize + 2*(30/4);
const expandedSilverSize  = expandedBlackSize + 2*(30/4)*2;
const expandedGoldSize    = expandedBlackSize + 2*(30/4)*3;

export default function VolunteerLogs() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation();

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
  // ────────────────────────────────────────────────────────────

  // Data & loading
  const [logs,       setLogs]       = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  // Weekly goal state
  const [weeklyGoal,  setWeeklyGoal]  = useState(10);
  const [goalSetTime, setGoalSetTime] = useState(Date.now());
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal,      setTempGoal]      = useState('');

  // Log-hours modal
  const [addHoursModal, setAddHoursModal] = useState(false);
  const [newHours,      setNewHours]      = useState('');
  const [newSite,       setNewSite]       = useState('');

  // header toggle animation
  const [showWeekly, setShowWeekly] = useState(true);
  const textOpacityHeader   = useRef(new Animated.Value(1)).current;
  const textOpacityExpanded = useRef(new Animated.Value(1)).current;

  // circle blink animation
  const circleOpacity = useRef(new Animated.Value(1)).current;

  // fetch on mount / user change
  useEffect(() => {
    if (!user) navigation.navigate('Login');
    else fetchLogs();
  }, [user]);

  // reset weekly goal each week
  useEffect(() => {
    const now = Date.now();
    if (now - goalSetTime >= ONE_WEEK_MS) {
      setTotalHours(0);
      setGoalSetTime(now);
      Alert.alert('Weekly Goal Reset', 'A new week has started. Your goal has been reset!');
    }
  }, [goalSetTime]);

  // blink circle twice
  useEffect(() => {
    Animated.sequence([
      Animated.timing(circleOpacity, { toValue:0.3, duration:500, useNativeDriver:true }),
      Animated.timing(circleOpacity, { toValue:1,   duration:500, useNativeDriver:true }),
      Animated.timing(circleOpacity, { toValue:0.3, duration:500, useNativeDriver:true }),
      Animated.timing(circleOpacity, { toValue:1,   duration:500, useNativeDriver:true }),
    ]).start();
  }, []);

  // toggle header text every 5s
  useEffect(() => {
    const iv = setInterval(() => {
      Animated.timing(textOpacityHeader, { toValue:0, duration:300, useNativeDriver:true }).start(() => {
        setShowWeekly(w => !w);
        Animated.timing(textOpacityHeader, { toValue:1, duration:300, useNativeDriver:true }).start();
      });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const headerText = showWeekly
    ? `Weekly Goal: ${weeklyGoal} hrs`
    : `Total Hours: ${totalHours}`;

  // fetch from Firestore
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db,'volunteer_logs'),
        where('user_id','==',user.uid)
      );
      const snap = await getDocs(q);
      let arr = [], tot = 0;
      snap.forEach(docSnap => {
        const d = docSnap.data();
        arr.push({ id: docSnap.id, ...d });
        tot += d.hours_contributed;
      });
      setLogs(arr);
      setTotalHours(tot);
    } catch(e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // save new hours
  const handleSaveHours = async () => {
    if (!newSite||!newHours) {
      return Alert.alert('Error','Please fill both site and hours');
    }
    try {
      await addDoc(collection(db,'volunteer_logs'),{
        user_id: user.uid,
        site: newSite,
        hours_contributed: parseFloat(newHours),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
      setAddHoursModal(false);
      setNewSite('');
      setNewHours('');
      fetchLogs();
    } catch(e) {
      Alert.alert('Error', e.message);
    }
  };

  // ring fractions
  const frac = (got, goal) => goal>0?Math.min(got/goal,1):0;
  const fB = frac(totalHours, weeklyGoal);
  const fR = totalHours>weeklyGoal ? frac(totalHours-weeklyGoal, weeklyGoal) : 0;
  const fS = totalHours>2*weeklyGoal ? frac(totalHours-2*weeklyGoal, weeklyGoal) : 0;
  const fG = totalHours>3*weeklyGoal ? frac(totalHours-3*weeklyGoal, weeklyGoal) : 0;

  // settings & signout
  const openGoalModal = () => {
    setTempGoal(String(weeklyGoal));
    setShowGoalModal(true);
  };
  const saveNewGoal = () => {
    const v = parseFloat(tempGoal);
    if (!v||v<0) return Alert.alert('Invalid goal','Please enter a valid number.');
    setWeeklyGoal(v);
    setGoalSetTime(Date.now());
    setShowGoalModal(false);
  };
  const doSignOut = () => {
    signOut();
    navigation.navigate('NexoLink');
  };

  // render a single log
  const renderLogItem = ({item}) => (
    <View style={[styles.logItem,{backgroundColor:palette[0]}]}>
      <Text style={[styles.logText,{color:palette[3]}]}>Site: {item.site}</Text>
      <Text style={[styles.logText,{color:palette[3]}]}>Hours: {item.hours_contributed}</Text>
      <Text style={[styles.logText,{color:palette[3]}]}>Date: {item.date}</Text>
      <Text style={[styles.logText,{color:palette[3]}]}>Time: {item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container,{backgroundColor:palette[0]}]}>
      {/* weekly‐goal modal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.goalModal,{backgroundColor:palette[0]}]}>
            <Text style={[styles.modalTitle,{color:palette[3]}]}>
              Set Weekly Goal
            </Text>
            <TextInput
              style={[styles.modalInput,{borderColor:palette[3],color:palette[3]}]}
              placeholder="Enter weekly goal"
              placeholderTextColor={palette[3]}
              keyboardType="numeric"
              value={tempGoal}
              onChangeText={setTempGoal}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalButton,{backgroundColor:palette[3]}]}
                onPress={saveNewGoal}
              >
                <Text style={[styles.modalButtonText,{color:palette[0]}]}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton,{backgroundColor:palette[2]}]}
                onPress={()=>setShowGoalModal(false)}
              >
                <Text style={[styles.modalButtonText,{color:palette[3]}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* log‐hours modal */}
      <Modal visible={addHoursModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.goalModal,{backgroundColor:palette[0]}]}>
            <Text style={[styles.modalTitle,{color:palette[3]}]}>
              Log Hours
            </Text>
            <TextInput
              style={[styles.modalInput,{borderColor:palette[3],color:palette[3]}]}
              placeholder="Site name"
              placeholderTextColor={palette[3]}
              value={newSite} onChangeText={setNewSite}
            />
            <TextInput
              style={[styles.modalInput,{borderColor:palette[3],color:palette[3]}]}
              placeholder="Hours"
              placeholderTextColor={palette[3]}
              keyboardType="numeric"
              value={newHours} onChangeText={setNewHours}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalButton,{backgroundColor:palette[3]}]}
                onPress={handleSaveHours}
              >
                <Text style={[styles.modalButtonText,{color:palette[0]}]}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton,{backgroundColor:palette[2]}]}
                onPress={()=>setAddHoursModal(false)}
              >
                <Text style={[styles.modalButtonText,{color:palette[3]}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* header */}
      <View style={styles.header}>
        <Animated.Text style={[
          styles.headerTitle,
          { opacity: textOpacityHeader, color: palette[3] }
        ]}>
          {headerText}
        </Animated.Text>
        <View style={{ flexDirection:'row' }}>
          <TouchableOpacity onPress={openGoalModal} style={{marginRight:scale(20)}}>
            <Ionicons name="settings-outline" size={scale(24)} color={palette[3]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={doSignOut}>
            <Ionicons name="log-out-outline" size={scale(24)} color={palette[3]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* main circle */}
      <Animated.View style={[
        styles.circleWrapper,
        { opacity: circleOpacity }
      ]}>
        <Progress.Circle
          size={blackSize}
          progress={fB}
          thickness={ORIGINAL_THICKNESS}
          color={BLACK}
          unfilledColor="transparent"
          borderWidth={0}
          strokeCap="round"
          rotation={270}
          style={styles.absoluteCircle}
        />
        {fR>0 && <Progress.Circle
          size={blackSize}
          progress={fR}
          thickness={ORIGINAL_THICKNESS/4}
          color={BRONZE}
          unfilledColor="transparent"
          borderWidth={0}
          strokeCap="round"
          rotation={270}
          style={styles.absoluteCircle}
        />}
        {fS>0 && <Progress.Circle
          size={blackSize}
          progress={fS}
          thickness={ORIGINAL_THICKNESS/4}
          color={SILVER}
          unfilledColor="transparent"
          borderWidth={0}
          strokeCap="round"
          rotation={270}
          style={styles.absoluteCircle}
        />}
        {fG>0 && <Progress.Circle
          size={blackSize}
          progress={fG}
          thickness={ORIGINAL_THICKNESS/4}
          color={GOLD}
          unfilledColor="transparent"
          borderWidth={0}
          strokeCap="round"
          rotation={270}
          style={styles.absoluteCircle}
        />}
        <View style={styles.centerHoursContainer} pointerEvents="none">
          <Text style={[styles.centerHours,{color:palette[3]}]}>{totalHours}</Text>
          <Text style={[styles.centerLabel,{color:palette[3]}]}>hours</Text>
        </View>
      </Animated.View>

      {/* logs list */}
      <View style={styles.logsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={palette[3]} style={{flex:1}}/>
        ) : logs.length===0 ? (
          <View style={styles.noLogsContainer}>
            <Text style={[styles.noLogsText,{color:palette[3]}]}>
              Time to start racking those points up!
            </Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={i=>i.id}
            renderItem={renderLogItem}
            contentContainerStyle={styles.logsListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* log hours button */}
      <TouchableOpacity
        style={[styles.logHoursButton,{backgroundColor:palette[3]}]}
        onPress={()=>setAddHoursModal(true)}
      >
        <Text style={[styles.logHoursButtonText,{color:palette[0]}]}>
          Log Hours
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex:1 },
  header: {
    paddingTop:verticalScale(70),
    paddingBottom:verticalScale(10),
    paddingHorizontal:scale(20),
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    elevation:3,
    zIndex:1,
  },
  headerTitle:      { fontSize:scale(18), fontWeight:'bold' },
  circleWrapper:    {
    alignSelf:'center',
    marginTop:verticalScale(10),
    width:blackSize,
    height:blackSize,
    justifyContent:'center',
    alignItems:'center',
  },
  absoluteCircle:   { position:'absolute' },
  centerHoursContainer:{ position:'absolute', justifyContent:'center', alignItems:'center' },
  centerHours:      { fontSize:scale(22), fontWeight:'bold' },
  centerLabel:      { fontSize:scale(14), marginTop:verticalScale(2) },
  logsContainer:    { flex:1, paddingHorizontal:scale(20), marginTop:verticalScale(10) },
  logsListContent:  { paddingBottom:verticalScale(80) },
  noLogsContainer:  { flex:1, justifyContent:'center', alignItems:'center' },
  noLogsText:       { fontSize:scale(16) },
  logItem: {
    borderRadius:scale(20),
    marginVertical:verticalScale(5),
    padding:scale(15),
    elevation:2,
  },
  logText:          { fontSize:scale(14), marginBottom:verticalScale(4) },
  logHoursButton:   {
    position:'absolute',
    bottom:verticalScale(820),
    right:scale(10),
    borderRadius:scale(20),
    paddingVertical:verticalScale(10),
    paddingHorizontal:scale(15),
    zIndex:10,
  },
  logHoursButtonText:{ fontSize:scale(16), fontWeight:'bold' },

  // modals
  modalOverlay:     {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.4)',
    justifyContent:'center',
    alignItems:'center',
    padding:scale(20),
  },
  goalModal:        {
    width:'90%',
    borderRadius:scale(20),
    padding:scale(30),
    alignItems:'center',
  },
  modalTitle:       {
    fontSize:scale(20),
    fontWeight:'bold',
    marginBottom:verticalScale(15),
    textAlign:'center',
  },
  modalInput:       {
    width:'100%',
    height:verticalScale(45),
    borderWidth:1,
    borderRadius:scale(15),
    paddingHorizontal:scale(15),
    marginBottom:verticalScale(10),
  },
  modalBtnRow:      {
    flexDirection:'row',
    justifyContent:'space-around',
    width:'100%',
    marginTop:verticalScale(10),
  },
  modalButton:      {
    borderRadius:scale(15),
    paddingVertical:verticalScale(10),
    paddingHorizontal:scale(20),
  },
  modalButtonText:  { fontSize:scale(16), fontWeight:'bold', textAlign:'center' },
});
