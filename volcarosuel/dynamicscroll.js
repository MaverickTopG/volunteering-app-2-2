import { Entypo, Feather } from '@expo/vector-icons';
import faker from 'faker';
import * as React from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { MotiView } from 'moti';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('screen');

faker.seed(10);

const data = [...Array(20).keys()].map(() => ({
  key: faker.datatype.uuid(),
  job: faker.animal.crocodilia(),
}));

const _colors = {
  active: `#FCD259ff`,
  inactive: `#FCD25900`,
};
const _spacing = 10;

export default function DynamicScroll() {
  const ref = React.useRef(null);
  const [index, setIndex] = React.useState(0);
  const viewPosition = 0.5; // Default to center

  React.useEffect(() => {
    ref.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition,
      viewOffset: viewPosition === 0.5 || viewPosition === 1 ? 0 : _spacing,
    });
  }, [index]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
        <FlatList
          ref={ref}
          initialScrollIndex={index}
          style={{ flexGrow: 0 }}
          data={data}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingLeft: _spacing }}
          showsHorizontalScrollIndicator={false}
          horizontal
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              ref.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
          renderItem={({ item, index: fIndex }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setIndex(fIndex);
                }}
              >
                <MotiView
                  animate={{
                    backgroundColor: fIndex === index ? _colors.active : _colors.inactive,
                    opacity: fIndex === index ? 1 : 0.6,
                  }}
                  transition={{
                    duration: 500,
                  }}
                  style={{
                    marginRight: _spacing,
                    padding: _spacing,
                    borderWidth: 2,
                    borderColor: _colors.active,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: '#36303F', fontWeight: '700' }}>
                    {item.job}
                  </Text>
                </MotiView>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}
