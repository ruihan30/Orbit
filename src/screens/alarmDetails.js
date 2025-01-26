import React from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple } from 'react-native-paper';
import { CaretRight, Plus, DotsThreeOutlineVertical, TrashSimple } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../colors/colors.js';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import { Chip } from '../components/chip.js';
import WheelPicker from '@quidone/react-native-wheel-picker';

export default function AlarmDetails() {
  const navigation = useNavigation();
  const [value, setValue] = React.useState('');

  const [selectedHour, setSelectedHour] = React.useState(0);
  const [selectedMinute, setSelectedMinute] = React.useState(0);

  const hours = [...Array(24).keys()].map((index) => ({
    value: index,
    label: index.toString().padStart(2, '0'),
  }))
  const minutes = [...Array(60).keys()].map((index) => ({
    value: index,
    label: index.toString().padStart(2, '0'),
  }))

  const onHourChange = (value) => {
    setSelectedHour(value);
  };
  const onMinuteChange = (index) => {
    setSelectedMinute(index);
  };
  
  return (
    <SafeAreaView style={{backgroundColor: COLORS.white, flex: 1}}>

      <ScrollView style={{paddingHorizontal: 16, overflow: 'visible', flex: 1}}>

        <View style={{gap: 28}}>

          {/* Header */}
          <View style={styles.timePicker}>
            <WheelPicker
              data={hours}
              value={selectedHour}
              onValueChanged={onHourChange}
              visibleItemCount={3}
              style={styles.picker}
            />
            <Text style={styles.separator}>:</Text>
            <WheelPicker
              data={minutes}
              value={selectedMinute}
              onValueChanged={onMinuteChange}
              visibleItemCount={3}
              style={styles.picker}
            />
          </View>

          {/* <Text style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 20 }}>
            Selected Time: {selectedHour ? selectedHour.item.label : '00'}:{selectedMinute ? selectedMinute.item.label : '00'} 
          </Text> */}

          {/* Days selection */}
          <View style={[styles.flexColumn, {gap: 8}]}>
            <SegmentedButtons
              value={value}
              onValueChange={setValue}
              buttons={[
                { value: 'daily', label: 'Daily', labelStyle: {fontFamily:'bg-regular', fontSize: 14}},
                { value: 'weekly', label: 'Weekly', labelStyle: {fontFamily:'bg-regular', fontSize: 14} },
                { value: 'custom', label: 'Custom',  labelStyle: {fontFamily:'bg-regular', fontSize: 14} },
              ]}
              style={{borderColor: COLORS.grey450}}
              theme={{colors: { onSurface: COLORS.grey600, onSecondaryContainer: COLORS.white, secondaryContainer: COLORS.teal700, outline: COLORS.grey300 }}}
            />
            <View style={[styles.flexRow, {width: '100%', justifyContent: 'space-between'}]}>
              <View style={styles.days}><Text style={styles.daysText}>Sun</Text></View>
              <View style={styles.days}><Text style={styles.daysText}>Mon</Text></View>
              <View style={styles.daysActive}><Text style={styles.daysTextActive}>Tue</Text></View>
              <View style={styles.days}><Text style={styles.daysText}>Wed</Text></View>
              <View style={styles.days}><Text style={styles.daysText}>Thu</Text></View>
              <View style={styles.days}><Text style={styles.daysText}>Fri</Text></View>
              <View style={styles.days}><Text style={styles.daysText}>Sat</Text></View>
            </View>
          </View>
          
          {/* Notifications setting */}
          <View style={{borderRadius: 16, overflow: 'hidden', marginBottom: 28}}>
            <List.Item
              title="Ring Tone"
              titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
              right={props => <CaretRight color={COLORS.grey700}/>}
              onPress={() => {}}
              style={{backgroundColor: COLORS.bg}}
            />
            <List.Item
              title="Vibration"
              titleStyle={{fontFamily: 'bg-medium', fontSize: 16, color: COLORS.grey700}}
              right={props => <Switch style={{height: 20}}/>}
              onPress={() => {}}
              style={{backgroundColor: COLORS.bg}}
            />
          </View>
        </View>
        
        {/* Medication */}
        <View style={{gap: 16, marginBottom: 16}}>
          <View style={{gap: 8}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey700, fontSize: 16}}>Medication</Text>
            <Button 
              size='small' 
              type='outline' 
              label='Add Medication' 
              icon={<Plus size={16} color={COLORS.teal900}/>} 
              onPress={() => console.log('isAuthenticated')}></Button>
          </View>
            
          <View style={{gap: 12}}>
            <View style={[styles.flexColumn, {gap: 8}]}>
              <TouchableRipple 
                style={styles.alarmMedicationRipple} 
                rippleColor={'rgba(193,114,114,0.15)'}
                onPress={() => console.log('pressed')}
                borderless={true}
              >
                <View style={styles.alarmMedication}>
                  <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 20,}}></View>
                  <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                    <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, width: '100%'}} numberOfLines={1}>
                      Paracetamol
                    </Text>
                    <View style={{justifyContent: 'flex-end', flex: 1}}>
                      <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey600}} numberOfLines={3}>
                        <Text style={{fontFamily: 'bg-bold'}}>2 tablets </Text> 
                        to be taken/applied before meal daily every 2 hours for runny nose.
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableRipple>
              <View style={[styles.flexRow, {width: '100%', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start'}]}>
                <View style={[styles.flexRow, {gap: 4, flexWrap: 'wrap', flex: 1}]}>
                  <Chip label='Drowsiness'/>
                  <Chip label='Fatigue'/>
                  <Chip label='Fatigue'/>
                  <Chip label='Fatigue'/>
                  <Chip label='Fatigue'/>
                </View>

                <TouchableRipple 
                  style={styles.deleteSm}
                  rippleColor={'rgba(193,114,114,0.15)'}
                  onPress={() => console.log('pressed')}
                  borderless={true}
                >
                  <TrashSimple size={18} color={COLORS.error}></TrashSimple>
                </TouchableRipple>
              </View>
            </View>

            <View style={[styles.flexColumn, {gap: 8}]}>
              <TouchableRipple 
                style={styles.alarmMedicationRipple} 
                rippleColor={'rgba(193,114,114,0.15)'}
                onPress={() => console.log('pressed')}
                borderless={true}
              >
                <View style={styles.alarmMedication}>
                  <View style={{height: 100, width: 100, backgroundColor: COLORS.grey300, borderRadius: 20,}}></View>
                  <View style={[styles.flexColumn, styles.alarmMedicationInfo]}>
                    <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, width: '100%'}} numberOfLines={1}>
                      Paracetamol
                    </Text>
                    <View style={{justifyContent: 'flex-end', flex: 1}}>
                      <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey600}} numberOfLines={3}>
                        <Text style={{fontFamily: 'bg-bold'}}>2 tablets </Text> 
                        to be taken/applied before meal daily every 2 hours for runny nose.
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableRipple>
              <View style={[styles.flexRow, {width: '100%', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start'}]}>
                <View style={[styles.flexRow, {gap: 4, flexWrap: 'wrap', flex: 1}]}>
                  <Chip label='Drowsiness'/>
                  <Chip label='Fatigue'/>
                  <Chip label='Fatigue'/>
                  <Chip label='Fatigue'/>
                  <Chip label='Fatigue'/>
                </View>

                <TouchableRipple 
                  style={styles.deleteSm}
                  rippleColor={'rgba(193,114,114,0.15)'}
                  onPress={() => console.log('pressed')}
                  borderless={true}
                >
                  <TrashSimple size={18} color={COLORS.error}></TrashSimple>
                </TouchableRipple>
              </View>
            </View>
            
          </View>
        </View>

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
      
      </ScrollView>

    </SafeAreaView>
  );
}