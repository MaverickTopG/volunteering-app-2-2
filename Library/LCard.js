//THIS IS FOR ENVIROMENT
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  TouchableOpacity
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import * as Font from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import firebase from 'firebase/auth';

SplashScreen.preventAutoHideAsync();

let customFonts = {
  "Bubblegum-Sans": require("../assets/fonts/BubblegumSans-Regular.ttf")
};

export default class LCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontsLoaded: false,
      light_theme: true,
      isEnabled: false,
      like: 0,
      isLiked: true
    };
  }
  likeaction() {
    if (this.state.isLiked) {
      firebase.database().ref("posts")
        .child(like).set(firebase.database.ServerValue.increment(1))
      this.setState({ likes: like })
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

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
    this.fetchUser()
  }

  render() {
    if (this.state.fontsLoaded) {
      SplashScreen.hideAsync();
      return (
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate('LScreen', {
            story: this.props.story
          })
        }}>
          <View style={styles.container}>
            <View style={this.state.light_theme ? styles.lightcardContainer : styles.cardContainer}>
              <Image source={require("../assets/story_image_1.png")} style={styles.storyImage} />
              <View style={styles.titleContainer}>
                <Text style={this.state.light_theme ? styles.lightstoryTitleText : styles.storyTitleText}>{this.props.story.title}  </Text>
                <Text style={this.state.light_theme ? styles.lightstoryAuthorText : styles.storyAuthorText}>{this.props.story.author}</Text>
                <Text style={this.state.light_theme ? styles.lightdescriptionText : styles.descriptionText}>{this.props.story.description}  </Text>
              </View>
              <View style={styles.actionContainer}>
                <View style={styles.likeButton}>
                  <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => {
                    this.setState({ like: this.state.like + 1 })
                  }}>
                    <Ionicons name={"heart"} color={"white"} size={RFValue(25)} />
                    <Text style={styles.likeText}> Like {this.state.like} </Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cardContainer: {
    margin: RFValue(15),
    backgroundColor: "#2f345d",
    borderRadius: RFValue(20),
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,

  },
  lightcardContainer: {
    margin: RFValue(15),
    backgroundColor: "lightblue",
    borderRadius: RFValue(20),
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 5,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  storyImage: {
    width: "95%",
    alignSelf: "center",
    height: RFValue(250),
    borderRadius: RFValue(50),
    resizeMode: "contain",

  },
  titleContainer: {
    paddingLeft: RFValue(20),
    justifyContent: "center"
  },
  storyTitleText: {
    fontSize: RFValue(25),
    fontFamily: "Bubblegum-Sans",
    color: "white"
  },
  lightstoryTitleText: {
    fontSize: RFValue(25),
    fontFamily: "Bubblegum-Sans",
    color: "#151953c"
  },
  storyAuthorText: {
    fontSize: RFValue(18),
    fontFamily: "Bubblegum-Sans",
    color: "white"
  },
  lightstoryAuthorText: {
    fontSize: RFValue(18),
    fontFamily: "Bubblegum-Sans",
    color: "#15193c"
  },
  descriptionText: {
    fontFamily: "Bubblegum-Sans",
    fontSize: 13,
    color: "white",
    paddingTop: RFValue(10)
  },
  lightdescriptionText: {
    fontFamily: "Bubblegum-Sans",
    fontSize: 13,
    color: "#15193c",
    paddingTop: RFValue(10)
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: RFValue(10)
  },
  likeButton: {
    width: RFValue(160),
    height: RFValue(40),
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#eb3948",
    borderRadius: RFValue(30)
  },
  likeText: {
    color: "white",
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(25),
    marginLeft: RFValue(5)
  }
});