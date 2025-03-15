import React from 'react';
import { useState, useRef, useEffect, useCallback, createElement } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Alert, Dimensions, BackHandler, Keyboard } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, Menu, Divider, PaperProvider, Modal, Portal, Snackbar } from 'react-native-paper';
import { EnvelopeSimple, X, CaretRight, SignOut } from 'phosphor-react-native';
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
import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import AsyncStorage  from '@react-native-async-storage/async-storage';

export default function Notifications() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [localUser, setLocalUser] = useState();
  const [localInvites, setLocalInvites] = useState();

  const [toastMsg, setToastMsg] = useState('');
  const [toastMsgColor, setToastMsgColor] = useState();
  const [toastVisible, setToastVisible] = useState(false);
  
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const bottomSheetRef = useRef(null);
  const { width, height } = Dimensions.get('window');

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

  const test = async (id) => {
    const userDocRef = doc(db, "user", user.uid);

    try {
      // const userDoc = await getDoc(userDocRef);
      // const userData = userDoc.data();
      // const updatedInvites = userData.invites.filter(invite => invite.uid !== id);

      await updateDoc(userDocRef, { 
        connectedUsers: arrayUnion('asdnaonshciun')
       });
  
      console.log("Invites updated successfully!");
    } catch (error) {
      console.error("Error updating invites:", error.message);
    }
  }

  const acceptInvite = async (id) => {
    const userDocRef = doc(db, "user", user.uid);
    const otherUserDocRef = doc(db, "user", id);

    try {
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const updatedInvites = userData.invites.filter(invite => invite.uid !== id);

      await updateDoc(userDocRef, { 
        invites: updatedInvites,
        connectedUsers: arrayUnion(id)
      });

      await updateDoc(otherUserDocRef, { 
        connectedUsers: arrayUnion(user.uid)
      });

      setToastMsg('Congrats! Both of you are in each other\'s orbit!');
      setToastMsgColor('success')
      onToggleSnackBar();
  
      console.log("Invites updated successfully!");
    } catch (error) {
      console.error("Error updating invites:", error.message);
    }
  }

  useEffect(() => {
    setLocalUser(user);
    setLocalInvites(user.invites)
  }, [])
  
  return (
    <PaperProvider>
      <View style={{backgroundColor: COLORS.white, position: 'relative', flex: 1}}>
        
        <ScrollView style={{overflow: 'visible', flex: 1, position: 'relative'}} >
          
          {localInvites && localInvites.map((invite) => {
            const date = invite.sentAt ? new Date(invite.sentAt.seconds * 1000) : null;
            return (
              <View
                key={invite.uid}
                style={[styles.flexRow, {justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, padding: 12, borderBottomWidth: 1, borderColor: COLORS.grey200}]}
              >
                <View style={{borderRadius: 12, backgroundColor: COLORS.green200, padding: 12}}>
                  <EnvelopeSimple size={28} color={COLORS.green600} />
                </View>

                <View style={{flex: 1}}>
                  <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600}}>
                    <Text style={{fontFamily: 'bg-medium', color: COLORS.grey900}}>{invite.name}</Text> invited you into their orbit.
                  </Text>
                  <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 12, marginBottom: 12}}>
                    {date?.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + 
                        date?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase()}
                  </Text>
                  <Button 
                    size='small' 
                    type='fill' 
                    label='Accept Invite' 
                    fillColor={COLORS.grey500}
                    onPress={() => {
                      setLocalInvites(prevInvites => prevInvites.filter(i => i.uid !== invite.uid));
                      acceptInvite(invite.uid);
                    }}
                    rippleColor={'rgba(51,51,51,0.25)'}
                  ></Button>
                </View>
                
              </View>
            );
          })}

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

          
          </BottomSheetView>
        </BottomSheet>
      </View>
    </PaperProvider>
  );
}