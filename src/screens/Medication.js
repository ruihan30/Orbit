import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { Bell, Alarm, Eyedropper, CalendarHeart, Pill } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../store/useAuthStore.js';
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from '../utilities/firebaseConfig.js';
import { useFocusEffect } from '@react-navigation/native'; 
import useMedStore from '../store/useMedStore.js';

export default function Medication() {
  const navigation = useNavigation();
  const [boxWidth, setBoxWidth] = useState(null);
  
  const { medications, fetchMedications } = useMedStore();

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
          <Text style={styles.header}>My Medication</Text>
          <Appbar.Action style={styles.action} 
            icon={() => 
              <View style={styles.iconWrapper}>
                <Bell size={18} color={COLORS.grey800} weight='bold' />
              </View>
            } 
            onPress={() => {}} 
          />
        </Appbar.Header>

        {/* <Button size='small' type='fill' label='Test' onPress={() => {console.log(boxWidth)}}></Button> */}

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.flexRow, styles.medicationGrid, {paddingHorizontal: 8}]}
        >
          
          {/* First for adding */}
          <TouchableRipple 
            style={styles.medicationRipple} 
            rippleColor={'rgba(51,51,51,0.25)'}
            onPress={() => navigation.navigate('MedicationDetails')}
            borderless={true}
          >
            <View style={{gap: 8, flex: 1}}>
              <View 
                style={{backgroundColor: COLORS.grey200, height: boxWidth, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setBoxWidth(width)
                }}    
              >
                <Plus size={48} color={COLORS.grey450} weight='bold'></Plus>
              </View>
              <View style={{paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <Text style={{textAlign: 'center', fontFamily: 's-semibold', color: COLORS.grey500}}>Add to{'\n'} My Medication</Text>
              </View>
            </View>
          </TouchableRipple>
                
          {medications?.length > 0 ? (
            medications.map((med) => (
              <TouchableRipple 
                key={med.id}
                style={styles.medicationRipple} 
                rippleColor={'rgba(51,51,51,0.25)'}
                onPress={() => navigation.navigate('MedicationDetails', { medication: med })}
                borderless={true}
              >
                <View style={{gap: 8}}>

                  <View 
                    style={{backgroundColor: COLORS.grey200, height: boxWidth, borderRadius: 16, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}
                    onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      setBoxWidth(width)
                    }}    
                  >
                    {
                      med.image ? (<Image source={{ uri: med.image }} style={[styles.medicationImg, {zIndex: 1}]} />) 
                      : <Pill size={100} color={COLORS.grey400}/>
                    }
                    <LinearGradient
                      colors={['transparent', 'rgba(51,51,51,0.4)']}
                      style={{height: boxWidth, width: boxWidth, position: 'absolute', zIndex: 2}}
                    />
                    <View style={{paddingHorizontal: 8, paddingVertical: 12, position: 'absolute', bottom: 0, right: 0, left: 0, zIndex: 3}}>
                      <Text style={{fontSize: 14, fontFamily: 's-regular', color: COLORS.white}}>{med.purpose}</Text>
                      <Text style={{fontSize: 20, fontFamily: 's-semibold', color: COLORS.white}}>{med.name}</Text>
                    </View>
                  </View>
                  
                  {med.alarmSet ? (
                    <View style={[styles.flexRow, {gap: 6, padding: 6, backgroundColor: COLORS.successFaded, borderRadius: 20, justifyContent: 'center'}]}>
                      <Alarm size={16} color={COLORS.success} weight= 'bold'/>
                      <Text style={[styles.medicationHeader, {color: COLORS.success}]}>Alarm set</Text>
                    </View>
                  ) : (
                    <View style={[styles.flexRow, {gap: 6, padding: 6, backgroundColor: COLORS.errorFaded, borderRadius: 20, justifyContent: 'center'}]}>
                      <Alarm size={16} color={COLORS.error} weight= 'bold'/>
                      <Text style={[styles.medicationHeader, {color: COLORS.error}]}>No alarm set</Text>
                    </View>
                  )}

                  <View style={{padding: 2}}>
                    {med.dosagesLeft && 
                      <View style={[styles.flexRow, {gap: 4, paddingHorizontal: 4}]}>
                        <Eyedropper size={18} color={COLORS.grey700} />
                        <Text style={styles.medicationText}>{med.dosagesLeft} dosages left</Text>
                      </View>
                    }
                    <View style={[styles.flexRow, {gap: 4, paddingHorizontal: 4}]}>
                      <CalendarHeart size={18} color={COLORS.grey700} />
                      <Text style={styles.medicationText}>Exp: {med.expiryDate}</Text>
                    </View>
                  </View>

                </View>
              </TouchableRipple>
            ))
          ) : (
            <View></View>
          )}

        </ScrollView>

      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}