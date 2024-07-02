// import React, { useState, useCallback, useEffect } from 'react';
// import { View, StyleSheet, TextInput, TouchableOpacity, Text, Image } from 'react-native';
// import { GiftedChat, Bubble, Send, InputToolbar, Composer } from 'react-native-gifted-chat';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// const API_KEY = "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";

// const systemMessage = {
//   role: "system",
//   content: "Answer it like the person is looking for volunteering opportunities that are legible for a teenager (13-17 years old)"
// };

// function Chatbot() {
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     setMessages([
//       {
//         _id: 1,
//         text: "Hello, I'm Ordix! How can I help you?",
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'ChatGPT',
//           avatar: 'https://placeimg.com/140/140/any',
//         },
//       },
//     ]);
//   }, []);

//   const onSend = useCallback((messages = []) => {
//     setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
//     const userMessage = messages[0].text;
//     processMessageToChatGPT(userMessage);
//   }, []);

//   async function processMessageToChatGPT(userMessage) {
//     const apiMessages = messages.map((messageObject) => {
//       let role = messageObject.user._id === 2 ? "assistant" : "user";
//       return { role: role, content: messageObject.text };
//     });

//     const apiRequestBody = {
//       model: "gpt-3.5-turbo",
//       messages: [
//         systemMessage,
//         ...apiMessages,
//         { role: "user", content: userMessage }
//       ]
//     };

//     await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": "Bearer " + API_KEY,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(apiRequestBody)
//     }).then((response) => response.json())
//       .then((data) => {
//         const chatGPTMessage = {
//           _id: Math.random().toString(36).substring(7),
//           text: data.choices[0].message.content,
//           createdAt: new Date(),
//           user: {
//             _id: 2,
//             name: 'ChatGPT',
//             avatar: 'https://placeimg.com/140/140/any',
//           },
//         };
//         setMessages(previousMessages => GiftedChat.append(previousMessages, chatGPTMessage));
//       });
//   }

//   const renderSend = (props) => {
//     return (
//       <Send {...props}>
//         <View style={styles.sendingContainer}>
//           <Ionicons name="send" size={28} color="blue" />
//         </View>
//       </Send>
//     );
//   };

//   const renderBubble = (props) => {
//     return (
//       <Bubble
//         {...props}
//         wrapperStyle={{
//           right: {
//             backgroundColor: 'blue',
//           },
//           left: {
//             backgroundColor: '#f0f0f0',
//           },
//         }}
//         textStyle={{
//           right: {
//             color: '#fff',
//           },
//         }}
//       />
//     );
//   };

//   const renderInputToolbar = (props) => {
//     return (
//       <InputToolbar
//         {...props}
//         containerStyle={styles.inputToolbar}
//       />
//     );
//   };

//   const renderComposer = (props) => {
//     return (
//       <Composer
//         {...props}
//         textInputStyle={styles.composer}
//       />
//     );
//   };

//   const renderMessageText = (props) => {
//     return (
//       <View style={styles.messageTextContainer}>
//         <Text style={styles.messageText}>{props.currentMessage.text}</Text>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{
//           _id: 1,
//         }}
//         renderBubble={renderBubble}
//         renderSend={renderSend}
//         renderInputToolbar={renderInputToolbar}
//         renderComposer={renderComposer}
//         renderMessageText={renderMessageText}
//         placeholder="Type message here..."
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   sendingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//     marginBottom: 5,
//   },
//   inputToolbar: {
//     borderTopWidth: 1,
//     borderTopColor: '#e8e8e8',
//     padding: 8,
//   },
//   composer: {
//     backgroundColor: '#f0f0f0',
//     borderRadius: 20,
//     paddingLeft: 12,
//     paddingRight: 12,
//   },
//   messageTextContainer: {
//     padding: 10,
//     borderRadius: 10,
//     backgroundColor: '#f0f0f0',
//     marginBottom: 5,
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#333',
//   },
// });

// export default Chatbot;
