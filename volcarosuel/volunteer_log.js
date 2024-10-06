import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firebase from '../auth/firebase'; // Adjust path
import { AuthContext } from '../auth/AuthContext'; // Adjust path

const { width, height } = Dimensions.get('window');

const VolunteerLogs = () => {
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [hours, setHours] = useState('');
  const [selectedSite, setSelectedSite] = useState('Select Site');
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useContext(AuthContext);

  const sites = [
    'Hooves for Harmony',
    'Children Carousel',
    'Hospital Carousel',
    'Seniors Carousel',
    'Tech Carousel',
  ];

  const handleLogSubmit = async () => {
    if (!hours || selectedSite === 'Select Site') {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    try {
      const db = firebase.firestore();
      await db.collection('volunteer_logs').add({
        userId: user.uid,
        hours: parseFloat(hours),
        site: selectedSite,
        date,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Volunteer hours logged successfully');
      setHours('');
      setSelectedSite('Select Site');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date: {date}</Text>

      <Text style={styles.label}>Hours:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={hours}
        onChangeText={(text) => setHours(text)}
        placeholder="Enter hours"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Volunteering Site:</Text>
      <TouchableOpacity
        style={styles.siteButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.siteButtonText}>{selectedSite}</Text>
      </TouchableOpacity>

      <Button title="Submit Log" onPress={handleLogSubmit} color="#fff6e7" />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Volunteering Site</Text>
            <Picker
              selectedValue={selectedSite}
              onValueChange={(itemValue) => setSelectedSite(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff6e7"
            >
              {sites.map((site, index) => (
                <Picker.Item key={index} label={site} value={site} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
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
    backgroundColor: '#000',
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff6e7',
  },
  input: {
    height: 40,
    borderColor: '#fff6e7',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#fff6e7',
    backgroundColor: '#1a1a1a',
  },
  siteButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderColor: '#fff6e7',
    borderWidth: 1,
    marginBottom: 20,
  },
  siteButtonText: {
    fontSize: 16,
    color: '#fff6e7',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff6e7',
    textAlign: 'center',
  },
  picker: {
    height: 150,
    width: '100%',
    color: '#fff6e7',
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff6e7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VolunteerLogs;
