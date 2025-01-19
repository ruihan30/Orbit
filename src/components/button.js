import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../colors/colors.js';
import { TouchableRipple } from 'react-native-paper';

export const Button = ({ onPress, label, size, type, icon, rippleColor = 'rgba(0,155,194,0.2)'}) => {

  const sizeStyles = {
    small: {
      paddingVertical: 10, 
      fontSize: 12,
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
      backgroundColor: COLORS.teal900,
      color: COLORS.white
    }, 
    outline: {
      borderWidth: 1,
      borderColor: COLORS.teal900,
      color: COLORS.teal900
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
  });

  return (
    <TouchableRipple 
      style={[sizeStyle, typeStyle]} 
      rippleColor={rippleColor}
      onPress={onPress}
      borderless={true}
    >
      <View style={styles.wrapper}>
        {icon}
        <Text style={{
            fontFamily: 's-regular', 
            color: typeStyle.color, 
            fontSize: sizeStyle.fontSize,
            marginBottom: 2
          }}
        >{label}</Text>
      </View>
    </TouchableRipple>
  );
  
};