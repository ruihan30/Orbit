import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { Bell } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import MasonryList from '@react-native-seoul/masonry-list';
import { CohereClientV2 } from 'cohere-ai';

export default function CareBot() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false); 
  //   if (!userInput.trim()) return;  // Don't send empty input

  //   setLoading(true);  // Show loading indicator
  //   try {
  //     // Send the user's input to OpenAI
  //     const completion = await openai.chat.completions.create({
  //       model: 'gpt-4o-mini',
  //       messages: [
  //         { role: 'system', content: 'You are a helpful assistant.' },
  //         { role: 'user', content: userInput },
  //       ],
  //       store: true,
  //     });

  //     // Get the AI's response
  //     const aiResponse = completion.choices[0].message.content;
  //     setResponse(aiResponse);  // Set the response to display
  //   } catch (error) {
  //     console.error('GPT API error:', error);
  //     setResponse('Error: Something went wrong!');
  //   } finally {
  //     setLoading(false);  // Hide loading indicator
  //   }
  // };

  // const cohere = require('cohere-ai');
  // require('dotenv').config(); 
  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_KEY,  // Replace <<apiKey>> with your actual API key
  });

  const sendToCohere = async () => {
    setLoading(true);
    try {
      const apiResponse = await cohere.chat({
        model: 'command-r-plus',
        messages: [
          {
            role: 'user',
            content: userInput,
          },
        ],
      });
      setResponse(apiResponse); // Store the response
      console.log('success');
    } catch (error) {
      console.error('Error communicating with Cohere:', error);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={{backgroundColor: COLORS.bg, flex: 1}}>
      <GestureHandlerRootView>

        {/* Top Bar */}
        <Appbar.Header mode='center-aligned' style={{backgroundColor: COLORS.white}}> 
          <Appbar.Action style={styles.profile}
            // icon={() => 
            //   <View style={styles.iconWrapper}>
            //     <User size={20} color={COLORS.grey600} weight='bold' />
            //   </View>
            // } 
            icon='account-outline'
            onPress={() => {}} 
          />
          <Text style={styles.header}>My Orbital</Text>
          <Appbar.Action style={styles.action} 
            icon={() => 
              <View style={styles.iconWrapper}>
                <Bell size={18} color={COLORS.grey800} weight='bold' />
              </View>
            } 
            onPress={() => {}} 
          />
        </Appbar.Header>

        <View>
          <TextInput
            // style={styles.input}
            placeholder="Ask me about your medication..."
            value={userInput}
            onChangeText={setUserInput}
            multiline
          />
          <Button title="Ask AI" onPress={() => console.log('API Key:', process.env.COHERE_API_KEY)} />
          <Button title="Ask AI" onPress={sendToCohere} />
          {response ? <Text>{response.message.content[0].text}</Text> : null}
        </View>


      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
