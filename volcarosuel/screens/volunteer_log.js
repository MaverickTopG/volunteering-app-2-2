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
} from 'react-native';
import { AuthContext } from '../../auth/AuthContext'; // Adjust the path to your AuthContext
import { db } from '../../auth/firebase'; // Import Firestore db
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importing Ionicons for icons
import { useNavigation } from '@react-navigation/native';

const VolunteerLogs = () => {
  const { user, signOut } = useContext(AuthContext); // Get current authenticated user and signOut function
  const [logs, setLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0); // State to store cumulative hours
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHours, setNewHours] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [customSite, setCustomSite] = useState(''); // For custom site input
  const [isCustomSite, setIsCustomSite] = useState(false); // Track if using custom site
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
      // If user is not authenticated, redirect to Login screen
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
        where('user_id', '==', user.uid) // Query logs for the current user
      );
      const querySnapshot = await getDocs(q);
      const logsData = [];
      let total = 0; // Initialize cumulative total

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logsData.push({ id: doc.id, ...data });
        total += data.hours_contributed; // Accumulate hours
      });

      setLogs(logsData);
      setTotalHours(total); // Update the total hours state
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
      fetchVolunteerLogs(); // Refresh logs after adding a new entry
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
    navigation.navigate('NexoLink'); // Redirect to NexoLink (AnimalTabNavigator) after signing out
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
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      ) : logs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.noLogsText}>Time to start racking those points up!</Text>
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
        <Ionicons name="add" size={30} color="#fff6e7" />
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
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 3,
    zIndex: 1,
  },
  totalHoursText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  logsList: {
    flex: 1,
    marginTop: 10, // To provide space below the header
  },
  logsContainer: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  noLogsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
  logItem: {
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    marginVertical: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logText: {
    fontSize: 16,
    color: 'black',
  },
  addButton: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff6e7',
    color: 'black',
    marginBottom: 15,
  },
  siteButton: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#fff6e7',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  siteButtonText: {
    fontSize: 16,
    color: 'black',
  },
  sitesList: {
    maxHeight: 150,
    marginBottom: 15,
  },
  siteItem: {
    padding: 10,
    backgroundColor: '#fff6e7',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 5,
  },
  selectedSiteItem: {
    backgroundColor: '#d1e7dd',
  },
  siteText: {
    fontSize: 16,
    color: 'black',
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalButtonText: {
    color: '#fff6e7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
});
