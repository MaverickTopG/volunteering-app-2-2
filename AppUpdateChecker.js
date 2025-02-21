import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { Alert, Linking } from 'react-native';

// Function to compare semantic versions
const isVersionLess = (current, latest) => {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const cur = currentParts[i] || 0;
    const lat = latestParts[i] || 0;
    if (cur < lat) return true;
    if (cur > lat) return false;
  }
  return false; // they are equal
};

const checkForUpdate = async () => {
  try {
    const currentVersion = DeviceInfo.getVersion();
    console.log('Current version:', currentVersion);

    // Fetch latest version from the App Store
    const response = await axios.get('https://itunes.apple.com/lookup?id=6636497206')
      .catch(err => {
        console.error('Error fetching App Store data:', err);
        Alert.alert(
          'Error',
          'Unable to check for updates. Please try again later.'
        );
        throw err;
      });

    const latestVersion = response.data.results[0]?.version;
    console.log('Latest version from App Store:', latestVersion);

    if (!latestVersion) {
      console.warn('Latest version is not available from the lookup.');
      return;
    }

    // Use semantic versioning to check if an update is needed
    if (isVersionLess(currentVersion, latestVersion)) {
      Alert.alert(
        'Update Available',
        'A new version of the app is available. Please update to continue.',
        [
          {
            text: 'Update Now',
            onPress: () =>
              Linking.openURL('itms-apps://itunes.apple.com/app/id6636497206')
                .catch(err => {
                  console.error('Error opening App Store URL:', err);
                  Alert.alert(
                    'Error',
                    'Unable to open the App Store. Please check your connection.'
                  );
                }),
          },
          { text: 'Later', style: 'cancel' },
        ]
      );
    }
  } catch (error) {
    console.error('Unexpected error in update check:', error);
    Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
  }
};

export default checkForUpdate;
