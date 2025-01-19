import { useState, memo, useCallback } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { House, Bell, User, CaretDown, Minus, ArrowCircleDown, Plus } from 'phosphor-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appbar } from 'react-native-paper';
import { COLORS } from '../colors/colors.js';
import { Chip } from '../components/chip.js';
import { Button } from '../components/button.js';
import { styles } from '../styles/styles.js';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../assets/logo_name_nopad.svg';
import { useAuth } from '../utilities/authProvider.js';
import { getAuth, signOut } from 'firebase/auth';
import useAuthStore from '../store/useAuthStore.js';

export default function Home() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  const getCurrentWeek = () => {
    const today = new Date(); 
    const dayOfWeek = today.getDay(); // Get the index of the current day (0 = Sunday, 1 = Monday, etc.)
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
      weekDay.setDate(startOfWeek.getDate() + i); // Increment the date for each day of the week
      week.push({
        day: weekDay.toLocaleDateString('en-US', { weekday: 'short' }), // Get day name (e.g., Monday)
        date: weekDay.getDate(), // Get the numeric date
        month: weekDay.toLocaleDateString('en-US', { month: 'long' }), // Get the month (1-based)
        year: weekDay.getFullYear(), // Year
      });
    }
  
    return { today: { date: currentDate, month: currentMonth }, week };
  };

  const { today, week } = getCurrentWeek();
  const [selectedDay, setSelectedDay] = useState(null);

  if (loading) {}
  if (!user) {
    navigation.navigate('Landing');
    return null;
  }

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('User logged out');
      useAuthStore.getState().logout();
      navigation.navigate('Landing');
    });
  };

  return (
    <SafeAreaProvider style={{backgroundColor: COLORS.bg, flex: 1}}>
      
      {/* Top Bar */}
      <Appbar.Header mode='center-aligned'> 
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

      {/* Calendar */}
      <View style={{paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8}}>
        <View style={styles.calendar}>
          <Text style={{fontFamily: 's-semibold', fontSize: 16, color: COLORS.grey450, textAlign: 'center'}}> December </Text>
          <View style={styles.week}>
            {week.map((dayData, index) => {
              const isToday = dayData.date === today.date && dayData.month === today.month;
              const isSelected = selectedDay === index;

              if (isToday) {
                return (
                  <Pressable key={index} style={styles.weekBtnToday} onPress={() => setSelectedDay(index)}>
                    <Text style={{fontFamily: 's-regular', fontSize: 14, color: COLORS.white}}>{dayData.day}</Text>
                    <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.white}}>{dayData.date}</Text>
                  </Pressable>
                );
              } else {
                return (
                  <Pressable key={index} style={isSelected ? styles.weekBtnSelected : styles.weekBtn} onPress={() => setSelectedDay(index)}>
                    <Text style={{fontFamily: 's-regular', fontSize: 14, color: COLORS.grey450}}>{dayData.day}</Text>
                    <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800}}>{dayData.date}</Text>
                  </Pressable>
                );
              }
            })}
          </View>
        </View>
      </View>

      <Button size='large' type='fill' label='Test' onPress={() => console.log(user.stsTokenManager.accessToken)}></Button>
      <Button size='large' type='fill' label='Logout' onPress={handleLogout}></Button>
      
      {/* Alarms */}
      <ScrollView style={styles.alarms}>
        
        {/* Selecting user */}
        <Pressable style={[styles.flexRow, {gap: 16, marginBottom: 8}]} >
          <View style={[styles.flexRow, {gap: 8}]}>
            <View style={{height: 32, width: 32, backgroundColor: COLORS.grey300, borderRadius: 20}}></View>
            <Text style={{fontFamily: 's-semibold', fontSize: 14, color: COLORS.grey800}}>Tan Xiao Ming</Text>
          </View>
          <CaretDown size={20} color={COLORS.grey800} weight='regular' />
        </Pressable>
        
        {/* Pressable alarm, based on time */}
        <Pressable style={styles.alarmItem}>
          <View style={[styles.flexRow, {gap: 16, justifyContent: 'space-between'}]}>
            <Switch></Switch>
            <Text style={{fontFamily: 's-semibold', fontSize: 24, color: COLORS.grey800, textAlign: 'center'}}>10.30 am</Text>
            <Minus size={28} color={COLORS.grey800} weight='regular' />
          </View>
          
          <View style={{gap: 16}}>
            <View style={[styles.flexColumn, {gap: 8, flex: 1}]}>
              <Pressable style={styles.alarmMedication} onPress={() => navigation.navigate('AlarmDetails')}>
                <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 20,}}></View>
                <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                  <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800}}>Paracetamol</Text>
                  <View>
                    <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>Runny Nose</Text>
                    <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>2 tablets</Text>
                  </View>
                </View>
              </Pressable>
              <View style={[styles.flexRow, {gap: 4, width: '100%'}]}>
                <Chip label='Drowsiness'/>
                <Chip label='Fatigue'/>
              </View>
            </View>

            <View style={[styles.flexColumn, {gap: 8, flex: 1}]}>
              <View style={styles.alarmMedication}>
                <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 20}}></View>
                <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                  <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800}}>Paracetamol</Text>
                  <View>
                    <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>Runny Nose</Text>
                    <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey600}}>2 tablets</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.flexRow, {gap: 4, width: '100%'}]}>
                <Chip label='Drowsiness'/>
                <Chip label='Fatigue'/>
              </View>
            </View>
          </View>

          
        </Pressable>

      </ScrollView>

    </SafeAreaProvider>
  );
}