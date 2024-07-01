// DisplayScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';

const DisplayScreen = ({ route, navigation }) => {
  const { title, location, date, description, email } = route.params.item;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Name: {title}</Text>
      <Text style={styles.text}>Description: {description}</Text>
      <Text style={styles.text}>Location: {location}</Text>
      <Text style={styles.text}>Date: {date}</Text>
      <Text style={styles.text}>Contact Email: {email}</Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    marginVertical: 10,
  },
});

export default DisplayScreen;
