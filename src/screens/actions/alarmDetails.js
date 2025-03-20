import React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Image, View, Text, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedButtons, List, TouchableRipple, RadioButton, Checkbox, Snackbar } from 'react-native-paper';
import { Plus, MinusCircle, Alarm, Eyedropper, CalendarHeart, Pill, X } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../colors/colors.js';
import { styles } from '../../styles/styles.js';
import { Button } from '../../components/button.js';
import { Chip } from '../../components/chip.js';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { Audio } from 'expo-av';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../../store/useAuthStore.js';
import useMedStore from '../../store/useMedStore.js';
import useAlarmStore from '../../store/useAlarmStore.js';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmDetails({ route }) {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { alarm } = route.params || {};
  const { medications, fetchMedications } = useMedStore();
  const { updateAlarm, addAlarm, deleteAlarm } = useAlarmStore();
  const [alarmDetails, setAlarmDetails] = useState({
    id: '',
    time: '', // required
    frequency: '', // required
    days: [], // required if frequency is not daily
    ringtone: {}, 
    vibration: false,
    medicationIds: [],
    enabled: true,
  });

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const RINGTONES = [
    { id: 1, name: 'Bell', uri: require('../../../assets/ringtones/Bell.mp3') },
    { id: 2, name: 'Classic', uri: require('../../../assets/ringtones/Classic.mp3') },
    { id: 3, name: 'Flute', uri: require('../../../assets/ringtones/Flute.mp3') },
    { id: 4, name: 'Phantom', uri: require('../../../assets/ringtones/Phantom.mp3') },
  ];

  const [toastVisible, setToastVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { width, height } = Dimensions.get('window');
  const [boxWidth, setBoxWidth] = useState(null);
  const bottomSheetRef = useRef(null);
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const [sound, setSound] = useState(null);
  const [ringtoneRadioBtn, setRingtoneRadioBtn] = useState(0);
  const [selectedHour, setSelectedHour] = useState(() => {
    const timeComponents = alarm?.time ? getTimeComponents(alarm.time) : null;
    return timeComponents ? timeComponents.hour : '1'; 
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    const timeComponents = alarm?.time ? getTimeComponents(alarm.time) : null;
    return timeComponents ? timeComponents.minute : '00'; // Initialize with the minute
  });
  const [amPm, setAmPm] = useState(() => {
    const timeComponents = alarm?.time ? getTimeComponents(alarm.time) : null;
    return timeComponents ? timeComponents.ampm : 'am'; 
  });
  const hours = [...Array(12).keys()].map((index) => ({
    value: index + 1,  
    label: (index + 1).toString().padStart(2, '0'),  
  }));
  const minutes = [...Array(60).keys()].map((index) => ({
    value: index,
    label: index.toString().padStart(2, '0'),
  }))
  
  const [expoPushToken, setExpoPushToken] = useState(''); 
  const [notification, setNotification] = useState(undefined); 

  const notificationListener = useRef(null); 
  const responseListener = useRef(null);

  const updateAlarmDetails = (field, value, isArray = false, remove = false) => {
    setAlarmDetails((prevDetails) => {
      if (isArray) {

        let updatedArray;
        if (remove) {
          updatedArray = prevDetails[field].filter(item => item !== value);
        } else {
          updatedArray = prevDetails[field].includes(value)
            ? prevDetails[field].filter(item => item !== value) 
            : [...prevDetails[field], value]; 
        }

        return { ...prevDetails, [field]: updatedArray };
      } else {
        return { ...prevDetails, [field]: value };
      }
    });
  };

  const onToggleSnackBar = () => setToastVisible(!toastVisible);
  const onDismissSnackBar = () => setToastVisible(false);

  const toggleDay = (day) => {
    setAlarmDetails((prevDetails) => {
      if (prevDetails.frequency === 'weekly') {
        return { ...prevDetails, days: [day] }; // Only one day selected for weekly
      } else if (prevDetails.frequency === 'custom') {
        const updatedDays = prevDetails.days.includes(day)
          ? prevDetails.days.filter((d) => d !== day) // Remove if already selected
          : [...prevDetails.days, day]; // Add if not selected
  
        return { ...prevDetails, days: updatedDays };
      }
      return prevDetails;
    });
  };
  const onHourChange = (hour) => setSelectedHour(hour.item.value);
  const onMinuteChange = (minute) => setSelectedMinute(minute.item.label);

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

  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const closeBottomSheet = () => bottomSheetRef.current?.close();
  const handleSheetChanges = useCallback((index) => {
    // console.log('handleSheetChanges', index);

    const stopSound = async () => {
      if (sound) await sound.stopAsync(); 
    };

    if (index === -1) stopSound(); 
    
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

  function getTimeComponents(time) {
    const regex = /(\d+):(\d+) (\w+)/;
    const match = time.match(regex);

    const hours = match[1];  
    const minutes = match[2];  
    const ampm = match[3];

    return { hour: hours, minute: minutes, ampm: ampm };
  };

  const handleCheckboxPress = (medicationId) => {
    setAlarmDetails((prevDetails) => ({
      ...prevDetails,
      medicationIds: prevDetails.medicationIds.includes(medicationId)
        ? prevDetails.medicationIds.filter(id => id !== medicationId) // Remove if exists
        : [...prevDetails.medicationIds, medicationId], // Add if not exists
    }));
  };

  const validateInputs = async () => {
    switch (true) {  
      case !alarmDetails.frequency.trim():
        setErrorMessage("Please specify how often the medication should be taken.");
        onToggleSnackBar();
        return false;
  
      case alarmDetails.frequency !== "daily" && alarmDetails.days.length === 0:
        setErrorMessage("Please select the days for this medication schedule.");
        onToggleSnackBar();
        return false;
  
      default:
        if (alarmDetails.id !== '') {
          updateAlarm(alarmDetails); 
        } else {
          const newAlarm = await addAlarm(alarmDetails);
          if (newAlarm && newAlarm.id) {
            console.log(newAlarm.id);
            await scheduleNotification(newAlarm);
          }
        }
        navigation.goBack();
        return true;
    }
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

    } else if (alarm.frequency === 'custom' && days.length > 0) {
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

  async function deleteScheduledNotification(alarmId) {
    try {

      const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      // console.log('All scheduled notifications:', allScheduledNotifications);

      // Find the notification object by alarmId
      const notificationsToDelete = allScheduledNotifications.filter(
        (notification) => notification.content.data.data.id === alarmId
      );

      console.log(notificationsToDelete)
  
      if (notificationsToDelete.length > 0) {
        for (let notification of notificationsToDelete) {
          const { identifier } = notification;
  
          if (identifier) {
            await Notifications.cancelScheduledNotificationAsync(identifier);
            console.log(`Notification with alarm ID: ${alarmId} and identifier: ${identifier} has been deleted.`);
          } else {
            console.log(`Notification with alarm ID: ${alarmId} has no valid identifier.`);
          }
        }
      } else {
        console.log(`No notification found for alarm ID: ${alarmId}`);
      }
    } catch (error) {
      console.error('Error deleting scheduled notification:', error);
    }
  };
  
  // updating time selected
  useEffect(() => {
    const time = `${selectedHour}:${selectedMinute} ${amPm}`;
    updateAlarmDetails('time', time);
    console.log(time);
  }, [selectedHour, selectedMinute, amPm]);

  // fetching medications and setting alarmdetails on first load
  useEffect(() => {
    fetchMedications();

    if (alarm) {
      setAlarmDetails({
        id: alarm.id || '',
        time: alarm.time || '', // required
        frequency: alarm.frequency || '', // required
        days: alarm.days || [], // required if frequency is not daily
        ringtone: alarm.ringtone || {}, 
        vibration: alarm.vibration || false,
        medicationIds: alarm.medicationIds || [],
        enabled: alarm.enabled || true,
      });
    };
  }, []);

  // debugging notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  return (
    <SafeAreaView style={{backgroundColor: COLORS.white, flex: 1, position: 'relative', paddingBottom: 62}}  >

      {/* Header */}
      <View style={[styles.flexRow, {paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: COLORS.grey300, marginBottom: 12, zIndex: 2, backgroundColor: COLORS.white, justifyContent: 'flex-end'}]}>
        <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 16, flex: 1}}>
          Alarm Details
        </Text>
        <Pressable 
          style={{padding: 8, paddingHorizontal: 20}}
          onPress={() => {
            deleteAlarm(alarmDetails.id); 
            deleteScheduledNotification(alarmDetails.id);
            navigation.setParams({ message: 'params passed back' });
            navigation.goBack();
            // navigation.popTo('NavBar', { message: 'message' });
          }}
        >
          {alarmDetails.id && (
            <Text style={{fontFamily: 'bg-medium', color: COLORS.error, fontSize: 14,}}>Delete Alarm</Text>
          )}

        </Pressable>
      </View>

      <ScrollView style={{overflow: 'visible', flex: 1, }}>

        {/* Details */}
        <View style={{paddingHorizontal: 16, gap: 28}}>
          <Button size='small' type='fill' label='test' onPress={() => console.log(alarmDetails)}></Button>

          {/* Time Picker */}
          <View style={styles.timePicker}>
            <View style={[styles.flexRow, {flex: 0.85}]}>
              <WheelPicker
                data={hours}
                value={selectedHour - 1 + 1}
                onValueChanged={onHourChange}
                visibleItemCount={3}
                style={styles.picker}
                itemTextStyle={{fontFamily: 's-semibold', color: COLORS.grey800}}
              />
              <Text style={styles.separator}>:</Text>
              <WheelPicker
                data={minutes}
                value={selectedMinute - 1 + 1}
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

          {/* Days selection */}
          <View style={[styles.flexColumn, {gap: 8, marginBottom: 28}]}>
            <SegmentedButtons
              value={alarmDetails.frequency}
              onValueChange={(value) => {
                updateAlarmDetails('frequency', value); 
                updateAlarmDetails('days', []);

                if (value === 'daily') {
                  updateAlarmDetails('days', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
                }
              }}
              buttons={[
                { value: 'daily', label: 'Daily', labelStyle: {fontFamily:'bg-regular', fontSize: 14}},
                { value: 'weekly', label: 'Weekly', labelStyle: {fontFamily:'bg-regular', fontSize: 14} },
                { value: 'custom', label: 'Custom',  labelStyle: {fontFamily:'bg-regular', fontSize: 14} },
              ]}
              theme={{colors: { onSurface: COLORS.grey900, onSecondaryContainer: COLORS.white, secondaryContainer: COLORS.pink550, outline: COLORS.grey350 }}}
            />
            {((alarmDetails.frequency === 'weekly') || (alarmDetails.frequency === 'custom')) && 
              (
                <View style={[styles.flexRow, {width: '100%', justifyContent: 'space-between'}]}>
                  {DAYS.map((day) => (
                    <Pressable
                      key={day}
                      style={[alarmDetails.days.includes(day) ? styles.daysActive : styles.days]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={alarmDetails.days.includes(day) ? styles.daysTextActive : styles.daysText}>{day}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
          </View>
          
          {/* Notifications setting */}
          {/* <View style={{borderRadius: 16, overflow: 'hidden', marginBottom: 28}}>
            <List.Item
              title="Ring Tone"
              description={alarmDetails.ringtone.name}
              titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
              descriptionStyle={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey500}}
              right={props => <CaretRight color={COLORS.grey700}/>}
              onPress={() => {setBottomSheetTitle('Select ring tone'); openBottomSheet(); }}
              style={{backgroundColor: COLORS.grey100}}
            />
            <List.Item
              title="Vibration"
              titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
              right={props => 
                <Switch 
                  style={{height: 20}}
                  value={alarmDetails.vibration}
                  onValueChange={() => updateAlarmDetails('vibration', !alarmDetails.vibration)}
                  trackColor={{false: COLORS.grey400, true: COLORS.pink300}}
                  thumbColor={alarmDetails.vibration ? COLORS.pink500 : COLORS.grey200}
                />
              }
              onPress={() => updateAlarmDetails('vibration', !alarmDetails.vibration)}
              style={{backgroundColor: COLORS.grey100}}
            />
          </View> */}

        </View>
        
        {/* Medication */}
        <View style={{paddingHorizontal: 16, gap: 16, marginBottom: 16,}}>

          <View style={{gap: 8}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 16}}>Medication</Text>
            <Button 
              size='small' 
              type='fill' 
              label='Add Medication' 
              fillColor={COLORS.grey600}
              icon={<Plus size={16} color={COLORS.white}/>} 
              onPress={() => {setBottomSheetTitle('Add medications'); openBottomSheet(); }}
              rippleColor={'rgba(51,51,51,0.25)'}
            ></Button>
          </View>
            
          <View style={{gap: 12}}>

            {Array.isArray(alarmDetails.medicationIds) && alarmDetails.medicationIds.length > 0 ? (
              alarmDetails.medicationIds.map((medId) => {
                const filteredMedications = medications.filter((medication) => medication.id === medId);
                
                return filteredMedications.map((med) => (
                  <View style={[styles.flexColumn, {gap: 8, position: 'relative'}]} key={med.id}>
                    <Pressable style={styles.deleteSm} onPress={() => handleCheckboxPress(med.id)}>
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
                          <View style={{justifyContent: 'flex-start', flex: 1, gap: 4}}>
                            <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey600}} numberOfLines={4}>
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
                        <Chip label={sideEffect} key={sideEffect}/>
                      ))}
                    </View>
                  </View>
                ));
            })) : (
              <View></View>
            )}
          </View>

        </View> 
      
      </ScrollView>

      {/* Toast */}
      <Snackbar
        visible={toastVisible}
        onDismiss={onDismissSnackBar}
        duration={5000}
        onIconPress={() => setToastVisible(false)}
        icon={() => <X size={20} color={COLORS.white} weight='bold' />}
        style={[styles.snackbar, {backgroundColor: COLORS.error, position: 'absolute', bottom: 66, zIndex: 2}]}
        wrapperStyle={{width: Dimensions.get("window").width}}
      >
        <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.white}}>
          {errorMessage}
        </Text>
      </Snackbar>

      {/* Bottom Buttons */}
      <View style={styles.bottomBtns}>
        <Button 
          size='large' 
          type='outline' 
          label='Cancel' 
          onPress={() => {
            navigation.goBack();
          }}
          customStyle={{flex: 1}}
          rippleColor={'rgba(51,51,51,0.25)'}></Button>
        <Button 
          size='large' 
          type='fill' 
          label='Save' 
          onPress={() => {
            validateInputs();
          }}
          customStyle={{flex: 1}}></Button>
      </View>

      {/* Bottom Sheet */}
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
                      setAlarmDetails(prevState => ({
                        ...prevState,
                        ringtone: {
                          name: selectedRingtone.name,
                          uri: selectedRingtone.uri,
                        }
                      }));
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
                        onPress={() => {
                          setRingtoneRadioBtn(ringtone.id); 
                          setAlarmDetails(prevState => ({
                            ...prevState,
                            ringtone: {
                              name: ringtone.name,
                              uri: ringtone.uri,
                            }
                          }));
                          playRingtone(ringtone.uri);
                        }}  
                      />
                    ))}
                  </View>
                </RadioButton.Group>
              )}

              {bottomSheetTitle === 'Add medications' && (
                <View style={[styles.flexRow, styles.medicationGrid, {paddingHorizontal: 8}]}>
                  {medications.map((med) => (
                      <TouchableRipple 
                        key={med.id}
                        style={[styles.medicationRipple, {backgroundColor: COLORS.grey100}]} 
                        rippleColor={'rgba(51,51,51,0.25)'}
                        onPress={() => navigation.navigate('MedicationDetails', { medication: med, disabled: true })}
                        borderless={true}
                      >
                        <View style={{gap: 8, position: 'relative'}}>

                          <View style={styles.checkbox}>
                            <Checkbox 
                              uncheckedColor={COLORS.grey700} 
                              color={COLORS.teal800} 
                              status={alarmDetails.medicationIds.includes(med.id) ? 'checked' : 'unchecked'} 
                              onPress={() => handleCheckboxPress(med.id)}></Checkbox>
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
                    )
                  )}
                </View>
              )}
                
            </ScrollView>
            
          
        </BottomSheetView>
      </BottomSheet>

    </SafeAreaView>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
