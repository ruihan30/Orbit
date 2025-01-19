import React from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import Logo from '../../assets/logo_name_nopad.svg';
import Background from '../../assets/landing_bg.svg';
import { useNavigation } from '@react-navigation/native';

export default function AlarmDetails() {
  const navigation = useNavigation();

  return (
    <SafeAreaView>

      {/* Header */}
      <View><Logo height='70'></Logo></View>

      <Background></Background>
      <Image source={require('../../assets/blur.png')} />

      
    </SafeAreaView>
  );
}