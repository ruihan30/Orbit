import React from 'react';
import { useState } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, Menu, Divider, PaperProvider } from 'react-native-paper';
import { Camera, CalendarDots, X, Plus } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../colors/colors.js';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import { Chip } from '../components/chip.js';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { InputField } from '../components/inputField.js';

export default function MedicationDetails() {
  const navigation = useNavigation();
  const MEDICINETYPE = ['Tablet(s)/ Capsule(s)', 'Spoon(s)', 'Drop(s)/ Strip(s)', 'Patch(es)' ];
  const MEALTIMES = ['before meal', 'after meal', 'after fasting', 'anytime'];
  const FREQUENCY = ['daily', 'weekly', 'whenever necessary'];
  const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [test, setTest] = useState(null);
  const handleInputChange = (text) => {
    setTest(text);
  };
  
  return (
    <PaperProvider>
      <View style={{backgroundColor: COLORS.white, flex: 1, position: 'relative', paddingBottom: 62}}>

        <ScrollView style={{overflow: 'visible', flex: 1}}>

          {/* Medication Image */}
          <View style={styles.medicationImg}>
            <View style={styles.cameraBtn}><Camera size={32} color={COLORS.white}/></View>
          </View>
          
          {/* Input Fields */}
          <View style={{paddingHorizontal: 16, gap: 12, marginBottom: 32, paddingTop: 8}}>

            <TextInput
              // value={text}
              // onChangeText={text => setText(text)}
              // ref={ref}
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
                <InputField placeholder={'0'} numeric={true} value={test} onChangeText={handleInputChange}/>
                <View style={{flex: 1, position: 'relative'}}>
                  <InputField placeholder={'Tablets'} dropdown={true} data={MEDICINETYPE}/>
                </View>
              </View>
              
              <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>to be taken/ applied</Text>
                <View style={{flex: 1}}>
                  <InputField placeholder={'before meal'} dropdown={true} data={MEALTIMES}/>
                </View>
              </View>

              <View>
                <InputField placeholder={'daily'} dropdown={true} data={FREQUENCY}/>
              </View>

              <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>every</Text>
                <View style={{flex: 1}}>
                  <InputField placeholder={'2'} numeric={true} data={MEALTIMES}/>
                </View>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>hours</Text>
              </View>

              <View style={[styles.flexRow, {gap: 12}]}>
                <Text style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 16}}>every</Text>
                <View style={{flex: 1}}>
                  <InputField placeholder={'Monday'} dropdown={true} data={WEEK}/>
                </View>
              </View>

              <View>
                <InputField placeholder={'When should this medication be taken? Enter any specific instructions here. e.g. every 3 days'} multiline={true}/>
              </View>
            </View>

          </View>

          {/* Prescribed for */}
          <View style={{paddingHorizontal: 16, gap: 8, marginBottom: 32}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Prescribed for...</Text>
            <InputField placeholder={'Describe the purpose e.g. for fever, allergies, pain relief'} multiline={true}/>
          </View>

          {/* More info */}
          <View style={[styles.flexRow, {gap: 12, paddingHorizontal: 16, marginBottom: 32}]}>
            <View style={{gap: 8, flex: 1}}>
              <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Dosages Left</Text>
              <InputField placeholder={'3'} numeric={true}/>
            </View> 

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
                // value={selectedValue || value}
                right={<TextInput.Icon icon={() => <CalendarDots color={COLORS.grey900} size={20} />}/>}
                keyboardType={'numeric'}
              />
            </View> 
          </View>

          {/* Side Effects */}
          <View style={styles.sideEffects}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Side Effects</Text>

            <View style={[styles.flexRow, {flexWrap: 'wrap', gap: 6}]}>
              <View style={styles.sideEffectChip}>
                <Text style={{fontFamily: 'bg-medium', color: COLORS.pink700, fontSize: 14, paddingBottom: 2}}>Drowsiness</Text>
                <X size={18} color={COLORS.pink700}/>
              </View>
              <View style={styles.sideEffectChip}>
                <Text style={{fontFamily: 'bg-medium', color: COLORS.pink700, fontSize: 14, paddingBottom: 2}}>Drowsiness</Text>
                <X size={18} color={COLORS.pink700}/>
              </View>
            </View>

            <View style={[styles.flexRow, {gap: 8}]}>
              <TextInput
                // value={text}
                // onChangeText={text => setText(text)}
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
              <View style={{padding: 12, borderRadius: 100, backgroundColor: COLORS.pink500}}><Plus size={18} color={COLORS.white} /></View>
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