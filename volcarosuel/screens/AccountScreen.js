import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../auth/firebase'; // Adjust path to your firebase.js
import { AuthContext } from '../../auth/AuthContext'; // Adjust the path to your AuthContext

export default function AccountScreen() {
  // Get the user from AuthContext (should be null if not logged in)
  const { user } = useContext(AuthContext);

  // Local state for modals and temporary fields
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);

  // Example icon options
  const iconOptions = [
    'person-circle-outline',
    'happy-outline',
    'paw-outline',
    'book-outline',
    'earth-outline',
    'heart-outline',
    'star-outline',
    'car-outline',
  ];

  // If no user is logged in, display a prompt similar to OrganizationScreen.
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>
            You must be logged in to view your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Updates the user's name in Firestore.
   * Assumes user documents are stored in the 'users' collection with document ID equal to user.uid.
   */
  const updateName = async (firstName, lastName) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { firstName, lastName });
      // Optionally, you can also update the AuthContext here.
      return true;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Updates the user's icon in Firestore.
   */
  const updateIcon = async (iconName) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { icon: iconName });
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleOpenNameModal = () => {
    setTempFirstName(user.firstName || '');
    setTempLastName(user.lastName || '');
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    try {
      await updateName(tempFirstName, tempLastName);
      Alert.alert('Success', 'Your name has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Could not update name.');
    } finally {
      setShowNameModal(false);
    }
  };

  const handleOpenIconModal = () => {
    setShowIconModal(true);
  };

  const handleSelectIcon = async (iconName) => {
    try {
      await updateIcon(iconName);
      Alert.alert('Success', 'Your icon has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Could not update icon.');
    } finally {
      setShowIconModal(false);
    }
  };

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const hasName = firstName.trim() !== '' || lastName.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Section */}
        <View style={styles.profileContainer}>
          {/* Display chosen icon; tap to change */}
          <TouchableOpacity onPress={handleOpenIconModal} style={{ marginBottom: 10 }}>
            <Ionicons name={user.icon} size={60} color="#333" />
          </TouchableOpacity>
          {hasName ? (
            <Text style={styles.profileName}>
              {firstName} {lastName}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleOpenNameModal}>
              <Text style={styles.addNameText}>Add your name</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Volunteering Section (example placeholders) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteering</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>My Organizations</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Causes</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          {!hasName ? (
            <TouchableOpacity style={styles.row} onPress={handleOpenNameModal}>
              <Text style={styles.rowText}>Add Name</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.row} onPress={handleOpenNameModal}>
              <Text style={styles.rowText}>Edit Name</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Email Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Notifications Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>About Nexolink</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for adding/editing name */}
      <Modal visible={showNameModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="First Name"
              placeholderTextColor="#888"
              value={tempFirstName}
              onChangeText={setTempFirstName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Last Name"
              placeholderTextColor="#888"
              value={tempLastName}
              onChangeText={setTempLastName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowNameModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for changing icon */}
      <Modal visible={showIconModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.iconModalContent}>
            <Text style={styles.modalTitle}>Choose Your Icon</Text>
            <View style={styles.iconGrid}>
              {iconOptions.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={styles.iconButton}
                  onPress={() => handleSelectIcon(iconName)}
                >
                  <Ionicons name={iconName} size={40} color="#333" />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowIconModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  scrollContent: {
    padding: 16,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#333',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addNameText: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    backgroundColor: '#fff6e7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 14,
    color: '#333',
  },
  // Modal styling for name and icon selection
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff6e7',
    borderRadius: 12,
    padding: 20,
  },
  iconModalContent: {
    backgroundColor: '#fff6e7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#fff6e7',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff6e7',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff6e7',
    fontSize: 16,
  },
  // Icon selection grid
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconButton: {
    backgroundColor: '#fff6e7',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
});
