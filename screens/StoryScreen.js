import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Navigation,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Speech from 'expo-speech';
import * as Font from 'expo-font';
import Profile from './profile'

let customFonts = {
  'Bubblegum-Sans': require('../assets/fonts/BubblegumSans-Regular.ttf'),
};

export default class StoryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled: false,
      light_theme: true,
      fontsLoaded: false,
      speakerColor: 'gray',
      speakerIcon: 'volume-high-outline',
      like:0,
    };
  }

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
  }

  async intiateTTS(title,author,story,moral){
    const current_color = this.state.speakerColor;
    this.setState({
      speakerColor:current_color == "gray" ? "orange":"gray" 
    })
    if(current_color == "gray"){
    Speech.speak(`${title} by ${author}`);
    Speech.speak(story)
    Speech.speak("the moral of the story is!")
    Speech.speak(moral)
    }
    else{
      Speech.stop()
    }
  }

  render() {
    if (!this.props.route.params) {
      this.props.navigation.navigate('Home');
    } else if (this.state.fontsLoaded) {
      return (
        <View style={this.state.light_theme ? styles.lightcontainer: styles.darkcontainer}>
          <SafeAreaView style={styles.droidSafeArea} />
          <View style={styles.appTitle}>
            <View style={styles.appIcon}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.iconImage}></Image>
            </View>
            <View style={styles.appTitleTextContainer}>
              <Text style={this.state.light_theme ? styles.lightappTitleText: styles.darkappTitleText}>Working with Seniors</Text>
            </View>
          </View>
          <View style={styles.storyContainer}>
            <ScrollView style={this.state.light_theme ? styles.lightstoryCard: styles.darkstoryCard}>
              <Image
                source={require('../assets/story_image_1.png')}
                style={styles.image}></Image>

              <View style={styles.dataContainer}>
                <View style={styles.titleTextContainer}>
                  <Text style={this.state.light_theme ? styles.lightappTitleText: styles.appTitleText}>
                    {this.props.route.params.story.title}
                  </Text>
                  <Text style={this.state.light_theme ? styles.lightstoryAuthorText: styles.darkstoryAuthorText}>
                    {this.props.route.params.story.author}
                  </Text>
                  <Text style={this.state.light_theme ? styles.lightstoryTitleText: styles.darkstoryTitleText}>
                    {this.props.route.params.story.created_on}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      this.intiateTTS(
                        this.props.route.params.story.title,
                        this.props.route.params.story.author,
                        this.props.route.params.story.story,
                        this.props.route.params.story.moral
                      );
                    }}>
                    <Ionicons
                      name={this.state.speakerIcon}
                      size={RFValue(30)}
                      color={this.state.speakerColor}
                      style={{ margin: RFValue(15) }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.storyTextContainer}>
                <Text style={this.state.light_theme ? styles.lightstoryText: styles.darkstoryText}>
                  {this.props.route.params.story.story}
                </Text>
                <Text style={this.state.light_theme ? styles.lightmoralText: styles.darkmoralText}>
                  Moral - {this.props.route.params.story.moral}
                </Text>
              </View>
              <View style={styles.actionContainer}>
                <View style={styles.likeButton}>
                  <TouchableOpacity style = {{flexDirection:"row"}} onPress={()=>{
                    this.setState({like:this.state.like+1})
                  }}>
                  <Ionicons name={'heart'} size={RFValue(30)} color={'white'} />
                  <Text style={styles.darklikeText}>like {this.state.like}</Text>
                  </TouchableOpacity>
                </View>
              </View>
               <View style={styles.actionContainer}>
                <View style={styles.likeButton}>
                  <TouchableOpacity style = {{flexDirection:"row"}} onPress={()=>{
                    this.props.navigation.navigate("Working with Seniors")
                  }}>
                  <Ionicons name={'arrow-back-sharp'} size={RFValue(30)} color={'white'} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  darkcontainer: {
    flex: 1,
    backgroundColor: '#15193c',
  },
    lightcontainer: {
    flex: 1,
    backgroundColor: "lightblue"
  },

  droidSafeArea: {
    marginTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : RFValue(35),
  },
  appTitle: {
    flex: 0.07,
    flexDirection: 'row',
  },
  appIcon: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  appTitleTextContainer: {
    flex: 0.7,
    justifyContent: 'center',
  },
  darkappTitleText: {
    color: 'white',
    fontSize: RFValue(28),
    fontFamily: 'Bubblegum-Sans',
  },
  lightappTitleText: {
    color: 'black',
    fontSize: RFValue(28),
    fontFamily: 'Bubblegum-Sans',
  },
  storyContainer: {
    flex: 1,
  },
  darkstoryCard: {
    margin: RFValue(20),
    backgroundColor: '#2f345d',
    borderRadius: RFValue(20),
    
  },
  lightstoryCard: {
    margin: RFValue(20),
    backgroundColor: 'white',
    borderRadius: RFValue(20),
    
  },
  image: {
    width: '100%',
    alignSelf: 'center',
    height: RFValue(200),
    borderRadius:RFValue(20),
    
  },
  dataContainer: {
    flexDirection: 'row',
    padding: RFValue(20),
  },
  titleTextContainer: {
    flex: 0.8,
  },
  darkstoryTitleText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    color: 'white',
  },
   lightstoryTitleText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    color: 'black',
  },
  darkstoryAuthorText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(18),
    color: 'white',
  },
   lightstoryAuthorText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(18),
    color: 'black',
  },
  iconContainer: {
    flex: 0.2,
  },
  storyTextContainer: {
    padding: RFValue(20),
  },
  darkstoryText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(15),
    color: 'white',
  },
  lightstoryText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(15),
    color: 'black',
  },
  darkmoralText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(20),
    color: 'white',
  },
  lightmoralText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(20),
    color: 'black',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: RFValue(10),
    
  },
  likeButton: {
    width: RFValue(160),
    height: RFValue(40),
    flexDirection: 'row',
    backgroundColor: '#eb3948',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(30),
    
  },
  
  darklikeText: {
    color: 'white',
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    marginLeft: RFValue(5),
  },
  lightlikeText: {
    color: 'black',
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    marginLeft: RFValue(5),
  },
});
