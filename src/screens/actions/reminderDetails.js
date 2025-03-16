import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Alert, Dimensions, BackHandler, Keyboard } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, Menu, Divider, PaperProvider, Modal, Portal, Snackbar} from 'react-native-paper';
import { Camera, CalendarDots, X, Plus, Pill, CaretDown } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../colors/colors.js';
import { styles } from '../../styles/styles.js';
import { Button } from '../../components/button.js';
import { Chip } from '../../components/chip.js';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { InputField } from '../../components/inputField.js';
import * as ImagePicker from 'expo-image-picker';
import { TimeDatePicker, Modes } from 'react-native-time-date-picker';
import moment from 'moment';
import useAuthStore from '../../store/useAuthStore.js';
import { getFirestore, collection, doc, setDoc, serverTimestamp, getDocs, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { db } from '../../utilities/firebaseConfig.js';

export default function ReminderDetails({ route }) {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [connectedUsers, setConnectedUsers] = useState();
  const [selectedColor, setSelectedColor] = useState('fadedRed');
  const [title, setTitle] = useState(route.title);
  const [message, setMessage] = useState(route.message);
  const [selectedRecipient, setSelectedRecipient] = useState('Myself');

  const [menuVisible, setMenuVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);

  const RAINBOW_FADED = ['fadedRed', 'fadedOrange', 'fadedYellow', 'fadedGreen', 'fadedBlue', 'fadedPurple', 'fadedPink'];
  const titleRef = useRef(null);

  const onToggleSnackBar = () => setToastVisible(!toastVisible);
  const onDismissSnackBar = () => setToastVisible(false);
  const openMenu = () => {
    setMenuVisible(true);
    Keyboard.dismiss();
  };
  const closeMenu = () => setMenuVisible(false);
  const handleSelect = (value) => {
    setSelectedRecipient(value);
    closeMenu();
  };

  const validateInputs = () => {
    Keyboard.dismiss();
    if (!title) {
      onToggleSnackBar();
      return false;
    }
    setSaveVisible(true);
    return true; // Validation passed
  };

  const goBack = () => {
    navigation.goBack();
  };

  const fetchConnectedUsers = async (connectedUserIds) => {
    try {
      const userPromises = connectedUserIds.map(async (userId) => {
        const userDocRef = doc(db, "user", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return { 
            uid: userId, 
            name: userDoc.data().name, 
            profileColor: userDoc.data().profileColor, 
            profileIcon: userDoc.data().profileIcon 
          };
        }
        return null;
      });
  
      const connectedUsersData = await Promise.all(userPromises);
  
      return connectedUsersData.filter(user => user !== null);
  
    } catch (error) {
      console.error("Error fetching connected users:", error);
      return [];
    }
  };

  const postReminder = async (id) => {
    const userDocRef = doc(db, "user", user.uid);
    const timeStamp = new Date();

    try {  
      if (selectedRecipient == 'Myself') {
        await updateDoc(userDocRef, {
          reminders: arrayUnion({
            recipient: user.uid,
            recipientName: user.name,
            postedBy: user.name,
            postedById: user.uid,
            profileColor: user.profileColor,
            profileIcon: user.profileIcon,
            postedAt: timeStamp,
            title: title,
            message: message || '',
            postColor: selectedColor
          })
        });

        console.log("Posted for me successfully!");
      } else {
        const recipientDocRef = doc(db, "user", id);
        const userDoc = await getDoc(recipientDocRef);
        const recipientName = userDoc.data().name

        await updateDoc(recipientDocRef, {
          reminders: arrayUnion({
            recipient: id,
            recipientName: recipientName,
            postedBy: user.name,
            postedById: user.uid,
            profileColor: user.profileColor,
            profileIcon: user.profileIcon,
            postedAt: timeStamp,
            title: title,
            message: message || '',
            postColor: selectedColor
          })
        });

        console.log("Posted for other recipient successfully!");
      }

      navigation.goBack();

    } catch (error) {
      console.error("Error posting reminder:", error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const connectedUsers = await fetchConnectedUsers(user.connectedUsers);
        setConnectedUsers(connectedUsers);
        // console.log(connectedUsers);
      } catch (error) {
        console.error("Error fetching connected users:", error);
      }
    };
  
    fetchData();

    const handleBackPress = () => {
      setDiscardVisible(true); 
      return true; 
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);
  
  return (
    <PaperProvider>
      <View style={{backgroundColor: COLORS.white, flex: 1, position: 'relative', paddingBottom: 62}}>

        {/* Modals */}
        <Portal> 

          <Modal visible={saveVisible} onDismiss={() => setSaveVisible(false)}>
            <View style={styles.modalWrapper}>
              <View style={{paddingBottom: 32, gap: 16, paddingTop: 8}}>
                <Text style={{fontFamily: 's-semibold', fontSize: 20, textAlign: 'center', color: COLORS.grey800}}>Post the reminder?</Text>
                <Text style={{fontFamily: 'bg-regular', fontSize: 16, textAlign: 'center', color: COLORS.grey500}}>Almost done!{'\n'}Are you sure you want to post these details?</Text>
              </View>

              <View style={[styles.flexRow, {gap: 4}]}>
                <Button size='small' type='outline' label='Go Back' onPress={() => setSaveVisible(false)} customStyle={{flex: 1}}></Button>
                <Button size='small' type='fill' label='Post Reminder' onPress={() => postReminder(selectedRecipient)} customStyle={{flex: 1}}></Button>
              </View>
            </View>
          </Modal>

          <Modal visible={discardVisible} onDismiss={() => setDiscardVisible(false)}>
            <View style={styles.modalWrapper}>
              <View style={{paddingBottom: 32, gap: 16, paddingTop: 8}}>
                <Text style={{fontFamily: 's-semibold', fontSize: 20, textAlign: 'center', color: COLORS.grey800}}>Discard Changes?</Text>
                <Text style={{fontFamily: 'bg-regular', fontSize: 16, textAlign: 'center', color: COLORS.grey500}}>You have unsaved changes.{'\n'}Are you sure you want to leave? Any edits will be lost.</Text>
              </View>

              <View style={[styles.flexRow, {gap: 4}]}>
                <Button size='small' type='outline' label='Keep Editing' onPress={() => setDiscardVisible(false)} customStyle={{flex: 1}}></Button>
                <Button size='small' type='fill' label='Discard Changes' onPress={goBack} customStyle={{flex: 1}} fillColor={COLORS.error}></Button>
              </View>
            </View>
          </Modal>

        </Portal>
        
        <ScrollView style={{flex: 1, position: 'relative', padding: 12, paddingVertical: 20}}>

          <View style={[styles.editReminder, {backgroundColor: COLORS[selectedColor]}]}>
            <Menu 
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <Pressable 
                  style={[styles.userSelection, {padding: 12, paddingLeft: 20, elevation: 1}]} 
                  onPress={openMenu}
                >
                  <View style={[styles.flexRow, {gap: 4, flex: 1}]}>
                    <Text style={{fontFamily: 's-regular', fontSize: 14, color: COLORS.grey800}}>For: </Text>
                    <Text 
                      style={{fontFamily: 's-semibold', fontSize: 14, color: COLORS.grey800, flex: 1}}
                      numberOfLines={1} 
                      ellipsizeMode="tail"
                    >
                      {selectedRecipient ? selectedRecipient : 'Myself'}
                    </Text>
                  </View>
                  <CaretDown size={20} color={COLORS.grey800} weight='regular' />
                </Pressable>
              }
              anchorPosition='right'
              elevation={1}
              style={{borderRadius: 20}}
              contentStyle={{borderRadius: 16, paddingVertical: 8, paddingRight: 8, overflow: 'hidden', backgroundColor: COLORS.grey100}}
            > 
              <Menu.Item 
                titleStyle={{fontFamily: 'bg-regular', color: COLORS.grey800,}} 
                onPress={() => handleSelect('Myself')} 
                title={'Myself'} 
              />
              {connectedUsers && connectedUsers.map((user) => (
                <Menu.Item 
                  key={user.uid} 
                  titleStyle={{fontFamily: 'bg-regular', color: COLORS.grey800,}} 
                  onPress={() => handleSelect(user.uid)} 
                  title={user.name} 
                />
              ))}
            </Menu>
            
            <View style={{paddingVertical: 12, gap: 20}}>
              <TextInput
                value={title}
                onChangeText={(text) => setTitle(text)}
                ref={titleRef}
                placeholder='Title *'
                mode='flat'
                underlineColor={COLORS.pink800}
                activeUnderlineColor={COLORS.pink500}
                underlineStyle={{borderRadius: 20}}
                contentStyle={{fontFamily: 's-semibold', backgroundColor: COLORS[selectedColor]}}
                textColor={COLORS.grey600}
                placeholderTextColor={COLORS.grey450}
                style={{paddingHorizontal: 0}}
              />
              <TextInput
                value={message}
                onChangeText={(text) => setMessage(text)}
                placeholder='Share a gentle reminder or encouragement for a user in your orbit...'
                mode='outlined'
                outlineColor={COLORS.grey400}
                outlineStyle={{ borderRadius: 16 }}
                contentStyle={{ fontFamily: 'bg-regular', fontSize: 16, textOverflow: 'ellipsis', height: 160, }}
                activeOutlineColor={COLORS.pink500}
                textColor={COLORS.grey600}
                placeholderTextColor={COLORS.grey450}
                multiline={true}
                numberOfLines={8}
                style={{paddingVertical: 14, backgroundColor: COLORS[selectedColor]}}
              />
            </View>
          </View>
          
          <View style={[styles.flexRow, {justifyContent: 'space-between', paddingVertical: 16}]}>
            {RAINBOW_FADED.map((color) => (
              <Pressable
                key={color}
                style={[styles.chooseColor, {
                  borderColor: selectedColor ? COLORS.pink500 : 'transparent',
                  borderWidth: selectedColor == color ? 2 : 0,
                  zIndex: 1000
                }]}
                onPress={() => {setSelectedColor(color); console.log('pressed')}}
              >
                <View style={{backgroundColor: COLORS[color], width: '100%', height: '100%', borderRadius: 100}}></View>
              </Pressable>
            ))}
          </View>
        
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomBtns}>
          <Button 
            size='large' 
            type='outline' 
            label='Cancel' 
            onPress={() => setDiscardVisible(true)}
            customStyle={{flex: 1}}
            rippleColor={'rgba(51,51,51,0.25)'}></Button>
          <Button 
            size='large' 
            type='fill' 
            label='Post' 
            onPress={validateInputs}
            customStyle={{flex: 1}}></Button>
        </View>

        {/* Toast */}
        <Snackbar
          visible={toastVisible}
          onDismiss={onDismissSnackBar}
          duration={5000}
          onIconPress={() => setToastVisible(false)}
          icon={() => <X size={20} color={COLORS.white} weight='bold' />}
          style={[styles.snackbar, {backgroundColor: COLORS.error, position: 'absolute', bottom: 66 , zIndex: 2}]}
          wrapperStyle={{width: Dimensions.get("window").width}}
        >
          <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.white}}>
            Please fill in the required fields.
          </Text>
        </Snackbar>

      </View>
    </PaperProvider>
  );
}