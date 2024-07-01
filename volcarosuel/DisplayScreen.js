// volcarosuel/DisplayScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const DisplayScreen = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  location: {
    fontSize: 14,
    marginVertical: 5,
  },
  date: {
    fontSize: 14,
    marginVertical: 5,
  },
  email: {
    fontSize: 14,
    marginVertical: 5,
  },
});

export default DisplayScreen;
