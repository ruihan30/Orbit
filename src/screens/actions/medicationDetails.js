import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch, Keyboard, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, Menu, Divider, PaperProvider, Modal, Portal } from 'react-native-paper';
import { Camera, CalendarDots, X, Plus, Pill } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../colors/colors.js';
import { styles } from '../../styles/styles.js';
import { Button } from '../../components/button.js';
import { Chip } from '../../components/chip.js';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { InputField } from '../../components/inputField.js';
import * as ImagePicker from 'expo-image-picker';
import { TimeDatePicker, Modes } from 'react-native-time-date-picker';
import moment from 'moment';

export default function MedicationDetails() {
  const navigation = useNavigation();
  const MEDICINETYPE = ['Tablet(s)/ Capsule(s)', 'Spoon(s)', 'Drop(s)/ Strip(s)', 'Patch(es)' ];
  const MEALTIMES = ['before meal', 'after meal', 'after fasting', 'anytime'];
  const FREQUENCY = ['daily', 'weekly', 'whenever necessary'];
  const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const firstInputRef = useRef(null);
  const [sideEffect, setSideEffect] = useState(null);
  const [medicationDetails, setMedicationDetails] = useState({
    image: '',
    name: '',
    dosage: '',
    medicineType: '',
    mealTime: '',
    frequency: '',
    details: '',
    purpose: '',
    dosagesLeft: '',
    expiryDate: '',
    sideEffects: [],
  });
  const [medicationFrequency, setMedicationFrequency] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const date = new Date();
  
  const updateMedicationDetails = (field, value, isArray = false, remove = false) => {
    setMedicationDetails((prevDetails) => {
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
    // console.log(value);
  };

  const pickImage = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take a picture.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photo = result.assets[0];
      updateMedicationDetails('image', photo.uri);
    }
  };

  const showPicker = () => setIsVisible(true);
  const selectDate = (selectedDate) => {
    if(selectedDate) {
      updateMedicationDetails('expiryDate', moment(selectedDate).format("DD/MM/YYYY"));
      console.log(moment(selectedDate).format("DD/MM/YYYY"));
    };
    setIsVisible(false);
  };

  const handleInputs = (frequency) => {
    switch(frequency) {
      case 'daily': setMedicationFrequency(1); break;
      case 'weekly': setMedicationFrequency(2); break;
      case 'whenever necessary': setMedicationFrequency(3); break;
      default: setMedicationFrequency(1);
    };
    console.log(medicationFrequency);
  };

  useEffect(() => {
    if (medicationDetails.name == '') {
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus(); // Focus the input and open the keyboard
        }
      }, 100);
    }
  }, []);
  
  return (
    <PaperProvider>
      <View style={{backgroundColor: COLORS.white, flex: 1, position: 'relative', paddingBottom: 62}}>

        {/* Calendar picker modal */}
        <Portal>
          <Modal visible={isVisible} onDismiss={() => setIsVisible(false)}>
            {isVisible &&
              <TimeDatePicker
                mode={Modes.calendar}
                date={date}
                onSelectedChange={selectDate} 
                onMonthYearChange={(month) => {
                  console.log("month: ", month);
                }}
                style={styles.calendarPicker}
                options={{
                  mainColor: COLORS.pink600,
                  textFontSize: 14,
                  textHeaderFontSize: 16,
                  textSecondaryColor: COLORS.pink500,
                  textDefaultColor: COLORS.grey700,
                  textHeaderColor: COLORS.grey900,
                  defaultFont: 'bg-regular',
                  headerFont: 's-regular',
                  headerAnimationDistance: -100,
                  daysAnimationDistance: -200
                }}
              />
            }
          </Modal>
        </Portal>

        <ScrollView style={{overflow: 'visible', flex: 1, position: 'relative'}} keyboardShouldPersistTaps="handled">

          {/* Medication Image */}
          <View style={styles.medicationImgWrapper}>
            {
              medicationDetails.image ? (<Image source={{ uri: medicationDetails.image }} style={styles.medicationImg} />) 
              : <Pill size={100} color={COLORS.grey400} weight='light' />
            }
            <Pressable style={styles.cameraBtn} onPress={pickImage}>
              <Camera size={34} color={COLORS.teal700}/>
            </Pressable>
          </View>
          
          {/* Input Fields */}
          <View style={{paddingHorizontal: 16, gap: 12, marginBottom: 32, paddingTop: 8}}>

            <TextInput
              value={medicationDetails.name}
              onChangeText={(text) => updateMedicationDetails('name', text)}
              ref={firstInputRef}
              placeholder='Medication Name'
              mode='flat'
              underlineColor={COLORS.pink800}
              activeUnderlineColor={COLORS.pink500}
              underlineStyle={{borderRadius: 20}}
              contentStyle={{fontFamily: 's-semibold', backgroundColor: COLORS.white}}
              textColor={COLORS.grey600}
              placeholderTextColor={COLORS.grey450}
              style={{paddingHorizontal: 0}}
            />

            <View style={{gap:8}}>
              <View style={[styles.flexRow, {gap: 12}]}>
                <InputField 
                  placeholder={'0'} 
                  numeric={true} 
                  value={medicationDetails.dosage} 
                  onChangeText={(text) => updateMedicationDetails('dosage', text)}
                />
                <View style={{flex: 1, position: 'relative'}}>
                  <InputField 
                    placeholder={'Tablets'} 
                    dropdown={true} 
                    data={MEDICINETYPE}
                    value={medicationDetails.medicineType} 
                    onSelect={(selectedValue) => updateMedicationDetails('medicineType', selectedValue)}
                  />
                </View>
              </View>
              
              <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>to be taken/ applied</Text>
                <View style={{flex: 1}}>
                  <InputField 
                    placeholder={'before meal'} 
                    dropdown={true} 
                    data={MEALTIMES}
                    value={medicationDetails.mealTime} 
                    onSelect={(selectedValue) => updateMedicationDetails('mealTime', selectedValue)}
                  />
                </View>
              </View>

              <View>
                <InputField 
                  placeholder={'daily'} 
                  dropdown={true} 
                  data={FREQUENCY}
                  value={medicationDetails.frequency} 
                  onSelect={(selectedValue) => {updateMedicationDetails('frequency', selectedValue); handleInputs(selectedValue);}}
                />
              </View>

              {medicationFrequency === 1 && <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>every</Text>
                <View style={{flex: 1}}>
                  <InputField 
                    placeholder={'2'} 
                    numeric={true} 
                    data={MEALTIMES}
                    value={medicationDetails.details} 
                    onChangeText={(text) => updateMedicationDetails('details', text)}
                  />
                </View>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>hours</Text>
              </View>}

              {medicationFrequency === 2 && <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>every</Text>
                <View style={{flex: 1}}>
                  <InputField 
                    placeholder={'Monday'} 
                    dropdown={true} 
                    data={WEEK}
                    value={medicationDetails.details} 
                    onSelect={(selectedValue) => updateMedicationDetails('details', selectedValue)}
                  />
                </View>
              </View>}

              {medicationFrequency === 3 && <View>
                <InputField 
                  placeholder={'When should this medication be taken? Enter any specific instructions here. e.g. every 3 days'} 
                  multiline={true}
                  value={medicationDetails.details} 
                  onChangeText={(text) => updateMedicationDetails('details', text)}
                />
              </View>}

            </View>

          </View>

          {/* Prescribed for */}
          <View style={{paddingHorizontal: 16, gap: 8, marginBottom: 32}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Prescribed for...</Text>
            <InputField 
              placeholder={'Describe the purpose e.g. for fever, allergies, pain relief'} 
              multiline={true}
              value={medicationDetails.purpose} 
              onChangeText={(text) => updateMedicationDetails('purpose', text)}
            />
          </View>

          {/* More info */}
          <View style={[styles.flexRow, {gap: 12, paddingHorizontal: 16, marginBottom: 32}]}>
            <View style={{gap: 8, flex: 0.4}}>
              <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Dosages Left</Text>
              <InputField 
                placeholder={'3'} 
                numeric={true}
                value={medicationDetails.dosagesLeft} 
                onChangeText={(text) => updateMedicationDetails('dosagesLeft', text)}
              />
            </View> 

            <View style={{gap: 8, flex: 0.6}}>
              <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Expiry Date</Text>
              <TextInput
                mode="outlined"
                placeholder={'DD/MM/YYYY'}
                placeholderTextColor={COLORS.grey400}
                textColor={COLORS.grey900}
                outlineColor={COLORS.grey300}
                outlineStyle={{ borderRadius: 12 }}
                contentStyle={{fontFamily: 'bg-medium', fontSize: 16, textOverflow: 'ellipsis'}}
                activeOutlineColor={COLORS.pink500}
                value={medicationDetails.expiryDate}
                right={<TextInput.Icon icon={() => <CalendarDots color={COLORS.grey900} size={20}/>} onPress={showPicker}/>}
                editable={false}
              />
            </View> 
          </View>

          {/* Side Effects */}
          <View style={styles.sideEffects}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Side Effects</Text>

              <View style={[styles.flexRow, {flexWrap: 'wrap', gap: 6}]}>
                {medicationDetails.sideEffects.map((effect, index) => (
                  <View key={index} style={styles.sideEffectChip}>
                    <Text style={{fontFamily: 'bg-medium', color: COLORS.pink700, fontSize: 14, paddingBottom: 2}}>{effect}</Text>
                    <Pressable
                      onPress={() => updateMedicationDetails('sideEffects', effect, true, true)}
                    >
                      <X size={18} color={COLORS.pink700}/>
                    </Pressable>
                  </View>
                ))}
              </View>

            <View style={[styles.flexRow, {gap: 8}]}>
              <TextInput
                value={sideEffect}
                onChangeText={text => setSideEffect(text)}
                // ref={ref}
                placeholder='Any side effects?'
                mode='flat'
                underlineColor={COLORS.pink800}
                activeUnderlineColor={COLORS.pink500}
                underlineStyle={{borderRadius: 20}}
                contentStyle={{fontFamily: 's-regular', backgroundColor: COLORS.grey100}}
                textColor={COLORS.grey600}
                placeholderTextColor={COLORS.grey450}
                style={{paddingHorizontal: 8, height: 42, flex: 1}}
              />
              <Pressable
                style={{padding: 12, borderRadius: 100, backgroundColor: COLORS.pink500}}
                onPress={() => {if(sideEffect) updateMedicationDetails('sideEffects', sideEffect, true, false);}}
              >
                <Plus size={18} color={COLORS.white} />
              </Pressable>
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

      </View>
    </PaperProvider>
  );
}