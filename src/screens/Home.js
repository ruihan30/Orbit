import { useState, useCallback, useEffect, createElement, useRef } from 'react';
import { Image, View, Text, Pressable, ScrollView, Switch, RefreshControl, Dimensions } from 'react-native';
import { User, CaretDown, Pill, Sparkle, Alarm, Planet } from 'phosphor-react-native';
import { Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse } from 'phosphor-react-native';
import { TouchableRipple, ActivityIndicator, Menu } from 'react-native-paper';
import { COLORS } from '../colors/colors.js';
import { Chip } from '../components/chip.js';
import { Button } from '../components/button.js';
import { styles } from '../styles/styles.js';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../store/useAuthStore.js';
import { useFocusEffect } from '@react-navigation/native'; 
import useAlarmStore from '../store/useAlarmStore.js';
import useMedStore from '../store/useMedStore.js';
import * as Notifications from "expo-notifications";
import * as Permissions from 'expo-permissions';
import NoAlarms from '../../assets/default_states/no_alarms.svg';

import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";

const ICONS = [Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse];
const ICONS_STRING = ['Rabbit', 'Bird', 'Butterfly', 'Cat', 'Cow', 'Dog', 'FishSimple', 'Horse'];

export default function Home({ onNavigateTo, route }) {
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  // const user = useAuthStore((state) => state.user);
  const [pushToken, setPushToken] = useState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(false);

  const { medications, fetchMedications } = useMedStore();
  const { alarms, fetchAlarms, updateAlarm } = useAlarmStore(); 
  const { fetchUser, user } = useAuthStore();
  const [fetchingFirebase, setFetchingFirebase] = useState(false);
  
  const [localMedications, setLocalMedications] = useState();
  const [groupedAlarms, setGroupedAlarms] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState();

  const [isVisible, setIsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const { width, height } = Dimensions.get('window');

  const { today, week } = getCurrentWeek();
  const [selectedDay, setSelectedDay] = useState(getFormattedDate(today));
  const [alarmsForSelectedDay, setAlarmsForSelectedDay] = useState(groupedAlarms?.[today.day] || []);

  const scrollViewRef = useRef(null);
  const targetRef = useRef(null);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const handleSelect = (value) => {
    setSelectedUser(value);
    fetchConnectedUsersAlarms(value.uid);
    closeMenu();
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  async function fetchScheduledNotifications() {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(JSON.stringify(notifications, null, 2));
  }

  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification action received:', response);
    if (response.actionIdentifier === 'MARK_TAKEN') {
      console.log('Mark as Taken button pressed!');
      // Handle the action (e.g., mark as taken)
    }
  });

  const handleScroll = (event) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;

    if (contentOffsetY > 40) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  function getCurrentWeek() {
    const today = new Date(); 
    const dayOfWeek = today.getDay(); 
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'short' });
    const currentDate = today.getDate(); 
    const currentMonth = today.toLocaleDateString('en-US', { month: 'long' }); 
    const currentYear = today.getFullYear();
  
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(currentDate - dayOfWeek);
  
    // Generate an array for the week
    const week = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i); 
      week.push({
        day: weekDay.toLocaleDateString('en-US', { weekday: 'short' }), 
        date: weekDay.getDate(), 
        month: weekDay.toLocaleDateString('en-US', { month: 'long' }),
        year: weekDay.getFullYear(), 
      });
    }
  
    return { today: { date: currentDate, month: currentMonth, year: currentYear, day: currentDay }, week };
  };

  function getFormattedDate(dayData) {
    return `${dayData.date} ${dayData.month} ${dayData.year}, ${dayData.day}`;
  };

  const groupAlarmsByDay = (alarms) => {
    const grouped = {};
    if (alarms) {
      alarms.forEach((alarm) => {
        alarm.days.forEach((day) => {
          if (!grouped[day]) {
            grouped[day] = [];
          }
          grouped[day].push(alarm);
        });
      });
    };
    return grouped;
  };

  const convertTimeTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (modifier === "pm" && hours !== 12) {
      hours += 12; // Convert PM to 24-hour format
    } else if (modifier === "am" && hours === 12) {
      hours = 0; // Convert 12 AM to 00:00
    }
  
    return hours * 60 + minutes; // Convert time to total minutes for easy sorting
  };

  const handleToggleEnabled = (alarmId) => {
    const updatedAlarm = alarms.find((alarm) => alarm.id === alarmId);
    
    if (updatedAlarm) {
      const updatedAlarmData = { ...updatedAlarm, enabled: !updatedAlarm.enabled };
      
      updateAlarm(updatedAlarmData);
    
      const updatedAlarmsForDay = alarmsForSelectedDay.map((alarm) => {
        if (alarm.id === alarmId) {
          return { ...alarm, enabled: !alarm.enabled };
        }
        return alarm;
      });
      setAlarmsForSelectedDay(updatedAlarmsForDay);
    }
  };

  const onRefresh = async () => {
    setLoading(true);
    await fetchUser();
    await fetchMedications();
    await fetchAlarms(); 
    setLoading(false);
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

  const fetchConnectedUsersAlarms = async (id) => {
    try {
      const alarmsCollection = collection(db, "user", id, "alarms");
      const querySnapshot = await getDocs(alarmsCollection);
      if (!querySnapshot.empty) {
        const fetchedAlarms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        console.log(fetchedAlarms);
        const grouped = groupAlarmsByDay(fetchedAlarms);
        setGroupedAlarms(grouped);
        const alarmsForDay = grouped?.[today.day] || [];
        alarmsForDay.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
        setSelectedDay(getFormattedDate(today));
        setAlarmsForSelectedDay(alarmsForDay || []);
      } else {
        console.log("No alarms found");
      }

      const medicationsCollection = collection(db, "user", id, "medications");
      const snapshot = await getDocs(medicationsCollection);
      if (!snapshot.empty) {
        const fetchedMedications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        console.log(fetchedMedications);
        setLocalMedications(fetchedMedications);
      } else {
        console.log("No alarms found");
      }
  
    } catch (error) {
      console.log("Error fetching connected users alarms:", error);
    }
  };

  const scrollToTarget = () => {
    if (targetRef.current) {
      targetRef.current.measureLayout(scrollViewRef.current, (x, y) => {
        scrollViewRef.current.scrollTo({ y, animated: true });
      });
    }
  };

  useEffect(() => {
    if (!fetchingFirebase) {
      const grouped = groupAlarmsByDay(alarms);
      setGroupedAlarms(grouped);
      const alarmsForDay = grouped?.[today.day] || [];
      alarmsForDay.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
      setSelectedDay(getFormattedDate(today));
      setAlarmsForSelectedDay(alarmsForDay || []);

      setLocalMedications(medications);

      const fetchData = async () => {
        try {
          const connectedUsers = await fetchConnectedUsers(user.connectedUsers);
          setConnectedUsers(connectedUsers);
          setSelectedUser(user);
        } catch (error) {
          // console.error("Error fetching connected users:", error);
        }
      };
  
      fetchData();
    }

    setFetchingFirebase(false);
    setLoading(false);
  }, [alarms, fetchingFirebase]);

  // when focused after coming back from another page
  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchMedications();
      fetchAlarms();
      // if (route?.params?.message) {
      //   console.log('Data received from previous screen:', route.params.message);
      // } else {
      //   console.log('no params passed back')
      // }
    }, [])
  );

  // first load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchUser();
        await fetchMedications();
        await fetchAlarms();
        setFetchingFirebase(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [])

  // Push notifications
  useEffect(() => {

    // Notification received while the app is in the foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    // Handle notifications when app is in the background or terminated
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
    });

    // createNotificationChannel();

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [])

  // disable goback
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading && fetchingFirebase) 
    return (
      <View 
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIndicator animating={true}/>
      </View>
    );

  return (
    <View style={{backgroundColor: COLORS.bg, flex: 1}}>

          {/* <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(alarms)}></Button>
          <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(groupedAlarms)}></Button> */}
          {/* <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(alarmsForSelectedDay)}></Button> */}
          {/* <Button size='small' type='fill' label='Add Alarm' onPress={() => navigation.navigate('AlarmDetails')}></Button> */}
          {/* <Button size='small' type='fill' label='Test navigating to other tabs' onPress={() => onNavigateTo(1)}></Button> */}
          {/* <Button size='small' type='fill' label='Test auth store' onPress={() => console.log(selectedUser)}></Button>
          <Button size='small' type='fill' label='fetch scheduled notifications' onPress={async () => {await fetchScheduledNotifications();}}></Button> */}
          {/* <Button size='small' type='fill' label='Test notifications' onPress={() => navigation.navigate('OnboardingMedications')}></Button> */}
          {/* <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(image)}></Button> */}
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
            ref={scrollViewRef}
          >
            <View style={{paddingVertical: 16, paddingHorizontal: 20}}>
              <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800}}>Hello,</Text>
              <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800}}>{user?.name}</Text>
            </View>

            <View style={[styles.flexRow, {paddingHorizontal: 12, gap: 8, marginBottom: 8}]}>

              <Pressable style={styles.homeComponent} onPress={scrollToTarget}>
                <View style={{backgroundColor: COLORS.pink200, padding: 10, borderRadius: 14, alignSelf: 'flex-start'}}>
                  <Alarm size={20} color={COLORS.pink700}/>
                </View>
                <View>
                  <Text style={styles.homeComponentHeader}>View Alarms</Text>
                  <Text style={styles.homeComponentText}>Keep your medication schedule on track. </Text>
                </View>
              </Pressable>

              <Pressable style={styles.homeComponent} onPress={() => {onNavigateTo(3)}}>
                <View style={{backgroundColor: COLORS.pink200, padding: 10, borderRadius: 14, alignSelf: 'flex-start'}}>
                  <Sparkle size={20} color={COLORS.pink700} />
                </View>
                <View>
                  <Text style={styles.homeComponentHeader}>Ask CareBot</Text>
                  <Text style={styles.homeComponentText}>Got questions? Chat with CareBot to get helpful health tips.</Text>
                </View>
              </Pressable>

            </View>

            <View style={[styles.flexRow, {paddingHorizontal: 12, gap: 8, marginBottom: 20}]}>

              <Pressable style={styles.homeComponent} onPress={() => {onNavigateTo(1)}}>
                <View style={{backgroundColor: COLORS.pink200, padding: 10, borderRadius: 14, alignSelf: 'flex-start'}}>
                  <Pill size={20} color={COLORS.pink700} />
                </View>
                <View>
                  <Text style={styles.homeComponentHeader}>Manage Medications</Text>
                  <Text style={styles.homeComponentText}>Track your medications and ensure you're staying on top of your doses.</Text>
                </View>
              </Pressable>

              <Pressable style={styles.homeComponent} onPress={() => {onNavigateTo(2)}}>
                <View style={{backgroundColor: COLORS.pink200, padding: 10, borderRadius: 14, alignSelf: 'flex-start'}}>
                  <Planet size={20} color={COLORS.pink700} />
                </View>
                <View>
                  <Text style={styles.homeComponentHeader}>Connect in Your Orbital</Text>
                  <Text style={styles.homeComponentText}>Stay connected with your support network and post reminders for each other.</Text>
                </View>
              </Pressable>

            </View>

            {/* Calendar */}
            <View style={{padding: 12}}>
              <View style={styles.calendar}>
                <Text style={{fontFamily: 's-semibold', fontSize: 16, color: COLORS.grey450, textAlign: 'center'}}> {today.month} </Text>
                <View style={styles.week}>
                  {week.map((dayData, index) => {
                    const isToday = dayData.date === today.date && dayData.month === today.month;
                    const isSelected = selectedDay === getFormattedDate(dayData);

                    if (isToday) {
                      return (
                        <Pressable 
                          key={index} 
                          style={styles.weekBtnToday} 
                          onPress={() => {
                            setSelectedDay(getFormattedDate(dayData));
                            const alarmsForDay = groupedAlarms?.[dayData.day] || [];
                            alarmsForDay.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
                            setAlarmsForSelectedDay(alarmsForDay || []);
                          }}>
                          <Text style={{fontFamily: 's-regular', fontSize: 14, color: COLORS.white}}>{dayData.day}</Text>
                          <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.white}}>{dayData.date}</Text>
                        </Pressable>
                      );
                    } else {
                      return (
                        <Pressable 
                          key={index} 
                          style={isSelected ? styles.weekBtnSelected : styles.weekBtn} 
                          onPress={() => { 
                            setSelectedDay(getFormattedDate(dayData));
                            const alarmsForDay = groupedAlarms?.[dayData.day] || [];
                            alarmsForDay.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
                            setAlarmsForSelectedDay(alarmsForDay || []);
                          }}>
                          <Text style={{fontFamily: 's-regular', fontSize: 14, color: COLORS.grey450}}>{dayData.day}</Text>
                          <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800}}>{dayData.date}</Text>
                        </Pressable>
                      );
                    }
                  })}
                </View>
              </View>
            </View>
            
            <View style={{paddingHorizontal: 12, paddingTop: 8}}>
              
              {/* Dropdown */}
              <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                  <Pressable style={styles.userSelection} onPress={() => openMenu()} >
                    <View style={[styles.flexRow, {gap: 8, flex: 1}]}>
                      <View 
                        style={{
                          // height: 32, 
                          // width: 32, 
                          padding: 12,
                          backgroundColor: selectedUser ? COLORS[selectedUser.profileColor] : COLORS.grey300, 
                          borderRadius: 100, 
                          alignItems: 'center', 
                          justifyContent: 'center',
                        }}>
                        {ICONS_STRING.includes(selectedUser?.profileIcon) ? (
                          createElement(ICONS[ICONS_STRING.indexOf(selectedUser.profileIcon)], {
                            size: 22,
                            color: COLORS.white,
                            weight: 'fill'
                          })
                        ) : (
                          <User color={COLORS.white} weight="regular" size={18}/>
                        )}
                      </View>
                      <Text style={{fontFamily: 's-semibold', fontSize: 14, color: COLORS.grey800, flex: 1}} numberOfLines={1} ellipsizeMode="tail">
                        {selectedUser?.name} {'\'s Alarms'}
                      </Text>
                    </View>
                    
                    {connectedUsers &&  <CaretDown size={20} color={COLORS.grey800} weight='regular' />}

                  </Pressable>
                }
                elevation={1}
                statusBarHeight={40}
                anchorPosition='bottom'
                style={{borderRadius: 20, width: width-24 }}
                contentStyle={{borderRadius: 16, paddingVertical: 8, paddingRight: 8, overflow: 'hidden', backgroundColor: COLORS.white,}}
              >
                {selectedUser !== user && (
                  <Menu.Item 
                    titleStyle={{fontFamily: 'bg-regular', color: COLORS.grey800,}} 
                    onPress={() => handleSelect(user)} 
                    title={`${user?.name}'s Alarms`} 

                  />
                )}

                {connectedUsers && connectedUsers.map((user) => 
                  user !== selectedUser &&(
                    <Menu.Item
                      key={user.uid}
                      titleStyle={{fontFamily: 'bg-regular', color: COLORS.grey800,}} 
                      onPress={() => handleSelect(user)} 
                      title={user?.name}
                    />
                ))}
              </Menu>
              
              {/* Alarms */}
              <View style={styles.alarms} ref={targetRef}>

                {loading ? (
                  <View 
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 32
                    }}>
                      <ActivityIndicator animating={true}/>
                  </View>
                ):(
                  !loading && selectedUser && alarmsForSelectedDay.length > 0 ? (
                    alarmsForSelectedDay.map((alarm, index) => (
                      <TouchableRipple
                        style={[styles.alarmItem, {
                          backgroundColor: selectedUser == user ? COLORS.white : COLORS.grey100
                        }]} 
                        key={index}
                        onPress={() => navigation.navigate('AlarmDetails', { alarm: alarm })}
                        rippleColor={'rgba(51,51,51,0.25)'}
                        borderless={true}
                        delayPressIn={80}
                        disabled={selectedUser == user ? false : true}
                      >
                        <View>
                          <View style={[styles.flexRow, {gap: 16, justifyContent: 'space-between', paddingLeft: 12, paddingVertical: 8, marginBottom: 8}]}>
                            <View style={[styles.flexColumn, {alignItems: 'flex-start'}]}>
                              <Text style={{
                                fontFamily: 's-semibold', 
                                fontSize: 28, 
                                color: selectedUser == user ? COLORS.grey800 : COLORS.grey500, 
                                textAlign: 'center'
                              }}>
                                {alarm.time}
                              </Text>
                            </View>
                            <Switch 
                              style={{height: 20}}
                              value={alarm.enabled}
                              onValueChange={() => handleToggleEnabled(alarm.id)}
                              trackColor={{false: COLORS.grey400, true: COLORS.pink300}}
                              thumbColor={alarm.enabled ? COLORS.pink500 : COLORS.grey200}
                            />
                          </View>
                          
                          <View style={{gap: 16, paddingBottom: 16}}>
                            {alarm.medicationIds.map((medicationId) => (
                              localMedications
                                .filter((medication) => medication.id === medicationId)
                                .map((med) => (
                                  <View style={[styles.flexColumn, {gap: 8, flex: 1}]} key={med.id}>
                                    <View style={styles.alarmMedicationRipple} >
                                      <View style={styles.alarmMedication}>
                                        <View style={{height: 100, width: 100, backgroundColor: COLORS.grey200, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}>
                                          {
                                            med.image ? (<Image source={{ uri: med.image }} style={[styles.medicationImg, {zIndex: 1}]} />) 
                                            : <Pill size={44} color={COLORS.grey400}/>
                                          }
                                        </View>
                                        <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                                          <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.pink700, width: '100%'}} numberOfLines={1}>
                                            {med.name}
                                          </Text>
                                          <View style={{justifyContent: 'flex-end', flex: 1}}>
                                            <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>{med.purpose}</Text>
                                            <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>{med.dosage} {med.medicineType}</Text>
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                    <View style={[styles.flexRow, {gap: 4, width: '100%', flexWrap: 'wrap', paddingHorizontal: 8}]}>
                                      {med.sideEffects.map((sideEffect) => (
                                        <Chip label={sideEffect} key={sideEffect}/>
                                      ))}
                                    </View>
                                  </View>
                                ))
                            ))}
                          </View>
                        </View>
                      </TouchableRipple>
                  ))) : (
                    <View style={[styles.defaultStateContainer, {height: height - 362}]}>
                      <NoAlarms />
                      
                      <Text style={styles.defaultStateHeader}>No alarms set</Text> 
                      <Text style={styles.defaultStateText}>You haven't set any alarms yet.{'\n'}Tap the + button to create one and never miss a dose!</Text>
                    </View>
                  )
                )}


              </View>
            </View>

          </ScrollView>
        
    </View>
  );
}