import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { EnvelopeSimple, X } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../colors/colors.js';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import useAuthStore from '../store/useAuthStore.js';
import { db } from '../utilities/firebaseConfig.js';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import NoNotifications from '../../assets/default_states/no_notifications.svg';

export default function Notifications() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [localUser, setLocalUser] = useState();
  const [localInvites, setLocalInvites] = useState([]);

  const [toastMsg, setToastMsg] = useState('');
  const [toastMsgColor, setToastMsgColor] = useState();
  const [toastVisible, setToastVisible] = useState(false);

  const onToggleSnackBar = () => setToastVisible(!toastVisible);
  const onDismissSnackBar = () => setToastVisible(false);

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

  console.log(localInvites)
  
  return (
    <View style={{backgroundColor: COLORS.white, position: 'relative', flex: 1}}>
      
      <ScrollView style={{overflow: 'visible', flex: 1, position: 'relative'}} >
        
        {localInvites.length > 0 ? (localInvites.map((invite) => {
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
        })) : (
          <View style={styles.defaultStateContainer}>
            <NoNotifications />
            
            <Text style={styles.defaultStateHeader}>No new notifications</Text> 
            <Text style={styles.defaultStateText}>You're all caught up! {'\n'} Check back later for updates and reminders.</Text>
          </View>
        )}

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

    </View>
  );
}