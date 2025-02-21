import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../auth/AuthContext'; // Adjust the path to your AuthContext
import { db } from '../../auth/firebase'; // Import Firestore db
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Define baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const VolunteerLogs = () => {
  const { user, signOut } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHours, setNewHours] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [customSite, setCustomSite] = useState('');
  const [isCustomSite, setIsCustomSite] = useState(false);
  const navigation = useNavigation();

  const sites = [
    'Hooves for Harmony',
    'WILDCARE',
    'The Little Red Dog',
    'Hanaeleh Horse Rescue',
    'Grateful Gatherings Marin',
    'RAD Camp',
    'Mission Hospital',
    'Larkspur Library',
    'The Book Exchange',
    'Marin County Parks & Landscape',
    'Mill Valley Public Works',
    'Slide Ranch',
  ];

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      fetchVolunteerLogs();
    }
  }, [user]);

  const fetchVolunteerLogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'volunteer_logs'),
        where('user_id', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const logsData = [];
      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logsData.push({ id: doc.id, ...data });
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

  const handleAddLog = async () => {
    if (!newHours || (!selectedSite && !customSite)) {
      Alert.alert('Please fill all fields.');
      return;
    }

    const siteName = isCustomSite ? customSite : selectedSite;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    try {
      await addDoc(collection(db, 'volunteer_logs'), {
        user_id: user.uid,
        hours_contributed: parseFloat(newHours),
        site: siteName,
        date: formattedDate,
        time: formattedTime,
        timestamp: currentDate.toISOString(),
      });
      fetchVolunteerLogs();
      setShowModal(false);
      setNewHours('');
      setSelectedSite('');
      setCustomSite('');
      setIsCustomSite(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigation.navigate('NexoLink'); // Redirect after sign out
  };

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
      {/* Floating Header */}
      <View style={styles.header}>
        <Text style={styles.totalHoursText}>
          Total Hours: {totalHours} hrs
        </Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={scale(24)} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      ) : logs.length === 0 ? (
        <View style={styles.noLogsContainer}>
          <Text style={styles.noLogsText}>
            Time to start racking those points up!
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.logsContainer}
          style={styles.logsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={scale(30)} color="#fff6e7" />
      </TouchableOpacity>

      {/* Modal for adding a new log */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Volunteer Log</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter hours"
              keyboardType="numeric"
              keyboardAppearance="dark"
              value={newHours}
              onChangeText={(text) => setNewHours(text)}
              placeholderTextColor="#aaa"
            />
            {!isCustomSite && (
              <TouchableOpacity
                style={styles.siteButton}
                onPress={() => setIsCustomSite(true)}
              >
                <Text style={styles.siteButtonText}>
                  {selectedSite || 'Enter a custom site'}
                </Text>
              </TouchableOpacity>
            )}
            {isCustomSite ? (
              <TextInput
                style={styles.input}
                placeholder="Enter custom site name"
                keyboardAppearance="dark"
                value={customSite}
                onChangeText={(text) => setCustomSite(text)}
                placeholderTextColor="#aaa"
              />
            ) : (
              <FlatList
                data={sites}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedSite(item)}
                    style={[
                      styles.siteItem,
                      selectedSite === item && styles.selectedSiteItem,
                    ]}
                  >
                    <Text style={styles.siteText}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.sitesList}
              />
            )}
            <TouchableOpacity style={styles.modalButton} onPress={handleAddLog}>
              <Text style={styles.modalButtonText}>Add Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowModal(false);
                setNewHours('');
                setSelectedSite('');
                setCustomSite('');
                setIsCustomSite(false);
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VolunteerLogs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    backgroundColor: '#fff6e7',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.2,
    shadowRadius: scale(2),
    elevation: 3,
    zIndex: 1,
  },
  totalHoursText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: 'black',
  },
  logsList: {
    flex: 1,
    marginTop: verticalScale(10),
  },
  logsContainer: {
    paddingBottom: verticalScale(80),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
  },
  noLogsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLogsText: {
    fontSize: scale(18),
    textAlign: 'center',
    marginTop: verticalScale(20),
    color: '#aaa',
  },
  logItem: {
    backgroundColor: '#fff6e7',
    borderRadius: scale(20),
    marginVertical: verticalScale(5),
    padding: scale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
  },
  logText: {
    fontSize: scale(16),
    color: 'black',
  },
  addButton: {
    position: 'absolute',
    bottom: verticalScale(85),
    right: scale(20),
    backgroundColor: '#000',
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(5) },
    shadowOpacity: 0.3,
    shadowRadius: scale(10),
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    marginHorizontal: scale(20),
    backgroundColor: '#fff6e7',
    borderRadius: scale(20),
    padding: scale(20),
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: 'black',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  input: {
    height: verticalScale(50),
    borderColor: '#333',
    borderWidth: scale(1),
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    backgroundColor: '#fff6e7',
    color: 'black',
    marginBottom: verticalScale(15),
  },
  siteButton: {
    height: verticalScale(50),
    justifyContent: 'center',
    backgroundColor: '#fff6e7',
    borderColor: '#333',
    borderWidth: scale(1),
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(15),
  },
  siteButtonText: {
    fontSize: scale(16),
    color: 'black',
  },
  sitesList: {
    maxHeight: verticalScale(150),
    marginBottom: verticalScale(15),
  },
  siteItem: {
    padding: scale(10),
    backgroundColor: '#fff6e7',
    borderColor: '#333',
    borderWidth: scale(1),
    borderRadius: scale(20),
    marginVertical: verticalScale(5),
  },
  selectedSiteItem: {
    backgroundColor: '#d1e7dd',
  },
  siteText: {
    fontSize: scale(16),
    color: 'black',
  },
  modalButton: {
    backgroundColor: '#000',
    padding: scale(15),
    borderRadius: scale(25),
    alignItems: 'center',
    marginVertical: verticalScale(5),
  },
  modalButtonText: {
    color: '#fff6e7',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
});
