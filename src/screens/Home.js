import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch, TouchableOpacity, TouchableHighlight } from 'react-native';
import { House, Bell, User, CaretDown, Minus, ArrowCircleDown, Plus, Scroll, Pill } from 'phosphor-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appbar, TouchableRipple } from 'react-native-paper';
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

import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";

export default function Home({ onNavigateTo, route }) {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAlarmStore((state) => state.loading)
  const { medications, fetchMedications } = useMedStore();
  const { alarms, fetchAlarms, updateAlarm } = useAlarmStore(); 
  const [groupedAlarms, setGroupedAlarms] = useState(null);
  const [alarmsFetched, setAlarmsFetched] = useState(false); 

  const [isVisible, setIsVisible] = useState(false);

  const { today, week } = getCurrentWeek();
  const [selectedDay, setSelectedDay] = useState(getFormattedDate(today));
  const [alarmsForSelectedDay, setAlarmsForSelectedDay] = useState(groupedAlarms?.[today.day] || []);

  const handleScroll = (event) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;

    if (contentOffsetY > 120) {
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

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('User logged out');
      useAuthStore.getState().logout();
      console.log(isAuthenticated, user);
      
      if (navigation.isFocused()) {
        navigation.navigate('Landing');
      }
    });
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

  // check for persisted storage
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigation.navigate('Landing');
    }
  }, [isAuthenticated, user, navigation]);

  useEffect(() => {
    if (alarmsFetched && alarms.length > 0) {
      const grouped = groupAlarmsByDay(alarms);
      setGroupedAlarms(grouped);
      setSelectedDay(getFormattedDate(today));
      setAlarmsForSelectedDay(grouped?.[today.day] || []);
    }
  }, [alarms, alarmsFetched]);

  // useEffect(() => {
  //   if (route?.params?.message) {
  //     console.log('Data received from previous screen:', route.params.message);
  //   }
  // }, [route?.params?.message]);

  // when focused
  useFocusEffect(
    useCallback(() => {
      fetchMedications();
      fetchAlarms();
      setAlarmsFetched(true);
      console.log('focused')
    }, [])
  );

  // if (loading) {}
  // if (!isAuthenticated || !user) {
  //   navigation.navigate('Landing');
  //   return null;
  // }

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
          <View style={{flex: 1, alignItems:'center'}}><Logo height='22'></Logo></View>
          <Appbar.Action style={styles.action} 
            icon={() => 
              <View style={styles.iconWrapper}>
                <Bell size={18} color={COLORS.grey800} weight='bold' />
              </View>
            } 
            onPress={() => {}} 
          />
        </Appbar.Header>

        <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(alarms)}></Button>
        {/* <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(groupedAlarms)}></Button>
        <Button size='small' type='fill' label='Test alarms' onPress={() => console.log(alarmsForSelectedDay)}></Button> */}
        <Button size='small' type='fill' label='Test alarms details page' onPress={() => navigation.navigate('AlarmDetails')}></Button>
        {/* <Button size='small' type='fill' label='Test database' onPress={() => console.log(openBottomSheet)}></Button> */}
        {/* <Button size='small' type='fill' label='Test navigating to other tabs' onPress={() => onNavigateTo(1)}></Button>
        <Button size='small' type='fill' label='Test auth store' onPress={() => console.log(user.uid)}></Button> */}
        <Button size='small' type='fill' label='Test logout' onPress={() => handleLogout()}></Button>
        

        <ScrollView 
          stickyHeaderIndices={[1]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}>

          {/* Calendar */}
          <View style={{paddingHorizontal: 10, paddingTop: 12}}>
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
          
          {/* Header */}
          <View style={styles.homeHeader}>
            <Text style={styles.dateHeader}>
              {selectedDay ? selectedDay : getFormattedDate(today)}
            </Text>

            {/* Selecting user */}
            <Pressable style={styles.userSelection} >
              <View style={[styles.flexRow, {gap: 8}]}>
                <View style={{height: 32, width: 32, backgroundColor: COLORS.grey300, borderRadius: 20}}></View>
                <Text style={{fontFamily: 's-semibold', fontSize: 14, color: COLORS.grey800}}>Tan Xiao Ming</Text>
              </View>
              <CaretDown size={20} color={COLORS.grey800} weight='regular' />
            </Pressable>
            
            {isVisible && (
              <LinearGradient
                colors={['rgba(243,243,243,1)', 'transparent']}
                style={styles.linearGradient}
              />
            )}
              
          </View>
          
          {/* Alarms */}
          <View style={styles.alarms}>

            {/* Pressable alarm, based on time */}
            {alarmsForSelectedDay.length > 0 ? (
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
              <Text></Text> 
            )}

            <Text>no alarms</Text>

          </View>

        </ScrollView>
      
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}