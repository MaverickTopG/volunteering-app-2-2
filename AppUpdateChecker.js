import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { Alert, Linking } from 'react-native';

const checkForUpdate = async () => {
    try {
        const currentVersion = DeviceInfo.getVersion();

        // Fetch latest version from the App Store
        const response = await axios
            .get('https://itunes.apple.com/lookup?id=6636497206')
            .catch(err => {
                console.error('Error fetching App Store data:', err);
                Alert.alert(
                    'Error',
                    'Unable to check for updates. Please try again later.'
                );
                throw err; // Re-throw to exit the function
            });

        const latestVersion = response.data.results[0]?.version;

        // Check if versions differ
        if (currentVersion !== latestVersion) {
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
