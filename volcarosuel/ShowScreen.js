import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DisplayScreen = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();

  const handleAddressClick = () => {
    navigation.navigate('Map', { address: item.address });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <TouchableOpacity onPress={handleAddressClick}>
        <Text style={[styles.email, styles.hyperlink]}>{item.address}</Text>
      </TouchableOpacity>
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
  hyperlink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default DisplayScreen;
