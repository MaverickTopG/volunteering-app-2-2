// styles/commonStyles.js
import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15193c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: RFValue(50),
    backgroundColor: '#253041',
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: RFValue(18),
    color: 'white',
    borderColor: '#0077B6',
    borderWidth: 2,
  },
  button: {
    width: '100%',
    padding: RFValue(15),
    backgroundColor: '#0077B6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(20),
  },
  title: {
    fontSize: RFValue(24),
    color: 'white',
    marginBottom: 20,
  },
});
