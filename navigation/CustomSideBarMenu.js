import React from 'react';
import { SafeAreaView, Text, View, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';


export default class CustomSideBarMenu extends React.Component {


  render() {
    let props = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: "lightblue" }}>
        <Image source={require("../assets/logo.png")} style={styles.i} />
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  i: {
    width: RFValue(140),
    height: RFValue(140),
    alignSelf: "center",
    borderRadius: RFValue(70),
    marginTop: RFValue(60),
    resizeMode: "contain"
  }
})
