import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
 
  title: {
    fontSize: RFValue(24),
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: RFValue(40),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: RFValue(5),
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: RFValue(40),
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(5),
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: 'bold',
  },
});

export default styles;
