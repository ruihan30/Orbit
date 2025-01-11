import { useState, memo, useCallback } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { House, Bell, User, CaretDown, Minus, ArrowCircleDown } from 'phosphor-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appbar } from 'react-native-paper';
import { COLORS } from '../colors/colors.js';
import { styles } from '../styles/styles.js';

export default function Home() {

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
        <View style={{flex: 1, alignItems:'center'}}>
          <Image source={require('../../assets/logo_name_nopad.png')} style={styles.logo} />
        </View>
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
      
      {/* Alarms */}
      <ScrollView style={styles.alarms}>
        
        <Pressable style={{display: 'flex', gap: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
          <View style={{display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center'}}>
            <View style={{height: 32, width: 32, backgroundColor: COLORS.grey300, borderRadius: 20}}></View>
            <Text style={{fontFamily: 's-semibold', fontSize: 14, color: COLORS.grey800}}>Tan Xiao Ming</Text>
          </View>
          <CaretDown size={20} color={COLORS.grey800} weight='regular' />
        </Pressable>
          
        <Pressable style={styles.alarmItem}>
          <View style={{display: 'flex', gap: 16, flexDirection: 'row', alignItems: 'center'}}>
            <Switch></Switch>
            <Text style={{fontFamily: 's-semibold', fontSize: 24, color: COLORS.grey800, flex: 1, textAlign: 'center'}}>10.30 am</Text>
            <Minus size={28} color={COLORS.grey800} weight='regular' />
          </View>
          
          
        </Pressable>

        <Text style={styles.text}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
        </Text>
      </ScrollView>

    </SafeAreaProvider>
  );
}