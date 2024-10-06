import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { AuthContext } from '../auth/AuthContext';  // Adjust the path to your AuthContext
import { db } from '../auth/firebase';  // Import Firestore db
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const VolunteerLogs = () => {
  const { user } = useContext(AuthContext);  // Get current authenticated user
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHours, setNewHours] = useState('');
  const [selectedSite, setSelectedSite] = useState('Select Site');

  const sites = [
    'Hooves for Harmony',
    'Children Carousel',
    'Hospital Carousel',
    'Seniors Carousel',
    'Tech Carousel',
  ];

  useEffect(() => {
    if (user) {
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
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setLogs(logsData);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!newHours || selectedSite === 'Select Site') {
      Alert.alert('Please fill all fields.');
      return;
    }

    // Capture the current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();  // You can adjust the format as needed
    const formattedTime = currentDate.toLocaleTimeString();  // Time in the format HH:MM:SS

    try {
      await addDoc(collection(db, 'volunteer_logs'), {
        user_id: user.uid,
        hours_contributed: parseFloat(newHours),
        site: selectedSite,
        date: formattedDate,  // Store the current date
        time: formattedTime,  // Store the current time
        timestamp: currentDate.toISOString(),  // Store the full timestamp for future reference
      });
      fetchVolunteerLogs(); // Refresh the logs after adding a new entry
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
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
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : logs.length === 0 ? (
        <Text style={styles.noLogsText}>Time to start racking those points up!</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
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

            <TouchableOpacity
              style={styles.siteButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.siteButtonText}>{selectedSite}</Text>
            </TouchableOpacity>

            <FlatList
              data={sites}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedSite(item)}
                  style={styles.siteItem}
                >
                  <Text style={styles.siteText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <Button title="Add Log" onPress={handleAddLog} />
            <Button title="Cancel" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  noLogsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
  logItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  logText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  siteButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    marginBottom: 15,
  },
  siteButtonText: {
    fontSize: 16,
    color: '#333',
  },
  siteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  siteText: {
    fontSize: 16,
    color: '#333',
  },
});

export default VolunteerLogs;
