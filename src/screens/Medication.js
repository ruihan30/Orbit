import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
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
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from '../utilities/firebaseConfig.js';
import { useFocusEffect } from '@react-navigation/native'; 
import useMedStore from '../store/useMedStore.js';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Shadow } from 'react-native-shadow-2';

export default function Medication() {
  const navigation = useNavigation();
  const [boxWidth, setBoxWidth] = useState(null);
  const { user } = useAuthStore();
  const { medications, fetchMedications } = useMedStore();
  const [localMedications, setLocalMedications] = useState();
  const [deletedMedication, setDeletedMedication] = useState();

  const bottomSheetRef = useRef(null);
  const { width, height } = Dimensions.get('window');

  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const closeBottomSheet = () => bottomSheetRef.current?.close();

  const shadow = () => {
    return (
      <Shadow
        sides={{top: true, bottom: false, start: false, end: false}}
        style={{width: width, overflow: 'hidden'}}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      </Shadow>
    );
  };

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  const deleteMedication = async (medication) => {
    setLocalMedications((prevMedications) => prevMedications.filter(med => med.id !== medication.id));
    try {
      const medicationDocRef = doc(db, "user", user.uid, "medications", medication.id);
      await deleteDoc(medicationDocRef);
      console.log("Medication deleted successfully!");
    } catch (error) {
      console.error("Error deleting medication:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      setLocalMedications(medications);
      console.log('focused');
    }, [medications])
  );

  useEffect(() => {
    fetchMedications();
    setLocalMedications(medications);
    console.log('useEffect')
  }, [])

  return (
    <SafeAreaProvider style={{backgroundColor: COLORS.bg, flex: 1}}>
      <GestureHandlerRootView>

        {/* <Button size='small' type='fill' label='Test' onPress={() => {console.log(localMedications)}}></Button> */}

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.flexRow, styles.medicationGrid, {paddingHorizontal: 8, paddingBottom: 8}]}
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
                
          {localMedications?.length > 0 ? (
            localMedications.map((med) => (
              <TouchableRipple 
                key={med.id}
                style={styles.medicationRipple} 
                rippleColor={'rgba(51,51,51,0.25)'}
                onPress={() => navigation.navigate('MedicationDetails', { medication: med })}
                onLongPress={() => {openBottomSheet(); setDeletedMedication(med); console.log(med)}}
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

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['20%', '40%']}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          style={{ zIndex: 100 }}
          handleComponent={shadow}
        >
          <BottomSheetView style={{flex: 1}}>
            {/* Title */}
            <View style={{paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.grey300}}>
              <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}>
                Delete medication?
              </Text>
            </View>
            <View style={{padding: 20, gap: 12}}>
              <Text style={{fontFamily: 'bg-regular', fontSize: 16, textAlign: 'center', color: COLORS.grey500}}>
                Are you sure you want to delete this medication? This action cannot be undone.
              </Text>
              <Button 
                size='large' 
                type='fill' 
                label='Delete post' 
                onPress={() => {
                  deleteMedication(deletedMedication);
                  closeBottomSheet();
                }}
                fillColor={COLORS.error}
              ></Button>
            </View>
          </BottomSheetView>
        </BottomSheet>

      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}