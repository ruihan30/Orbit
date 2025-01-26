import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../colors/colors.js';

export const Chip = ({ label, style, textStyle}) => {
  return (
    <View style={[styles.chip, style]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: COLORS.pink600,
    paddingHorizontal: 8,
    paddingBottom: 2,
    borderRadius: 20, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontFamily: 'bg-medium',
    color: COLORS.pink600,
  },
});