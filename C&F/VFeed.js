import React from 'react';
import {View,Text,Platform,SafeAreaView,StatusBar,StyleSheet,Image,FlatList} from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import * as Font from "expo-font";
import VCard from '../C&F/VCard.js'



let customefont= {
  "Bubblegum-Sans": require("../assets/fonts/BubblegumSans-Regular.ttf")
};

let stories=require("../C&F/Vtemp_stories.json")


export default class VFeed extends React.Component{
  //intialiy font not loaded 
  constructor(){
    super();
    this.state={
      fontsLoaded:false,
      light_theme:true,
      isEnabled:false,
    }
  }
  async fetchUser() {
    let theme, name, image;
    await firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid)
      .on("value", function (snapshot) {
        theme = snapshot.val().current_theme;
        name = `${snapshot.val().first_name}`
      });
    this.setState({
      light_theme: theme === "light" ? true : false,
      isEnabled: theme === "light" ? false : true,
      name: name
    });
    
  }

  //to load fonts
  async fontload(){
    await Font.loadAsync(customefont)
    this.setState({fontsLoaded:true})
      }

  //calling fontload() function
  componentDidMount(){
    this.fontload()
    this.fetchUser()
  }


  k=(item, index) => index.toString();

  r=({item:story})=>{
   return (
     <VCard story={story} navigation={this.props.navigation}/>
   )
  }


  render(){
    if(this.state.fontsLoaded){
      return(
      <View style={this.state.light_theme?styles.lightcontainer:styles.container}>
        <SafeAreaView style={styles.droidSafeArea} />

          <View style={styles.appTitle}>

                <View style={styles.appIcon}>
                  <Image
                    source={require("../assets/logo.png")}
                    style={styles.iconImage}
                  ></Image>
                </View>

                <View style={styles.appTitleTextContainer}>
                  <Text style={this.state.light_theme?styles.lightappTitleText:styles.appTitleText}>Volunteering App</Text>
                </View>

          </View>

          <View style={styles.cardContainer}>
             <FlatList
              data={stories}
              keyExtractor={this.k}
              renderItem={this.r}
             
              />       
           
          </View>



      </View>
    )
    }
  }
}


const styles = StyleSheet.create({
  lightcontainer:{
    flex:1,
    backgroundColor:"white"
  },
  container: {
    flex: 1,
    backgroundColor: "#15193c"
  },
  droidSafeArea: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
  },
  appTitle: {
    flex: 0.07,
    flexDirection: "row"
  },
  appIcon: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center"
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  appTitleTextContainer: {
    flex: 0.7,
    justifyContent: "center"
  },
  appTitleText: {
    color: "white",
    fontSize: RFValue(28),
    fontFamily: "Bubblegum-Sans"
  },
  lightappTitleText: {
    color: "15193c",
    fontSize: RFValue(28),
    fontFamily: "Bubblegum-Sans"
  },
  cardContainer: {
    flex: 0.93
  }
});