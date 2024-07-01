// Feed.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Feed = ({ navigation }) => {
  return (
    <View>
      <Text>Feed Screen</Text>
      <Button
        title="Go to Volunteer Carousel"
        onPress={() => navigation.navigate('VolcarosuelStack')}
      />
    </View>
  );
};

export default Feed;
