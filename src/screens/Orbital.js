import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { Bell } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import MasonryList from '@react-native-seoul/masonry-list';

export default function Orbital() {
  const DATA = [
    { id: '1', title: 'Doctor Appointment', message: 'Tuesday 3 March, 4.30pm', user: 'Xiao Ming', color: COLORS.fadedRed },
    { id: '2', title: 'Diet', message: 'Avoid oily and greasy food, more protein', user: 'Xiao Ming', color: COLORS.fadedOrange },
    { id: '3', title: 'Exercise', message: '30-minute walk in the park', user: 'David', color: COLORS.fadedGreen },
    { id: '4', title: 'Hydration', message: 'Drink at least 8 glasses of water today', user: 'Priya', color: COLORS.fadedYellow },
  ];

  return (
    <SafeAreaProvider style={{backgroundColor: COLORS.bg, flex: 1}}>
      <GestureHandlerRootView>

        <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 16, textAlign: 'center', padding: 8}}>
          Reminders</Text>
        
        {/* Reminder Board */}
        <View style={[styles.flexRow, {flex: 1, alignItems: 'start'}]}>
          <View style={{paddingVertical: 12, paddingHorizontal: 12, gap: 8}}>
            <View style={styles.profileImg}></View>
            <View style={styles.profileImg}></View>
            <View style={styles.profileImg}></View>
            <View style={styles.profileImg}></View>
            <View style={styles.profileImg}></View>
          </View>

          <MasonryList
            data={DATA}
            keyExtractor={(item) => item.id}
            numColumns={2} 
            renderItem={({ item }) => <GridItem item={item} />}
            contentContainerStyle={styles.reminderBoard}
          />
          
        </View>

      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const GridItem = ({ item }) => (
  <View style={[styles.reminderCard, {backgroundColor: item.color}]}>
    <View>
      <Text style={{fontFamily: 's-semibold', color: COLORS.grey700, fontSize: 14 }}>{item.title}</Text>
      <Text style={{fontFamily: 'bg-regular', color: COLORS.grey500, fontSize: 16 }}>{item.message}</Text>
    </View>
    <View style={[styles.flexRow, {gap: 4}]}>
      <View style={{width: 28, height: 28, backgroundColor: COLORS.grey300, borderRadius: 100}}></View>
      <Text style={{fontFamily: 'bg-medium', color: COLORS.grey700, fontSize: 14 }}>{item.user}</Text>
    </View>
  </View>
);

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
// });