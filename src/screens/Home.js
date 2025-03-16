import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch, TouchableOpacity, TouchableHighlight, RefreshControl } from 'react-native';
import { House, Bell, User, CaretDown, Minus, ArrowCircleDown, Plus, Scroll, Pill } from 'phosphor-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appbar, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { COLORS } from '../colors/colors.js';
import { Chip } from '../components/chip.js';
import { Button } from '../components/button.js';
import { styles } from '../styles/styles.js';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../assets/logo_name_nopad.svg';
import { useAuth } from '../utilities/authProvider.js';
import { getAuth, signOut } from 'firebase/auth';
import useAuthStore from '../store/useAuthStore.js';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native'; 
import { shallow } from 'zustand/shallow';
import useAlarmStore from '../store/useAlarmStore.js';
import useMedStore from '../store/useMedStore.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";

export default function Home({ onNavigateTo, route }) {
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(false);
  const { medications, fetchMedications } = useMedStore();
  const { alarms, fetchAlarms, updateAlarm } = useAlarmStore(); 
  const { fetchUser } = useAuthStore();
  const [groupedAlarms, setGroupedAlarms] = useState(null);
  const [alarmsFetched, setAlarmsFetched] = useState(false); 

  const [isVisible, setIsVisible] = useState(false);

  const { today, week } = getCurrentWeek();
  const [selectedDay, setSelectedDay] = useState(getFormattedDate(today));
  const [alarmsForSelectedDay, setAlarmsForSelectedDay] = useState(groupedAlarms?.[today.day] || []);

  const pickImage = async () => {
    // Request permission to access the gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Required", "You need to grant permission to access the gallery.");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Enables cropping
      aspect: [1, 1], // Crop aspect ratio (optional)
      quality: 1, // Image quality (0 - 1)
    });

    // If the user didn't cancel, update the state with the selected image
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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

  useEffect(() => {
    if (!loading) {
      const grouped = groupAlarmsByDay(alarms);
      setGroupedAlarms(grouped);
      const alarmsForDay = grouped?.[today.day] || [];
      alarmsForDay.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
      setSelectedDay(getFormattedDate(today));
      setAlarmsForSelectedDay(alarmsForDay || []);
    }
  }, [alarms, loading]);

  // useEffect(() => {
  //   if (route?.params?.message) {
  //     console.log('Data received from previous screen:', route.params.message);
  //   } else {
  //     console.log('no params passed back')
  //   }
  // }, [route?.params?.message]);

  // when focused
  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchMedications();
      fetchAlarms();
      console.log('focused');
      if (route?.params?.message) {
        console.log('Data received from previous screen:', route.params.message);
      } else {
        console.log('no params passed back')
      }
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
        setLoading(false);
        console.log('mounted');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [])
  
  return (
    <SafeAreaProvider style={{backgroundColor: COLORS.bg, flex: 1}}>
      <GestureHandlerRootView>

        {/* <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(alarms)}></Button>
        <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(groupedAlarms)}></Button>
        <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(alarmsForSelectedDay)}></Button> */}
        {/* <Button size='small' type='fill' label='Add Alarm' onPress={() => navigation.navigate('AlarmDetails')}></Button> */}
        {/* <Button size='small' type='fill' label='Test navigating to other tabs' onPress={() => onNavigateTo(1)}></Button> */}
        {/* <Button size='small' type='fill' label='Test auth store' onPress={() => console.log(user)}></Button> */}
        {/* <Button size='small' type='fill' label='Test image picker' onPress={() => console.log(image)}></Button> */}
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >

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
            <Pressable style={styles.userSelection} >
              <View style={[styles.flexRow, {gap: 8}]}>
                <View style={{height: 32, width: 32, backgroundColor: COLORS.grey300, borderRadius: 20}}></View>
                <Text style={{fontFamily: 's-semibold', fontSize: 14, color: COLORS.grey800}}>Tan Xiao Ming</Text>
              </View>
              <CaretDown size={20} color={COLORS.grey800} weight='regular' />
            </Pressable>
             
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
                (!loading && (alarmsForSelectedDay.length > 0)) ? (
                  alarmsForSelectedDay.map((alarm, index) => (
                    <TouchableRipple
                      style={styles.alarmItem} 
                      key={index}
                      onPress={() =>  navigation.navigate('AlarmDetails', { alarm: alarm })}
                      rippleColor={'rgba(51,51,51,0.25)'}
                      borderless={true}
                      delayPressIn={80}
                    >
                      <View>
                        <View style={[styles.flexRow, {gap: 16, justifyContent: 'space-between', paddingLeft: 12, paddingVertical: 8, marginBottom: 8}]}>
                          <View style={[styles.flexColumn, {alignItems: 'flex-start'}]}>
                            <Text style={{fontFamily: 's-semibold', fontSize: 28, color: COLORS.grey800, textAlign: 'center'}}>
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
                            medications
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
                  <Text>no alarms</Text> 
                )
              )}


            </View>
          </View>

        </ScrollView>
      
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}