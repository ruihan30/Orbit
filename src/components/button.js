import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../colors/colors.js';
import { TouchableRipple } from 'react-native-paper';

export const Button = ({ onPress, label, size, type, icon, rippleColor = 'rgba(0,155,194,0.2)', customStyle, fillColor}) => {

  const sizeStyles = {
    small: {
      paddingVertical: 10, 
      fontSize: 13,
      borderRadius: 24,
      overflow: 'hidden'
    },
    large: {
      paddingVertical: 12,
      fontSize: 14,
      borderRadius: 24,
      overflow: 'hidden',
    },
    fill: {
      backgroundColor: fillColor || COLORS.teal900,
      color: COLORS.white
    }, 
    outline: {
      borderWidth: 1,
      borderColor: COLORS.grey350,
      color: COLORS.grey900
    }
  };

  const sizeStyle = sizeStyles[size];
  const typeStyle = sizeStyles[type];

  const styles = StyleSheet.create({
    wrapper: {
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    },
    customWrapper: customStyle ? customStyle : {}
  });

  return (
    <TouchableRipple 
      style={[sizeStyle, typeStyle, customStyle]} 
      rippleColor={rippleColor}
      onPress={onPress}
      borderless={true}
    >
      <View style={styles.wrapper}>
        {icon}
        <Text style={{
            fontFamily: 'bg-regular', 
            color: typeStyle.color, 
            fontSize: sizeStyle.fontSize,
            // marginBottom: 2
          }}
        >{label}</Text>
      </View>
    </TouchableRipple>
  );
  
};