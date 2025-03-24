import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { PaperPlaneRight, CaretDown } from 'phosphor-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { Bell } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import MasonryList from '@react-native-seoul/masonry-list';
import { CohereClientV2 } from 'cohere-ai';
import { collection, doc, setDoc, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import useAuthStore from '../store/useAuthStore.js';
import { db } from '../utilities/firebaseConfig.js';
import Illus from '../../assets/default_states/chat_illus.svg';

export default function CareBot() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [loading, setLoading] = useState(false); 
  const { user } = useAuthStore();
  const { width, height } = Dimensions.get('window');

  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Ensure opacity is set
  const [showButton, setShowButton] = useState(false);
  
  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_KEY, 
  });

  const sendToCohere = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { type: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setNewMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {

      const apiResponse = await cohere.chat({
        model: 'command-r-plus',
        messages: [{ role: 'user', content: userInput }],
      });

      const aiResponseText = apiResponse.message.content[0].text || "Sorry, I couldn't process that.";

      const newAiMessage = { type: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, newAiMessage]);
      setNewMessages(prev => [...prev, newAiMessage]);

    } catch (error) {
      console.error('Error communicating with Cohere:', error);
    } finally {
      setUserInput('');
      setLoading(false);
    }
  };

  const saveChat = async () => {

    const userDocRef = doc(db, "user", user.uid);
    const chatRef = collection(userDocRef, "chat");

    try {
      for (let message of newMessages) { 
        await addDoc(chatRef, {
          text: message.text,
          type: message.type,
          timestamp: serverTimestamp(), // Add a timestamp for each message
        });
      }
      console.log("Chat saved successfully!");

      setNewMessages([]);
      
    } catch (error) {
      console.error("Error saving chat: ", error);
    }

  };

  const fetchMessages = async () => {
    try {
      const userDocRef = doc(db, "user", user.uid);
      const chatRef = collection(userDocRef, "chat");

      // Query to get messages sorted by timestamp
      const q = query(chatRef, orderBy("timestamp", "asc"));  // Adjust sorting as needed
      const querySnapshot = await getDocs(q);

      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));

      // Update the state with the fetched messages
      setMessages(fetchedMessages);

    } catch (error) {
      console.error("Error fetching messages: ", error);
    }
  };

  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    setShowButton(!isAtBottom);
  };
  
  useEffect(() => {
    if (newMessages.length > 0) {
      saveChat();
    }
  }, [newMessages])

  useEffect(() => {
    fetchMessages();
  }, [])

  return (
    <View style={{flex: 1, backgroundColor: COLORS.bg}}>

      {/* Chat display */}
      <ScrollView style={styles.chatContainer} ref={scrollViewRef} onScroll={handleScroll}>
        <View>

          <View style={[styles.defaultStateContainer, {height: height/10*6.5}]}>
            <Illus />
            
            <Text style={styles.defaultStateHeader}>Have a health question?</Text> 
            <Text style={styles.defaultStateText}>Ask Carebot anything about your health. </Text>
          </View>

          {messages.map((message, index) => (
            <View 
              key={index} 
              style={
                message.type === 'user' ? styles.questionBox : styles.responseBox
              }
            >
              <Text style={[
                styles.chatText, 
                message.type === 'user' ? { color: COLORS.white, fontFamily: 'bg-medium'} : { color: COLORS.grey900 }
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          
        </View>

        <View style={{paddingTop: 92}}></View>

      </ScrollView>
      
      {showButton && (
        <Animated.View 
          style={{
            position: 'absolute',
            bottom: 80,
            left: 12,
            opacity: fadeAnim,
          }}
        >
          <TouchableOpacity 
            onPress={handleScrollToBottom}
            style={{
              backgroundColor: COLORS.grey400, 
              borderRadius: 50, 
              padding: 14, 
              elevation: 5
            }}
          >
            <CaretDown size={22} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      )}


      {/* Input field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask Carebot anything..."
          placeholderTextColor={COLORS.grey500}
          value={userInput}
          onChangeText={setUserInput}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={() => {
            sendToCohere();
            // console.log(messages);
          }} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <PaperPlaneRight size={22} color={COLORS.white} weight='fill'/>}
        </TouchableOpacity>
      </View>

    </View>
  );
}
