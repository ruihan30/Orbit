import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Image, View, Text, Pressable, ScrollView, Alert, Dimensions, BackHandler } from 'react-native';
import { TextInput, Modal, Portal, Snackbar } from 'react-native-paper';
import { Camera, CalendarDots, X, Plus, Pill } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../colors/colors.js';
import { styles } from '../../styles/styles.js';
import { Button } from '../../components/button.js';
import { InputField } from '../../components/inputField.js';
import * as ImagePicker from 'expo-image-picker';
import { TimeDatePicker, Modes } from 'react-native-time-date-picker';
import moment from 'moment';
import useAuthStore from '../../store/useAuthStore.js';
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '../../utilities/firebaseConfig.js';

export default function MedicationDetails({ route }) {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { medication, disabled } = route.params || {};
  
  const MEDICINETYPE = ['Tablet(s)/ Capsule(s)', 'Spoon(s)', 'Drop(s)/ Strip(s)', 'Patch(es)' ];
  const MEALTIMES = ['before meal', 'after meal', 'after fasting', 'anytime'];
  const FREQUENCY = ['daily', 'weekly', 'whenever necessary', 'custom'];
  const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const userDocRef = doc(db, "user", user.uid);
  const medicationRef = collection(userDocRef, "medications");

  const [sideEffect, setSideEffect] = useState(null);
  const [medicationDetails, setMedicationDetails] = useState({
    image: '',
    name: '', // required
    dosage: '', // required
    medicineType: '', // required
    mealTime: '', // required
    frequency: '', // required
    details: '', // required
    purpose: '', 
    expiryDate: '', // required 
    sideEffects: [],
    alarmSet: false,  
  });
  const [medicationFrequency, setMedicationFrequency] = useState(0);
  const [calendarPickerVisible, setcalendarPickerVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);
  const date = new Date();

  const requiredFields = ["name", "dosage", "medicineType", "mealTime", "frequency", "details", "expiryDate"];
  const nameRef = useRef(null);
  const dosageRef = useRef(null);
  const medicineTypeRef = useRef(null);
  const mealTimeRef = useRef(null);
  const frequencyRef = useRef(null);
  const detailsRef = useRef(null);
  const expiryDateRef = useRef(null);
  const inputRefs = {
    name: nameRef,
    dosage: dosageRef,
    medicineType: medicineTypeRef,
    mealTime: mealTimeRef,
    frequency: frequencyRef,
    details: detailsRef,
    expiryDate: expiryDateRef,
  };

  const onToggleSnackBar = () => setToastVisible(!toastVisible);
  const onDismissSnackBar = () => setToastVisible(false);

  const validateInputs = () => {
    let firstEmptyField = null;
  
    requiredFields.forEach((key) => {
      if (!medicationDetails[key] || medicationDetails[key].length === 0) {
        if (!firstEmptyField) firstEmptyField = key;
      }
    });
  
    if (firstEmptyField && inputRefs[firstEmptyField]?.current) {
      inputRefs[firstEmptyField].current.focus();
      onToggleSnackBar();
      return false; // Validation failed
    }
    
    setSaveVisible(true);
    return true; // Validation passed
  };
  
  const saveMedicationDetails = async () => {
    try {
      if (medication && medication.id) {
        const medicationDocRef = doc(medicationRef, medication.id);
        
        await setDoc(
          medicationDocRef,
          {
            image: medicationDetails.image,
            name: medicationDetails.name,
            dosage: medicationDetails.dosage,
            medicineType: medicationDetails.medicineType,
            mealTime: medicationDetails.mealTime,
            frequency: medicationDetails.frequency,
            details: medicationDetails.details,
            purpose: medicationDetails.purpose,
            expiryDate: medicationDetails.expiryDate,
            sideEffects: medicationDetails.sideEffects,
            updatedAt: serverTimestamp(), // Add an updated timestamp
          },
          { merge: true } // Merge the new data with the existing document (without overwriting the entire document)
        );
        console.log("Medication details updated successfully!");
      } else {
        await setDoc(doc(medicationRef), {
          image: medicationDetails.image,
          name: medicationDetails.name,
          dosage: medicationDetails.dosage,
          medicineType: medicationDetails.medicineType,
          mealTime: medicationDetails.mealTime,
          frequency: medicationDetails.frequency,
          details: medicationDetails.details,
          purpose: medicationDetails.purpose,
          expiryDate: medicationDetails.expiryDate,
          sideEffects: medicationDetails.sideEffects,
          createdAt: serverTimestamp(),
        });
    
        console.log("Medication details saved successfully!");
      }


      navigation.goBack();
      
    } catch (error) {
      console.error("Error saving medication details: ", error);
    }
  
    console.log("Form submitted:", medicationDetails);
  };

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
  };

  const pickImage = async () => {
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

  const showPicker = () => setcalendarPickerVisible(true);
  const selectDate = (selectedDate) => {
    if(selectedDate) {
      updateMedicationDetails('expiryDate', moment(selectedDate).format("DD/MM/YYYY"));
      console.log(moment(selectedDate).format("DD/MM/YYYY"));
    };
    setcalendarPickerVisible(false);
  };

  const handleInputs = (frequency) => {
    switch(frequency) {
      case 'daily': setMedicationFrequency(1); break;
      case 'weekly': setMedicationFrequency(2); break;
      case 'whenever necessary': setMedicationFrequency(3); break;
      case 'custom': setMedicationFrequency(3); break;
      default: setMedicationFrequency(1);
    };
    console.log(medicationFrequency);
  };

  useEffect(() => {
    if (medication) {
      setMedicationDetails({
        image: medication.image || '',
        name: medication.name || '',
        dosage: medication.dosage || '',
        medicineType: medication.medicineType || '',
        mealTime: medication.mealTime || '',
        frequency: medication.frequency || '',
        details: medication.details || '',
        purpose: medication.purpose || '',
        expiryDate: medication.expiryDate || '',
        sideEffects: medication.sideEffects || [],
        alarmSet: medication.alarmSet || false, 
      });
    };

    const handleBackPress = () => {
      if(!disabled) {
        setDiscardVisible(true); 
        return true; 
      }
      return false; 
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);
  
  return (
    <View style={{backgroundColor: COLORS.white, flex: 1, position: 'relative', paddingBottom: 62}}>

      {/* Modals */}
      <Portal> 
        
        <Modal visible={calendarPickerVisible} onDismiss={() => setcalendarPickerVisible(false)}>
          {calendarPickerVisible &&
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

        <Modal visible={saveVisible} onDismiss={() => setSaveVisible(false)}>
          <View style={styles.modalWrapper}>
            <View style={{paddingBottom: 32, gap: 16, paddingTop: 8}}>
              <Text style={{fontFamily: 's-semibold', fontSize: 20, textAlign: 'center', color: COLORS.grey800}}>Save Medication Details?</Text>
              <Text style={{fontFamily: 'bg-regular', fontSize: 16, textAlign: 'center', color: COLORS.grey500}}>Almost done!{'\n'}Are you sure you want to save these details? Double-check everything before saving.</Text>
            </View>

            <View style={[styles.flexRow, {gap: 4}]}>
              <Button size='small' type='outline' label='Go Back' onPress={() => setSaveVisible(false)} customStyle={{flex: 1}}></Button>
              <Button size='small' type='fill' label='Save Changes' onPress={() => {setSaveVisible(false); saveMedicationDetails();}} customStyle={{flex: 1}}></Button>
            </View>
          </View>
        </Modal>

        <Modal visible={discardVisible} onDismiss={() => setDiscardVisible(false)}>
          <View style={styles.modalWrapper}>
            <View style={{paddingBottom: 32, gap: 16, paddingTop: 8}}>
              <Text style={{fontFamily: 's-semibold', fontSize: 20, textAlign: 'center', color: COLORS.grey800}}>Discard Changes?</Text>
              <Text style={{fontFamily: 'bg-regular', fontSize: 16, textAlign: 'center', color: COLORS.grey500}}>You have unsaved changes.{'\n'}Are you sure you want to leave without saving? Any edits will be lost.</Text>
            </View>

            <View style={[styles.flexRow, {gap: 4}]}>
              <Button size='small' type='outline' label='Keep Editing' onPress={() => setDiscardVisible(false)} customStyle={{flex: 1}}></Button>
              <Button 
                size='small' 
                type='fill' 
                label='Discard Changes' 
                onPress={() => {
                  setDiscardVisible(false); 
                  setTimeout(() => {navigation.goBack();}, 200);
                }} customStyle={{flex: 1}} fillColor={COLORS.error}></Button>
            </View>
          </View>
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
            <Camera size={34} color={COLORS.green600}/>
          </Pressable>
        </View>
        
        {/* Input Fields */}
        <View style={{paddingHorizontal: 16, gap: 12, marginBottom: 32, paddingTop: 8}}>

          <TextInput
            value={medicationDetails.name}
            onChangeText={(text) => updateMedicationDetails('name', text)}
            ref={nameRef}
            placeholder='Medication Name *'
            mode='flat'
            underlineColor={COLORS.pink800}
            activeUnderlineColor={COLORS.pink500}
            underlineStyle={{borderRadius: 20}}
            contentStyle={{fontFamily: 's-semibold', backgroundColor: COLORS.white}}
            textColor={COLORS.grey600}
            placeholderTextColor={COLORS.grey450}
            style={{paddingHorizontal: 0}}
            disabled={disabled}
          />

          <View style={{gap:8}}>
            <View style={[styles.flexRow, {gap: 12}]}>
              <InputField 
                placeholder={'0'} 
                numeric={true} 
                value={medicationDetails.dosage} 
                onChangeText={(text) => updateMedicationDetails('dosage', text)}
                ref={dosageRef}
                disabled={disabled}
              />
              <View style={{flex: 1, position: 'relative'}}>
                <InputField 
                  placeholder={'Tablets'} 
                  dropdown={true} 
                  data={MEDICINETYPE}
                  value={medicationDetails.medicineType} 
                  onSelect={(selectedValue) => updateMedicationDetails('medicineType', selectedValue)}
                  ref={medicineTypeRef}
                  onChangeText={(text) => updateMedicationDetails('medicineType', text)}
                  disabled={disabled}
                />
              </View>
            </View>
            
            <View style={[styles.flexRow, {gap: 12}]}>
              <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>to be taken/ applied</Text>
              <View style={{flex: 1}}>
                <InputField 
                  placeholder={'after meal'} 
                  dropdown={true} 
                  data={MEALTIMES}
                  value={medicationDetails.mealTime} 
                  onSelect={(selectedValue) => updateMedicationDetails('mealTime', selectedValue)}
                  ref={mealTimeRef}
                  disabled={disabled}
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
                ref={frequencyRef}
                disabled={disabled}
              />
            </View>

            {((medicationDetails.frequency === 'daily') || (medicationFrequency === 1)) && 
              <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>every</Text>
                <View style={{flex: 1}}>
                  <InputField 
                    placeholder={'2'} 
                    numeric={true} 
                    data={MEALTIMES}
                    value={medicationDetails.details} 
                    onChangeText={(text) => updateMedicationDetails('details', text)}
                    ref={detailsRef}
                    disabled={disabled}
                  />
                </View>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>hours</Text>
              </View>}

            {((medicationDetails.frequency === 'weekly') || (medicationFrequency === 2)) && 
              <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>every</Text>
                <View style={{flex: 1}}>
                  <InputField 
                    placeholder={'Monday'} 
                    dropdown={true} 
                    data={WEEK}
                    value={medicationDetails.details} 
                    onSelect={(selectedValue) => updateMedicationDetails('details', selectedValue)}
                    ref={detailsRef}
                    disabled={disabled}
                  />
                </View>
              </View>}

            {(((medicationDetails.frequency !== 'daily') && (medicationDetails.frequency !== 'weekly')) || (medicationFrequency === 3)) && 
              <View>
                <InputField 
                  placeholder={'When should this medication be taken? Enter any specific instructions here. e.g. every 3 days'} 
                  multiline={true}
                  value={medicationDetails.details} 
                  onChangeText={(text) => updateMedicationDetails('details', text)}
                  ref={detailsRef}
                  disabled={disabled}
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
            required={false}
            disabled={disabled}
          />
        </View>

        {/* More info */}
        <View style={[styles.flexRow, {gap: 12, paddingHorizontal: 16, marginBottom: 32}]}>

          <View style={{gap: 8, flex: 1}}>
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
              ref={expiryDateRef}
              disabled={disabled}
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
                    onPress={() => {
                      if (!disabled) updateMedicationDetails('sideEffects', effect, true, true);
                    }}
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
              disabled={disabled}
            />
            <Pressable
              style={{padding: 12, borderRadius: 100, backgroundColor: COLORS.pink500}}
              onPress={() => {
                if(sideEffect) {
                  updateMedicationDetails('sideEffects', sideEffect, true, false);
                  setSideEffect('')
                };
              }}
            >
              <Plus size={18} color={COLORS.white} />
            </Pressable>
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
          Please fill in the required fields.
        </Text>
      </Snackbar>

      {/* Bottom Buttons */}
      {!disabled && (
        <View style={styles.bottomBtns}>
          <Button 
            size='large' 
            type='outline' 
            label='Cancel' 
            onPress={() => setDiscardVisible(true)}
            customStyle={{flex: 1}}
            rippleColor={'rgba(51,51,51,0.25)'}></Button>
          <Button 
            size='large' 
            type='fill' 
            label='Save' 
            onPress={validateInputs}
            customStyle={{flex: 1}}></Button>
        </View>
      )}

    </View>
  );
}