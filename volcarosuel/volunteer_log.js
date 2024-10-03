// volcarosuel/volunteer_log.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../supabaseClient'; // Adjust the path
import { AuthContext } from '../auth/AuthContext'; // Adjust the path

const { width, height } = Dimensions.get('window');

const VolunteerLogs = () => {
  const { user } = useContext(AuthContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [selectedSite, setSelectedSite] = useState('Select Site');
  const [modalVisible, setModalVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const { data, error } = await supabase
      .from('volunteer_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setLogs(data);
    }
    setLoading(false);
  };

  const handleLogSubmit = async () => {
    if (!hours || selectedSite === 'Select Site') {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const { error } = await supabase.from('volunteer_logs').insert([
      {
        user_id: user.id,
        date: date,
        hours_contributed: parseFloat(hours),
        site: selectedSite,
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Volunteer Log Added.');
      setHours('');
      setSelectedSite('Select Site');
      fetchVolunteerLogs();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>Date: {item.date}</Text>
      <Text style={styles.logText}>Hours: {item.hours_contributed}</Text>
      <Text style={styles.logText}>Site: {item.site}</Text>
      {/* Add edit and delete buttons if needed */}
    </View>
  );

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
      <TouchableOpacity style={styles.siteButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.siteButtonText}>{selectedSite}</Text>
      </TouchableOpacity>

      <Button title="Submit Log" onPress={handleLogSubmit} color="#fff6e7" />

      {/* Display volunteer logs */}
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.logsList}
        />
      )}

      {/* Modal for Picker */}
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
              <Picker.Item label="Select Site" value="Select Site" />
              {sites.map((site, index) => (
                <Picker.Item key={index} label={site} value={site} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.doneButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Your existing styles
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
  loadingText: {
    color: '#fff6e7',
    textAlign: 'center',
    marginTop: 20,
  },
  logsList: {
    marginTop: 20,
  },
  logItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  logText: {
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
