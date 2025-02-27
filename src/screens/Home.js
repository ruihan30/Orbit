import { useState, useMemo, useCallback, useRef } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { House, Bell, User, CaretDown, Minus, ArrowCircleDown, Plus, Scroll } from 'phosphor-react-native';
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
import { useBottomSheet } from '../components/bottomSheet.js';
import { LinearGradient } from 'expo-linear-gradient';

import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function Home() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = (event) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;

    if (contentOffsetY > 120) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const getCurrentWeek = () => {
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

  const getFormattedDate = (dayData) => {
    return `${dayData.date} ${dayData.month} ${dayData.year}, ${dayData.day}`;
  };

  const { today, week } = getCurrentWeek();
  const [selectedDay, setSelectedDay] = useState(null);
  
  // if (loading) {}
  if (!isAuthenticated || !user) {
    navigation.navigate('Landing');
    return null;
  }

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('User logged out');
      useAuthStore.getState().logout();
      console.log(isAuthenticated, user);
      navigation.navigate('Landing');
    });
  };

  const bottomSheetRef = useBottomSheet();
  const openBottomSheet = () => bottomSheetRef.current.expand()
  const closeBottomSheet = () => bottomSheetRef.current.close()

  const addUser = async () => {
    try {
      const docRef = await addDoc(collection(db, "user"), {
        name: "Tan Xiao Ming",
        email: "xiaoming@example.com",
        age: 25,
        createdAt: new Date(),
      });
  
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  async function fetchData() {
    const querySnapshot = await getDocs(collection(db, "user"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  }

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

        {/* <Button size='small' type='fill' label='Test bottom sheet' onPress={openBottomSheet}></Button>
        <Button size='small' type='fill' label='Test database' onPress={fetchData}></Button>
        <Button size='small' type='fill' label='Logout' onPress={() => console.log(today)}></Button> */}
        
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
                      <Pressable key={index} style={styles.weekBtnToday} onPress={() => setSelectedDay(getFormattedDate(dayData))}>
                        <Text style={{fontFamily: 's-regular', fontSize: 14, color: COLORS.white}}>{dayData.day}</Text>
                        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.white}}>{dayData.date}</Text>
                      </Pressable>
                    );
                  } else {
                    return (
                      <Pressable key={index} style={isSelected ? styles.weekBtnSelected : styles.weekBtn} onPress={() => setSelectedDay(getFormattedDate(dayData))}>
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
            <Pressable style={styles.alarmItem}>
              <View style={[styles.flexRow, {gap: 16, justifyContent: 'space-between', paddingHorizontal: 8}]}>
                <Switch></Switch>
                <Text style={{fontFamily: 's-semibold', fontSize: 24, color: COLORS.grey800, textAlign: 'center'}}>10.30 am</Text>
                <Minus size={28} color={COLORS.grey500} weight='regular' />
              </View>
              
              <View style={{gap: 16}}>
                <View style={[styles.flexColumn, {gap: 8, flex: 1}]}>
                  <TouchableRipple 
                    style={styles.alarmMedicationRipple} 
                    rippleColor={'rgba(193,114,114,0.15)'}
                    onPress={() => navigation.navigate('AlarmDetails')}
                    borderless={true}
                  >
                    <View style={styles.alarmMedication}>
                      <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 16,}}></View>
                      <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, width: '100%'}} numberOfLines={1}>
                          Paracetamol
                        </Text>
                        <View style={{justifyContent: 'flex-end', flex: 1}}>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>Runny Nose</Text>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>2 tablets</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableRipple>
                  <View style={[styles.flexRow, {gap: 4, width: '100%', flexWrap: 'wrap'}]}>
                    <Chip label='Drowsiness'/>
                    <Chip label='Fatigue'/>
                  </View>
                </View>

                <View style={[styles.flexColumn, {gap: 8, flex: 1}]}>
                  <TouchableRipple 
                    style={styles.alarmMedicationRipple} 
                    rippleColor={'rgba(193,114,114,0.15)'}
                    onPress={() => navigation.navigate('AlarmDetails')}
                    borderless={true}
                  >
                    <View style={styles.alarmMedication}>
                      <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 16,}}></View>
                      <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, width: '100%'}} numberOfLines={1}>
                          Paracetamol
                        </Text>
                        <View style={{justifyContent: 'flex-end', flex: 1}}>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>Runny Nose</Text>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>2 tablets</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableRipple>
                  <View style={[styles.flexRow, {gap: 4, width: '100%', flexWrap: 'wrap'}]}>
                    <Chip label='Drowsiness'/>
                    <Chip label='Fatigue'/>
                  </View>
                </View>
              </View>
            </Pressable>

            <Pressable style={styles.alarmItem}>
              <View style={[styles.flexRow, {gap: 16, justifyContent: 'space-between', paddingHorizontal: 8}]}>
                <Switch></Switch>
                <Text style={{fontFamily: 's-semibold', fontSize: 24, color: COLORS.grey800, textAlign: 'center'}}>10.30 am</Text>
                <Minus size={28} color={COLORS.grey500} weight='regular' />
              </View>
              
              <View style={{gap: 16}}>
                <View style={[styles.flexColumn, {gap: 8, flex: 1}]}>
                  <TouchableRipple 
                    style={styles.alarmMedicationRipple} 
                    rippleColor={'rgba(193,114,114,0.15)'}
                    onPress={() => navigation.navigate('AlarmDetails')}
                    borderless={true}
                  >
                    <View style={styles.alarmMedication}>
                      <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 16,}}></View>
                      <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, width: '100%'}} numberOfLines={1}>
                          Paracetamol
                        </Text>
                        <View style={{justifyContent: 'flex-end', flex: 1}}>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>Runny Nose</Text>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>2 tablets</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableRipple>
                  <View style={[styles.flexRow, {gap: 4, width: '100%', flexWrap: 'wrap'}]}>
                    <Chip label='Drowsiness'/>
                    <Chip label='Fatigue'/>
                  </View>
                </View>

                <View style={[styles.flexColumn, {gap: 8, flex: 1}]}>
                  <TouchableRipple 
                    style={styles.alarmMedicationRipple} 
                    rippleColor={'rgba(193,114,114,0.15)'}
                    onPress={() => navigation.navigate('AlarmDetails')}
                    borderless={true}
                  >
                    <View style={styles.alarmMedication}>
                      <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 16,}}></View>
                      <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, width: '100%'}} numberOfLines={1}>
                          Paracetamol
                        </Text>
                        <View style={{justifyContent: 'flex-end', flex: 1}}>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>Runny Nose</Text>
                          <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>2 tablets</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableRipple>
                  <View style={[styles.flexRow, {gap: 4, width: '100%', flexWrap: 'wrap'}]}>
                    <Chip label='Drowsiness'/>
                    <Chip label='Fatigue'/>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

        </ScrollView>
      
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}