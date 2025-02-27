import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../colors/colors.js';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { Bell } from 'phosphor-react-native';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'phosphor-react-native';

export default function Medication() {
  const [boxWidth, setBoxWidth] = useState(null);

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

        {/* <Button size='small' type='fill' label='Test bottom sheet' onPress={() => console.log(boxWidth)}></Button> */}

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.flexRow, styles.medicationGrid, {paddingHorizontal: 8}]}
        >

          <TouchableRipple 
            style={styles.medicationRipple} 
            rippleColor={'rgba(51,51,51,0.25)'}
            onPress={() => console.log(boxWidth)}
            borderless={true}
          >
            <View style={{gap: 8}}>
              <View 
                style={{backgroundColor: COLORS.grey200, height: boxWidth, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setBoxWidth(width)
                }}    
              >
                <Plus size={48} color={COLORS.grey450} weight='bold'></Plus>
              </View>
              <View style={{paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{textAlign: 'center', fontFamily: 's-semibold', color: COLORS.grey500}}>Add to{'\n'} My Medication</Text>
              </View>
            </View>
          </TouchableRipple>

          <TouchableRipple 
            style={styles.medicationRipple} 
            rippleColor={'rgba(51,51,51,0.25)'}
            onPress={() => console.log(boxWidth)}
            borderless={true}
          >
            <View style={{gap: 8}}>
              <View 
                style={{backgroundColor: COLORS.grey200, height: boxWidth, borderRadius: 16, position: 'relative', overflow: 'hidden'}}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setBoxWidth(width)
                }}    
              >
                <LinearGradient
                  colors={['transparent', 'rgba(51,51,51,0.4)']}
                  style={{height: boxWidth, width: boxWidth}}
                />
                <View style={{paddingHorizontal: 8, paddingVertical: 12, position: 'absolute', bottom: 0}}>
                  <Text style={{fontSize: 20, fontFamily: 's-semibold', color: COLORS.white}}>Paracetamol</Text>
                  <Text style={{fontSize: 14, fontFamily: 's-regular', color: COLORS.white}}>Runny Nose</Text>
                </View>
              </View>
              <View style={{paddingHorizontal: 4}}>
                <Text style={styles.medicationText}>2 dosages left</Text>
                <Text style={styles.medicationText}>Exp: 26 Oct 2015</Text>
              </View>
            </View>
          </TouchableRipple>

          <TouchableRipple 
            style={styles.medicationRipple} 
            rippleColor={'rgba(51,51,51,0.25)'}
            onPress={() => console.log(boxWidth)}
            borderless={true}
          >
            <View style={{gap: 8}}>
              <View 
                style={{backgroundColor: COLORS.grey200, height: boxWidth, borderRadius: 16, position: 'relative', overflow: 'hidden'}}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setBoxWidth(width)
                }}    
              >
                <LinearGradient
                  colors={['transparent', 'rgba(51,51,51,0.4)']}
                  style={{height: boxWidth, width: boxWidth}}
                />
                <View style={{paddingHorizontal: 8, paddingVertical: 12, position: 'absolute', bottom: 0}}>
                  <Text style={{fontSize: 20, fontFamily: 's-semibold', color: COLORS.white}}>Paracetamol</Text>
                  <Text style={{fontSize: 14, fontFamily: 's-regular', color: COLORS.white}}>Runny Nose</Text>
                </View>
              </View>
              <View style={{paddingHorizontal: 4}}>
                <Text style={styles.medicationText}>2 dosages left</Text>
                <Text style={styles.medicationText}>Exp: 26 Oct 2015</Text>
              </View>
            </View>
          </TouchableRipple>

          <TouchableRipple 
            style={styles.medicationRipple} 
            rippleColor={'rgba(51,51,51,0.25)'}
            onPress={() => console.log(boxWidth)}
            borderless={true}
          >
            <View style={{gap: 8}}>
              <View 
                style={{backgroundColor: COLORS.grey200, height: boxWidth, borderRadius: 16, position: 'relative', overflow: 'hidden'}}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setBoxWidth(width)
                }}    
              >
                <LinearGradient
                  colors={['transparent', 'rgba(51,51,51,0.4)']}
                  style={{height: boxWidth, width: boxWidth}}
                />
                <View style={{paddingHorizontal: 8, paddingVertical: 12, position: 'absolute', bottom: 0}}>
                  <Text style={{fontSize: 20, fontFamily: 's-semibold', color: COLORS.white}}>Paracetamol</Text>
                  <Text style={{fontSize: 14, fontFamily: 's-regular', color: COLORS.white}}>Runny Nose</Text>
                </View>
              </View>
              <View style={{paddingHorizontal: 4}}>
                <Text style={styles.medicationText}>2 dosages left</Text>
                <Text style={styles.medicationText}>Exp: 26 Oct 2015</Text>
              </View>
            </View>
          </TouchableRipple>

        </ScrollView>

      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

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