import React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, RadioButton, Checkbox } from 'react-native-paper';
import { CaretRight, Plus, MinusCircle, TrashSimple, Alarm, Eyedropper, CalendarHeart, Pill } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../colors/colors.js';
import { styles } from '../../styles/styles.js';
import { Button } from '../../components/button.js';
import { Chip } from '../../components/chip.js';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { Audio } from 'expo-av';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Shadow } from 'react-native-shadow-2';
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from '../../utilities/firebaseConfig.js';
import { LinearGradient } from 'expo-linear-gradient';

export default function AlarmDetails() {
  const navigation = useNavigation();
  const [frequency, setFrequency] = useState('daily'); 
  const [selectedDays, setSelectedDays] = useState([]);
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const RINGTONES = [
    { id: 1, name: 'Bell', uri: require('../../../assets/ringtones/Bell.mp3') },
    { id: 2, name: 'Classic', uri: require('../../../assets/ringtones/Classic.mp3') },
    { id: 3, name: 'Flute', uri: require('../../../assets/ringtones/Flute.mp3') },
    { id: 4, name: 'Phantom', uri: require('../../../assets/ringtones/Phantom.mp3') },
  ];
  const [sound, setSound] = useState(null);
  const [ringtoneRadioBtn, setRingtoneRadioBtn] = useState(0);
  const { width, height } = Dimensions.get('window');
  const [medications, setMedications] = useState();
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const [boxWidth, setBoxWidth] = useState(null);

  const [selectedHour, setSelectedHour] = React.useState(0);
  const [selectedMinute, setSelectedMinute] = React.useState(0);
  const [amPm, setAmPm] = useState('am')

  const hours = [...Array(12).keys()].map((index) => ({
    value: index + 1,  
    label: (index + 1).toString().padStart(2, '0'),  
  }));
  const minutes = [...Array(60).keys()].map((index) => ({
    value: index,
    label: index.toString().padStart(2, '0'),
  }))

  const toggleDay = (day) => {
    if (frequency === 'weekly') {
      setSelectedDays([day]); 
    } else if (frequency === 'custom') {
      setSelectedDays((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );
    }
  };

  const onHourChange = (value) => setSelectedHour(value);
  const onMinuteChange = (index) => setSelectedMinute(index);

  const playRingtone = async (uri) => {
    try {
      if (sound) {
        await sound.stopAsync();
      }
  
      const { sound: newSound, status } = await Audio.Sound.createAsync(uri);
  
      if (status.isLoaded) {
        await newSound.playAsync();
        setSound(newSound);
        console.log('sound is playing')
      } else {
        console.log("Error: Sound not loaded properly");
      }
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  };

  const bottomSheetRef = useRef(null);
  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const closeBottomSheet = () => bottomSheetRef.current?.close();
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);

    const stopSound = async () => {
      if (sound) await sound.stopAsync(); 
    };

    if (index === -1) {stopSound(); console.log('stopped')} 
    
  }, [sound]);

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
  
  const fetchMedications = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user.");
        return;
      }

      const medicationsRef = collection(db, "user", user.uid, "medications");
      const querySnapshot = await getDocs(medicationsRef);

      const medicationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "unchecked",
      }));

      // console.log("Medications:", medicationsList);
      setMedications(medicationsList);
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const updateMedicationStatus = (id, status) => {
    let newStatus = '';
    if (status === 'unchecked') newStatus = 'checked'
    else newStatus = 'unchecked';

    setMedications((prevMedications) =>
      prevMedications.map((medication) =>
        medication.id === id ? { ...medication, status: newStatus } : medication
      )
    );
  };

  // useEffect(() => {
  //   return () => {
  //     // Cleanup sound when component unmounts
  //     if (sound) {
  //       sound.unloadAsync();
  //     }
  //   };
  // }, [sound]);

  useEffect(() => {
    fetchMedications();
  }, []);
  
  return (
    <SafeAreaView style={{backgroundColor: COLORS.white, flex: 1, position: 'relative', paddingTop: 20, paddingBottom: 62}}>

      <ScrollView style={{overflow: 'visible', flex: 1, }}>

        {/* Details */}
        <View style={{paddingHorizontal: 16, gap: 28}}>
          <Button size='small' type='outline' label='test' onPress={() => console.log(medications)}></Button>

          {/* Time Picker */}
          <View style={styles.timePicker}>
            <View style={[styles.flexRow, {flex: 0.85}]}>
              <WheelPicker
                data={hours}
                value={selectedHour}
                onValueChanged={onHourChange}
                visibleItemCount={3}
                style={styles.picker}
                itemTextStyle={{fontFamily: 's-semibold', color: COLORS.grey800}}
              />
              <Text style={styles.separator}>:</Text>
              <WheelPicker
                data={minutes}
                value={selectedMinute}
                onValueChanged={onMinuteChange}
                visibleItemCount={3}
                style={styles.picker}
                itemTextStyle={{fontFamily: 's-semibold', color: COLORS.grey800}}
              />
            </View>
            <Pressable 
              style={{
                flex: 0.15, 
                backgroundColor: COLORS.grey200, 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 40, 
                paddingBottom: 2, 
                borderRadius: 8, 
                paddingHorizontal: 4
              }}
              onPress={() => {
                if(amPm == 'am') setAmPm('pm')
                else setAmPm('am');
              }}
            >
              <Text style={{fontFamily: 's-semibold', color: COLORS.grey900, fontSize: 16}}>{amPm}</Text>
            </Pressable>
          </View>

          {/* <Text style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 20 }}>
            Selected Time: {selectedHour ? selectedHour.item.label : '00'}:{selectedMinute ? selectedMinute.item.label : '00'} 
          </Text> */}

          {/* Days selection */}
          <View style={[styles.flexColumn, {gap: 8}]}>
            <SegmentedButtons
              value={frequency}
              onValueChange={(value) => {setFrequency(value); setSelectedDays([])}}
              buttons={[
                { value: 'daily', label: 'Daily', labelStyle: {fontFamily:'bg-regular', fontSize: 14}},
                { value: 'weekly', label: 'Weekly', labelStyle: {fontFamily:'bg-regular', fontSize: 14} },
                { value: 'custom', label: 'Custom',  labelStyle: {fontFamily:'bg-regular', fontSize: 14} },
              ]}
              theme={{colors: { onSurface: COLORS.grey900, onSecondaryContainer: COLORS.white, secondaryContainer: COLORS.pink550, outline: COLORS.grey350 }}}
            />
            {frequency !== 'daily' && (
              <View style={[styles.flexRow, {width: '100%', justifyContent: 'space-between'}]}>
                {DAYS.map((day) => (
                  <Pressable
                    key={day}
                    style={[selectedDays.includes(day) ? styles.daysActive : styles.days]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={selectedDays.includes(day) ? styles.daysTextActive : styles.daysText}>{day}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          
          {/* Notifications setting */}
          <View style={{borderRadius: 16, overflow: 'hidden', marginBottom: 28}}>
            <List.Item
              title="Ring Tone"
              titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
              right={props => <CaretRight color={COLORS.grey700}/>}
              onPress={() => {setBottomSheetTitle('Select ring tone'); openBottomSheet(); }}
              style={{backgroundColor: COLORS.grey100}}
            />
            <List.Item
              title="Vibration"
              titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
              right={props => <Switch style={{height: 20}}/>}
              onPress={() => {}}
              style={{backgroundColor: COLORS.grey100}}
            />
          </View>

        </View>
        
        {/* Medication */}
        <View style={{paddingHorizontal: 16, gap: 16, marginBottom: 16,}}>

          <View style={{gap: 8}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 16}}>Medication</Text>
            <Button 
              size='small' 
              type='outline' 
              label='Add Medication' 
              icon={<Plus size={16} color={COLORS.grey700}/>} 
              onPress={() => {setBottomSheetTitle('Add medications'); openBottomSheet(); }}></Button>
          </View>
            
          <View style={{gap: 12}}>
            {(medications && (medications?.length > 0)) && (
              medications
                .filter((medication) => medication.status === 'checked')
                .map((med) => (
                  <View style={[styles.flexColumn, {gap: 8, position: 'relative'}]}>
                    <Pressable style={styles.deleteSm} onPress={() => updateMedicationStatus(med.id, med.status)}>
                      <MinusCircle size={30} color={COLORS.pink700}></MinusCircle>
                    </Pressable>
                    <TouchableRipple 
                      style={styles.alarmMedicationRipple} 
                      rippleColor={'rgba(193,114,114,0.15)'}
                      onPress={() => console.log('pressed')}
                      borderless={true}
                    >
                      <View style={[styles.alarmMedication, {height: 120}]}>
                        <View style={{height: 120, width: 120, backgroundColor: COLORS.grey200, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}>
                          {
                            med.image ? (<Image source={{ uri: med.image }} style={styles.medicationImg} />) 
                            : <Pill size={44} color={COLORS.grey400}/>
                          }
                        </View>
                        <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                          <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.pink700, width: '100%'}} numberOfLines={1}>
                            {med.name}
                          </Text>
                          <View style={{justifyContent: 'flex-end', flex: 1}}>
                            <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey600}} numberOfLines={5}>
                              <Text style={{fontFamily: 'bg-bold'}}>{med.dosage} {med.medicineType} </Text> 
                              to be taken/applied {med.mealTime} {''}
                                {med.frequency === 'daily' || med.frequency === 'weekly' ? 
                                  <Text>{med.frequency} every {med.details}</Text>
                                  : <Text>{med.details}</Text>
                                } {''}
                                {med.purpose && (
                                  <Text>for {med.purpose}</Text>
                                )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableRipple>
                    <View style={[styles.flexRow, {gap: 4, flexWrap: 'wrap', width: '100%', paddingHorizontal: 8}]}>
                      {med.sideEffects.map((sideEffect) => (
                        <Chip label={sideEffect}/>
                      ))}
                    </View>
                  </View>
              )))}
          </View>

        </View> 
      
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBtns}>
          <Button 
            size='large' 
            type='outline' 
            label='Cancel' 
            onPress={() => console.log('cancel')}
            customStyle={{flex: 1}}></Button>
          <Button 
            size='large' 
            type='fill' 
            label='Save' 
            onPress={() => console.log(selectedHour)}
            customStyle={{flex: 1}}></Button>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["40%", "80%"]}
        enablePanDownToClose={true}
        onChange={handleSheetChanges}
        style={{ zIndex: 100 }}
        handleComponent={shadow}
      >
        <BottomSheetView>

          <View style={{paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.grey300}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}>
              {bottomSheetTitle}
            </Text>
          </View>
      
            <ScrollView 
              showsVerticalScrollIndicator={false} 
            > 

              {bottomSheetTitle === 'Select ring tone' && (
                <RadioButton.Group
                  onValueChange={value => {
                    setRingtoneRadioBtn(value);
                    const selectedRingtone = RINGTONES.find(ringtone => ringtone.id === value);
                    if (selectedRingtone) {
                      playRingtone(selectedRingtone.uri); 
                    }
                  }}
                  value={ringtoneRadioBtn}
                >
                  <View>
                    {RINGTONES.map((ringtone) => (
                      <List.Item
                        key={ringtone.id}
                        title={ringtone.name} 
                        titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
                        right={props => <RadioButton value={ringtone.id}/>}
                        onPress={() => {setRingtoneRadioBtn(ringtone.id); playRingtone(ringtone.uri);}}  
                      />
                    ))}
                  </View>
                </RadioButton.Group>
              )}

              {bottomSheetTitle === 'Add medications' && (
                <View style={[styles.flexRow, styles.medicationGrid, {paddingHorizontal: 8}]}>
                  {(medications && (medications?.length > 0)) ? (
                    medications.map((med) => (
                      <TouchableRipple 
                        key={med.id}
                        style={[styles.medicationRipple, {backgroundColor: COLORS.grey100}]} 
                        rippleColor={'rgba(51,51,51,0.25)'}
                        onPress={() => navigation.navigate('MedicationDetails', { medication: med })}
                        borderless={true}
                      >
                        <View style={{gap: 8, position: 'relative'}}>

                          <View style={styles.checkbox}>
                            <Checkbox 
                              uncheckedColor={COLORS.grey700} 
                              color={COLORS.teal800} 
                              status={med.status} 
                              onPress={() => updateMedicationStatus(med.id, med.status)}></Checkbox>
                          </View>
                          
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
                          
                          {med.alaramSet ? (
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
                </View>
              )}
                
            </ScrollView>
            
          
        </BottomSheetView>
      </BottomSheet>

    </SafeAreaView>
  );
}