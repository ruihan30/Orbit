import React from 'react';
import { useState, useRef, useEffect, useCallback, createElement } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Alert, Dimensions, BackHandler, Keyboard } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, Menu, Divider, PaperProvider, Modal, Portal, Snackbar } from 'react-native-paper';
import { Plus, User, PersonArmsSpread, Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse, PawPrint, PencilSimpleLine, X, CaretRight, SignOut } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../colors/colors.js';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import { InputField } from '../components/inputField.js';
import useAuthStore from '../store/useAuthStore.js';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../utilities/firebaseConfig.js';
import BottomSheet, {BottomSheetView, TouchableOpacity} from '@gorhom/bottom-sheet';
import { Shadow } from 'react-native-shadow-2';
import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import AsyncStorage  from '@react-native-async-storage/async-storage';

export default function Profile() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [localUser, setLocalUser] = useState();

  const [toastMsg, setToastMsg] = useState('');
  const [toastMsgColor, setToastMsgColor] = useState();
  const [toastVisible, setToastVisible] = useState(false);
  
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const bottomSheetRef = useRef(null);
  const { width, height } = Dimensions.get('window');

  const [displayName, setDisplayName] = useState('');
  const [selectedColor, setSelectedColor] = useState('grey400');
  const [bgColor, setBgColor] = useState('fadedRed');
  const [selectedAvatar, setSelectedAvatar] = useState('User');
  const [inviteID, setInviteID] = useState('')
  const [connectedUsers, setConnectedUsers] = useState();
  
  const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
  const RAINBOW_FADED = ['fadedRed', 'fadedOrange', 'fadedYellow', 'fadedGreen', 'fadedBlue', 'fadedPurple', 'fadedPink'];
  const ICONS = [Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse];
  const ICONS_STRING = ['Rabbit', 'Bird', 'Butterfly', 'Cat', 'Cow', 'Dog', 'FishSimple', 'Horse'];

  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    Keyboard.dismiss();
  }
  const snapPoints = bottomSheetTitle == 'Choose your avatar' ? ["65%"] : ["40%"];
  const onToggleSnackBar = () => setToastVisible(!toastVisible);
  const onDismissSnackBar = () => setToastVisible(false);

  const shadow = () => {
    return (
      <Shadow
        sides={{top: true, bottom: false, start: false, end: false}}
        style={{width: width, overflow: 'hidden'}}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      </Shadow>
    );
  };

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
    if (index == -1) Keyboard.dismiss()
  }, []);

  const saveDisplay = async (color, icon) => {
    setLocalUser(prevState => ({
      ...prevState, 
      profileColor: color, 
      profileIcon: icon,   
    }));

    const userDocRef = doc(db, "user", user.uid);

    try {
      await updateDoc(userDocRef, {
        profileIcon: icon,
        profileColor: color,
      });
  
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  const saveDisplayName = async (name) => {
    setLocalUser(prevState => ({
      ...prevState, 
      name: name, 
    }));

    const userDocRef = doc(db, "user", user.uid);

    try {
      await updateDoc(userDocRef, {
        name: name,
      });
  
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  const sendInvite = async (id) => {
    const userDocRef = doc(db, "user", id);
    const timeStamp = new Date();

    try {
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // If the user document doesn't exist, handle the error
        setToastMsg('User does not exist, please check the ID entered and try again.');
        setToastMsgColor('error');
        onToggleSnackBar();
        console.log('User does not exist');
        return;
      }

      const userData = userDoc.data();

      if (userData.connectedUsers && userData.connectedUsers.includes(user.uid)) {
        setToastMsg('You are already connected with this user.');
        setToastMsgColor('error');
        onToggleSnackBar();
        console.log('User is already connected');
        return;
      }
      
      await updateDoc(userDocRef, {
        invites: arrayUnion({
          uid: user.uid,
          name: user.name,
          sentAt: timeStamp,
        })
      });

      setToastMsg('Invitation sent.');
      setToastMsgColor('success')
      onToggleSnackBar();

      console.log("Invite sent successfully!");
    } catch (error) {
      console.error("Error sending invite:", error.message);
      if (error.message.includes('No document to update')) {
        setToastMsg('User does not exist, please check the ID entered and try again.');
        setToastMsgColor('error')
        onToggleSnackBar();
        console.log('User does not exist');
      }
    }
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
      // console.error("Error fetching connected users:", error);
      return [];
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      console.log('before')
      await signOut(auth); // Wait for sign-out to complete
      console.log("User logged out");
  
      await AsyncStorage.removeItem("@user"); // Clear AsyncStorage
  
      useAuthStore.getState().logout(); // Call Zustand's logout function
      console.log(useAuthStore.getState().isAuthenticated, useAuthStore.getState().user); // Log updated state
      navigation.navigate('Landing');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    setDisplayName(user.name);
    setLocalUser(user);
    if(user.profileColor) setSelectedColor(user.profileColor);
    if(user.profileIcon) setSelectedAvatar(user.profileIcon);

    const fetchData = async () => {
      try {
        const connectedUsers = await fetchConnectedUsers(user.connectedUsers);
        setConnectedUsers(connectedUsers);
        console.log(connectedUsers);
      } catch (error) {
        console.error("Error fetching connected users:", error);
      }
    };
  
    fetchData();
  }, [])

  useEffect(() => {
    const index = RAINBOW.indexOf(selectedColor);
    if (index !== -1) {
      setBgColor(RAINBOW_FADED[index]);
    } else {
      setBgColor('grey200')
    }
  }, [selectedColor])
  
  return (
    <PaperProvider>
      <View style={{backgroundColor: COLORS.white, position: 'relative', padding: 16, flex: 1}}>
        
        <ScrollView style={{overflow: 'visible', flex: 1, position: 'relative'}} >
        
          {/* Profile pic */}
          <View style={{width: '100%', gap: 20, paddingVertical: 12}}>

            <Pressable 
              style={[styles.avatar, {
                backgroundColor: COLORS[localUser && RAINBOW_FADED[RAINBOW.indexOf(localUser.profileColor)]], 
              }]} 
              onPress={() => {openBottomSheet(); setBottomSheetTitle('Choose your avatar');}}
            >

              {localUser && ICONS_STRING.includes(localUser.profileIcon) ? (
                React.createElement(ICONS[ICONS_STRING.indexOf(localUser.profileIcon)], {
                  size: 64,
                  color: COLORS[localUser.profileColor],
                  weight: 'regular'
                })
              ) : (
                <User size={64} color={localUser ? COLORS[localUser.profileColor] : COLORS.grey400} weight="regular" />
              )}

              <Pressable 
                style={styles.changeAvatar} 
                onPress={() => {openBottomSheet(); setBottomSheetTitle('Choose your avatar');}}
              >
                <PersonArmsSpread size={28} color={COLORS.grey500}/>
              </Pressable>
            </Pressable>
            
            {/* Details */}
            <View style={{borderRadius: 16, overflow: 'hidden'}}>
              <List.Item
                title="Display Name"
                description={localUser && localUser.name}
                titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
                descriptionStyle={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey500}}
                right={props => <CaretRight color={COLORS.grey700}/>}
                onPress={() => {setBottomSheetTitle('Edit your display name'); openBottomSheet();}}
                style={{backgroundColor: COLORS.grey100}}
              />
              <List.Item
                title="User ID"
                description={localUser && localUser.uid}
                titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
                descriptionStyle={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey500}}
                style={{backgroundColor: COLORS.grey100}}
              />
              <List.Item
                title="Log Out"
                titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.error}}
                style={{backgroundColor: COLORS.errorFaded, paddingHorizontal: 16}}
                left={props => <SignOut color={COLORS.error}/>}
                onPress={() => {
                  const auth = getAuth();
                  handleLogout();
                }}
              />
            </View>
          
          </View>

          {/* Support Orbital */}
          <View style={{paddingVertical: 20, gap: 12}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Support Orbital</Text>
            <ScrollView
              horizontal={true}
              style={{overflow: 'visible'}}
            >

              {/* First default */}
              <View style={{width: 76, gap: 4, marginHorizontal: 2}}>
                <Pressable 
                  style={[styles.supportImgs, {borderWidth: 1, borderColor: COLORS.grey400}]} 
                  onPress={() => {openBottomSheet(); setBottomSheetTitle('Add to your Orbital');}}
                >
                  <Plus color={COLORS.grey700}/>
                </Pressable>
                <Text 
                  style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}
                  numberOfLines={1} 
                  ellipsizeMode="tail" 
                >
                </Text>
              </View>

              {connectedUsers && connectedUsers.map((connectedUser) => (
                <View key={connectedUser.uid} style={{width: 76, gap: 4, marginHorizontal: 2}}>
                  <Pressable 
                    style={[styles.supportImgs, {
                      backgroundColor: COLORS[RAINBOW_FADED[RAINBOW.indexOf(connectedUser.profileColor)]]
                      }]}>
                    {ICONS_STRING.includes(connectedUser.profileIcon) ? (
                      createElement(ICONS[ICONS_STRING.indexOf(connectedUser.profileIcon)], {
                        size: 28,
                        color: COLORS[connectedUser.profileColor],
                        weight: 'regular'
                      })
                    ) : (
                      <User color={COLORS.grey700} weight="regular" />
                    )}
                  </Pressable>
                  <Text 
                    style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}
                    numberOfLines={1} 
                    ellipsizeMode="tail" 
                  >
                  {connectedUser.name}</Text>
                </View>
              ))}

            </ScrollView>
          </View>

        </ScrollView>

        {/* Toast */}
        <Snackbar
          visible={toastVisible}
          onDismiss={onDismissSnackBar}
          duration={5000}
          onIconPress={() => setToastVisible(false)}
          icon={() => <X size={20} color={COLORS.white} weight='bold' />}
          style={[styles.snackbar, {backgroundColor: COLORS[toastMsgColor], position: 'absolute', bottom: 20, zIndex: 2}]}
          wrapperStyle={{width: Dimensions.get("window").width}}
        >
          <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.white}}>
            {toastMsg}
          </Text>
        </Snackbar>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          style={{ zIndex: 100 }}
          handleComponent={shadow}
        >
          <BottomSheetView style={{flex: 1}}>
            
            {/* Title */}
            <View style={{paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.grey300}}>
              <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}>
                {bottomSheetTitle}
              </Text>
            </View>
  
            {bottomSheetTitle == 'Choose your avatar' && (
              <>
                <View style={[styles.flexRow, {padding: 8, justifyContent: 'space-between', paddingVertical: 20}]}>
                  {RAINBOW.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.chooseColor, {
                        borderColor: selectedColor == color ? COLORS[color] : 'transparent',
                        borderWidth: selectedColor == color ? 2 : 0,
                        zIndex: 1000
                      }]}
                      activeOpacity={1}
                      onPress={() => {setSelectedColor(color); console.log('pressed')}}
                    >
                      <View style={{backgroundColor: COLORS[color], width: '100%', height: '100%', borderRadius: 100}}></View>
                    </TouchableOpacity>
                  ))}
                </View>
    
                <View style={{flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: 'row'}}>
                  {ICONS.map((Icon, index) => (
                    <TouchableOpacity
                      key={ICONS_STRING[index]}
                      style={[styles.chooseAvatar, {
                        backgroundColor: selectedColor !== 'grey400' ? COLORS[bgColor] : COLORS.fadedRed,
                        borderWidth: selectedAvatar === ICONS_STRING[index] ? 2 : 0, 
                        borderColor: selectedAvatar === ICONS_STRING[index] ? COLORS[selectedColor] : 'transparent',
                      }]}
                      onPress={() => setSelectedAvatar(ICONS_STRING[index])}
                      activeOpacity={1}
                    >
                      <Icon size={44} color={selectedColor !== 'grey400' ? COLORS[selectedColor] : COLORS.red} weight='regular'/>
                    </TouchableOpacity>
                  ))}
                </View>
      
                <View style={styles.bottomBtns}>
                  <TouchableOpacity
                    style={styles.bottomSheetBtns}
                    onPress={closeBottomSheet}
                    activeOpacity={1}
                  >
                    <Text style={{
                      fontFamily: 'bg-regular', 
                      fontSize: 14,
                      color: COLORS.grey900
                    }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.bottomSheetBtns, {backgroundColor: COLORS.green600, borderWidth: 0, }]}
                    onPress={() => {saveDisplay(selectedColor, selectedAvatar); closeBottomSheet()}}
                    activeOpacity={1}
                  >
                    <Text style={{
                      fontFamily: 'bg-regular', 
                      fontSize: 14,
                      color: COLORS.white
                    }}>Save</Text>
                  </TouchableOpacity>
                </View>            
              </>
            )}

            {bottomSheetTitle == 'Add to your Orbital' && (
              <View style={{padding: 16, flex: 1, gap: 20, justifyContent: 'center'}}>
                <InputField 
                  placeholder={'Enter a User ID to send an invite'}  
                  required={false}
                  value={inviteID} 
                  onChangeText={(text) => setInviteID(text)}
                />
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderRadius: 24,
                    width: '100%',
                    backgroundColor: COLORS.green600,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {sendInvite(inviteID); closeBottomSheet();}}
                  activeOpacity={1}
                >
                  <Text style={{
                    fontFamily: 'bg-regular', 
                    fontSize: 14,
                    color: COLORS.white
                  }}>Send an invite</Text>
                </TouchableOpacity>
              </View>
            )}

            {bottomSheetTitle == 'Edit your display name' && (

              <View style={{padding: 16, flex: 1, gap: 20, justifyContent: 'center'}}>
                <InputField 
                  placeholder={'Enter a User ID to send an invite'}  
                  required={false}
                  value={displayName} 
                  onChangeText={(text) => setDisplayName(text)}
                />
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderRadius: 24,
                    width: '100%',
                    backgroundColor: COLORS.green600,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {saveDisplayName(displayName); closeBottomSheet();}}
                  activeOpacity={1}
                >
                  <Text style={{
                    fontFamily: 'bg-regular', 
                    fontSize: 14,
                    color: COLORS.white
                  }}>Save display name</Text>
                </TouchableOpacity>
              </View>
            )}

          </BottomSheetView>
        </BottomSheet>
      </View>
    </PaperProvider>
  );
}