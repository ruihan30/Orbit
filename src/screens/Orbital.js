import { useState, createElement, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; 
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { Plus, User, PersonArmsSpread, Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse, PawPrint, PencilSimpleLine, X, CaretRight, SignOut } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import MasonryList from '@react-native-seoul/masonry-list';
import useAuthStore from '../store/useAuthStore.js';
import { useEffect } from 'react';
import { Button } from '../components/button.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utilities/firebaseConfig.js';
import { useAuth } from '../utilities/authProvider.js';

const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
const RAINBOW_FADED = ['fadedRed', 'fadedOrange', 'fadedYellow', 'fadedGreen', 'fadedBlue', 'fadedPurple', 'fadedPink'];
const ICONS = [Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse];
const ICONS_STRING = ['Rabbit', 'Bird', 'Butterfly', 'Cat', 'Cow', 'Dog', 'FishSimple', 'Horse'];

export default function Orbital() {
  // const DATA = [
  //   { id: '1', title: 'Doctor Appointment', message: 'Tuesday 3 March, 4.30pm', user: 'Xiao Ming', color: COLORS.fadedRed },
  //   { id: '2', title: 'Diet', message: 'Avoid oily and greasy food, more protein', user: 'Xiao Ming', color: COLORS.fadedOrange },
  //   { id: '3', title: 'Exercise', message: '30-minute walk in the park', user: 'David', color: COLORS.fadedGreen },
  //   { id: '4', title: 'Hydration', message: 'Drink at least 8 glasses of water today', user: 'Priya', color: COLORS.fadedYellow },
  //   { id: '5', title: 'Diet', message: 'Avoid oily and greasy food, more protein', user: 'Xiao Ming', color: COLORS.fadedBlue },
  //   { id: '6', title: 'Exercise', message: '30-minute walk in the park', user: 'David', color: COLORS.fadedPurple },
  //   { id: '7', title: 'Hydration', message: 'Drink at least 8 glasses of water today', user: 'Priya', color: COLORS.fadedPink },
  // ];
  // const user = useAuthStore((state) => state.user);
  const { user, fetchUser } = useAuthStore();
  const [data, setData] = useState(user?.reminders || []);
  const [connectedUsers, setConnectedUsers] = useState();

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

  useEffect(() => {
    setData(user.reminders);
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
      <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(user)}></Button>
      <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(data)}></Button>
        
      <View style={[styles.reminderBoard, {flex: 1, alignItems: 'start'}]}>
        <View style={[styles.flexRow, {paddingVertical: 10, paddingHorizontal: 8, position: 'absolute', top: 12, left: 16, right: 16, zIndex: 2, backgroundColor: COLORS.white, borderRadius: 20, elevation: 2}]}>
          {connectedUsers && connectedUsers.map((user) => (
            <View  
              key={user.uid}
              style={{gap: 4, width: 80, alignItems: 'center', paddingHorizontal: 4,}}
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

        <MasonryList
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2} 
          renderItem={({ item }) => <GridItem item={item} />}
          contentContainerStyle={{padding: 4, paddingTop: 120}}
        />
      </View>

    </SafeAreaProvider>
  );
}

const GridItem = ({ item }) => (
  <View style={[styles.reminderCard, {backgroundColor: COLORS[item.postColor]}]}>
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
        <Text style={{fontFamily: 'bg-medium', color: COLORS.grey500, fontSize: 12 }}>Thu, 13 Mar</Text>
      </View>
    </View>
  </View>
);
