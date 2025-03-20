import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../colors/colors.js';
import { Button } from '../../components/button.js';
import Logo from '../../../assets/logo_name.svg';
import Background from '../../../assets/landing_bg.svg';
import { useNavigation } from '@react-navigation/native';

export default function Landing() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={loginStyles.container}>

      {/* Header */}
      <View style={loginStyles.logoWrapper}><Logo height='70'></Logo></View>

      <Background style={loginStyles.bg}></Background>
      <Image source={require('../../../assets/blur.png')} style={loginStyles.bg} />

      <View style={{ gap: 20 }}>
        {/* Text */}
        <View style={{ gap: 4 }}>
          <Text style={{fontFamily: 's-semibold', fontSize: 36, color: COLORS.grey700}}>
            Circling around Your Wellness
          </Text>
          <Text style={{fontFamily: 'bg-regular', fontSize: 20, color: COLORS.grey450}}>
            Medication management with a caring touch — {'\n'}because your well-being is at the center of our universe.
          </Text>
        </View>

        {/* Buttons */}
        <View style={loginStyles.buttons}>
          <Button size='large' type='fill' label='Log in' onPress={() => navigation.navigate('Login')}></Button>
          <Button size='large' type='outline' label='Sign up' onPress={() => navigation.navigate('Signup')}></Button>
        </View>
      </View>
    
    </SafeAreaView>
  );
}
 
const loginStyles = StyleSheet.create({
  container: {
    display: 'relative',
    flex: 1,
    padding: 16,
    gap: 24,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white
  },
  logoWrapper: {
    width: '100%',
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C3E6E6'
  },
  buttons: {
    gap: 8
  },
  bg: {
    zIndex: -1,
    position: 'absolute',
    bottom: 0
  },
});