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
import { collection, getDocs, addDoc, getDoc, doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ICONS = [Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse];
const ICONS_STRING = ['Rabbit', 'Bird', 'Butterfly', 'Cat', 'Cow', 'Dog', 'FishSimple', 'Horse'];
const dayToWeekdayIndex = { Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7, };

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

  // Notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  async function cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All scheduled notifications have been canceled");
  }

  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  async function fetchScheduledNotifications() {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(JSON.stringify(notifications, null, 2));
  };

  async function scheduleNotification(alarm) {
    const { time, days } = alarm;
    const [timeString, ampm] = time.split(' ');
    const [hour, minute] = timeString.split(':').map(num => parseInt(num, 10));

    let hoursIn24Format = hour;
    if (ampm === 'pm' && hour !== 12) hoursIn24Format = hour + 12;
    if (ampm === 'am' && hour === 12) hoursIn24Format = 0;

    console.log(hoursIn24Format, minute);
  
    if (alarm.frequency === 'daily') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to take your medication",
          body: "Don't forget to take your medication. Tap here to check your medications or confirm you've taken it!",
          data: { data: alarm },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hoursIn24Format,
          minute: minute,
        },
      });

    } else if ((alarm.frequency === 'custom' || alarm.frequency === 'weekly') && days.length > 0) {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
      for (let day of days) {
        const dayIndex = daysOfWeek.indexOf(day);
  
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to take your medication",
            body: "Don't forget to take your medication. Tap here to check your medications or confirm you've taken it!",
            data: { data: alarm },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: dayIndex + 1, 
            hour: hoursIn24Format,
            minute: minute,
          },
        });
  
        console.log(`Scheduled notification for ${day} at ${hoursIn24Format}:${minute}`);
      }
    }
  };

  async function cancelNotificationByAlarmId(targetAlarmId) {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
  
    for (const notification of notifications) {
      const alarmId = notification.content?.data?.data?.id;
      
      if (alarmId === targetAlarmId) {
        const identifier = notification.identifier;
        await Notifications.cancelScheduledNotificationAsync(identifier);
        console.log(`Cancelled notification with identifier: ${identifier}`);
        // return;
      }
    };
  
    // console.log(`No notification found for alarmId: ${targetAlarmId}`);
  };

  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification action received:', response);
    if (response.actionIdentifier === 'MARK_TAKEN') {
      console.log('Mark as Taken button pressed!');
      // Handle the action (e.g., mark as taken)
    }
  });

  // misc.
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
    console.log(updatedAlarm);

    if (updatedAlarm.enabled == true) {
      cancelNotificationByAlarmId(updatedAlarm.id);
    }
    else scheduleNotification(updatedAlarm);
    
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
    setFetchingFirebase(true);
    // setLoading(false);
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
        setSelectedDay(getFormattedDate(today));
        setAlarmsForSelectedDay([]);
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
    if (fetchingFirebase) {
      console.log(alarms);
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
      setFetchingFirebase(false);
      setLoading(false);
    }
  }, [alarms, fetchingFirebase]);

  // when focused after coming back from another page
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          await fetchUser();
          await fetchMedications();
          await fetchAlarms();
          setFetchingFirebase(true);
          // console.log('data fetched');
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
      console.log('focused');
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
        console.log('data fetched');
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
 
  // ONSNAPSHOT
  // useEffect(() => {
  //   const auth = getAuth();
  //   const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       const medicationsCollection = collection(db, "user", user.uid, "medications");

  //       const unsubscribeMedications = onSnapshot(medicationsCollection, (querySnapshot) => {
  //         const medicationsList = querySnapshot.docs.map(doc => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));
  //         console.log(medicationsList);
  //       });

  //       return () => {
  //         unsubscribeMedications();
  //       };
  //     } else {
  //       console.warn("No user logged in, skipping medication fetch");
  //     }
  //   });

  //   return () => {
  //     unsubscribeAuth();
  //   };
  // }, [])

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
          <Button size='small' type='fill' label='Test auth store' onPress={() => console.log(alarms)}></Button>
          <Button size='small' type='fill' label='cancel all scheduled notifications' onPress={async () => {await cancelAllScheduledNotifications();}}></Button>
          {/* <Button size='small' type='fill' label='fetch scheduled notifications' onPress={async () => {await fetchScheduledNotifications();}}></Button> */}
          {/* <Button size='small' type='fill' label='cancel scheduled notification' onPress={async () => {await cancelNotificationByAlarmId('E999sYVpl5ekQbyRQ7RP');}}></Button> */}
          {/* <Button size='small' type='fill' label='Test notifications' onPress={() => navigation.navigate('OnboardingMedications')}></Button> */}
          {/* <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(image)}></Button> */}
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
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
            <View style={{padding: 12}} ref={targetRef}>
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
              <View style={styles.alarms}>

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
                          backgroundColor: selectedUser.uid == user.uid ? COLORS.white : COLORS.grey100
                        }]} 
                        key={index}
                        onPress={() => navigation.navigate('AlarmDetails', { alarm: alarm })}
                        rippleColor={'rgba(51,51,51,0.25)'}
                        borderless={true}
                        delayPressIn={80}
                        disabled={selectedUser.uid == user.uid ? false : true}
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