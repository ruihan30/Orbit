import { useState, createElement, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native'; 
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple, Portal, Modal } from 'react-native-paper';
import { Plus, User, PersonArmsSpread, Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse, PawPrint, PencilSimpleLine, X, CaretRight, SignOut } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import MasonryList from '@react-native-seoul/masonry-list';
import useAuthStore from '../store/useAuthStore.js';
import { useEffect } from 'react';
import { Button } from '../components/button.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utilities/firebaseConfig.js';
import { useAuth } from '../utilities/authProvider.js';
import { useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Shadow } from 'react-native-shadow-2';

const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
const RAINBOW_FADED = ['fadedRed', 'fadedOrange', 'fadedYellow', 'fadedGreen', 'fadedBlue', 'fadedPurple', 'fadedPink'];
const ICONS = [Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse];
const ICONS_STRING = ['Rabbit', 'Bird', 'Butterfly', 'Cat', 'Cow', 'Dog', 'FishSimple', 'Horse'];

export default function Orbital() {
  const navigation = useNavigation();
  const { user, fetchUser } = useAuthStore();
  const [data, setData] = useState(user?.reminders || []);
  const [connectedUsers, setConnectedUsers] = useState();
  const [deletedItem, setDeletedItem] = useState();

  const bottomSheetRef = useRef(null);
  const { width, height } = Dimensions.get('window');

  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const closeBottomSheet = () => bottomSheetRef.current?.close();

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
  }, []);

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

  const deleteReminder = async () => {
    const userDocRef = doc(db, "user", user.uid);
  
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        let reminders = userDoc.data().reminders || [];
  
        const updatedReminders = reminders.filter(
          (reminder) => reminder.postedAt.seconds !== deletedItem.postedAt.seconds
        );

        setData(updatedReminders);
  
        await updateDoc(userDocRef, {
          reminders: updatedReminders,
        });
  
        console.log("Reminder deleted successfully!");
        closeBottomSheet();
      }
    } catch (error) {
      console.error("Error deleting reminder:", error.message);
    }
  };

  useEffect(() => {
    const sortedReminders = [...user.reminders].sort((a, b) => b.postedAt.seconds - a.postedAt.seconds);
    setData(sortedReminders);
  }, [user])

  // when focused
  useFocusEffect(
    useCallback(() => {
      fetchUser();
      console.log('focused');
    }, [])
  );

  useEffect(() => {
    setData(user.reminders);
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
  }, [])

  return (
    <SafeAreaProvider style={{backgroundColor: COLORS.white, flex: 1}}>
      {/* <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(user.reminders)}></Button>
      <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(data)}></Button> */}
        
      <View style={[styles.reminderBoard, {flex: 1, alignItems: 'start'}]}>
        <View style={{elevation: 2, position: 'absolute', top: 12, left: 16, right: 16, zIndex: 2, overflow: 'hidden', borderRadius: 20, }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={{ width: '100%', overflow: 'visible', borderRadius: 20}}
          >
            <View style={[styles.flexRow, {
              paddingVertical: 10, 
              paddingHorizontal: 8, 
              zIndex: 2, 
              backgroundColor: COLORS.white, 
              borderRadius: 20,
              overflow: 'hidden',
              width: '100%'
            }]}>
              {connectedUsers && connectedUsers.map((user) => (
                <View  
                  key={user.uid}
                  style={{gap: 4, width: 84, alignItems: 'center', paddingHorizontal: 4}}
                >
                  <View style={[styles.profileImg, {
                    backgroundColor: COLORS[RAINBOW_FADED[RAINBOW.indexOf(user.profileColor)]],
                  }]}>
                    {ICONS_STRING.includes(user.profileIcon) ? (
                      createElement(ICONS[ICONS_STRING.indexOf(user.profileIcon)], {
                        size: 28,
                        color: COLORS[user.profileColor],
                        weight: 'regular'
                      })
                    ) : (
                      <User color={COLORS.grey700} weight="regular" />
                    )}
                  </View>
                  <Text style={{fontSize: 12, width: '100%', fontFamily: 'bg-regular', color: COLORS.grey600,}} numberOfLines={1} ellipsizeMode="tail" >{user.name}</Text>
                </View>
              ))}
                
            </View>
          </ScrollView>
        </View>

        <MasonryList
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2} 
          renderItem={({ item }) => <GridItem item={item} navigation={navigation} user={user} openBottomSheet={openBottomSheet} setDeletedItem={setDeletedItem}/>}
          contentContainerStyle={{padding: 4, paddingTop: 120}}
        />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['20%', '40%']}
        enablePanDownToClose={true}
        onChange={handleSheetChanges}
        style={{ zIndex: 100 }}
        handleComponent={shadow}
      >
        <BottomSheetView style={{flex: 1}}>
          {/* Title */}
          <View style={{paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.grey300}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}>
              Delete post?
            </Text>
          </View>
          <View style={{padding: 20, gap: 12}}>
            <Text style={{fontFamily: 'bg-regular', fontSize: 16, textAlign: 'center', color: COLORS.grey500}}>
              Are you sure you want to delete this post? This action cannot be undone.
            </Text>
            <Button 
              size='large' 
              type='fill' 
              label='Delete post' 
              onPress={() => {deleteReminder();}}
              fillColor={COLORS.error}
            ></Button>
          </View>
        </BottomSheetView>
      </BottomSheet>

    </SafeAreaProvider>
  );
}

const GridItem = ({ item, navigation, user, openBottomSheet, setDeletedItem }) => {
  const formatPostedAt = (timestamp) => {
    if (!timestamp?.seconds) return "Invalid Date";
  
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-GB", {
      weekday: "short", // Thu
      day: "2-digit", // 13
      month: "short", // Mar
    });
  };

  return (
    <Pressable 
      style={[styles.reminderCard, {backgroundColor: COLORS[item.postColor]}]} 
      onPress={() => {
        if (user.uid == item.recipient) navigation.navigate('ReminderDetails', { post: item });
      }}
      onLongPress={() => {
        openBottomSheet();
        setDeletedItem(item);
      }}
    >
      <View style={{gap: 2}}>
        <Text style={{fontFamily: 's-semibold', color: COLORS.grey800, fontSize: 16 }}>{item.title}</Text>
        {item.message && 
          <Text style={{fontFamily: 'bg-regular', color: COLORS.grey500, fontSize: 16 }}>{item.message}</Text>
        }
      </View>
      <View style={[styles.flexRow, {gap: 6}]}>
        <View style={{
          width: 36, 
          height: 36, 
          backgroundColor: item.profileColor ? COLORS[RAINBOW_FADED[RAINBOW.indexOf(item.profileColor)]] : COLORS.grey300, 
          borderWidth: 0.5,
          borderColor: COLORS[item.profileColor],
          borderRadius: 100,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {ICONS_STRING.includes(item.profileIcon) ? (
            createElement(ICONS[ICONS_STRING.indexOf(item.profileIcon)], {
              size: 20,
              color: COLORS[item.profileColor],
              weight: 'regular'
            })
          ) : (
            <User color={COLORS.grey700} weight="regular" size={24}/>
          )}
        </View>
        <View>
          <Text style={{fontFamily: 'bg-semibold', color: COLORS.grey700, fontSize: 14 }}>{item.postedBy}</Text>
          <Text style={{fontFamily: 'bg-medium', color: COLORS.grey500, fontSize: 12 }}>
            {formatPostedAt(item.postedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
