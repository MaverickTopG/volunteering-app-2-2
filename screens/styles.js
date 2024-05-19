import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  input: {
    backgroundColor: '#555',
    color: 'white',
    width: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ADD8E6', // Light blue color
    width: '80%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
  },
  footerText: {
    color: '#ccc',
    marginTop: 20,
    fontSize: 14,
  }
});
