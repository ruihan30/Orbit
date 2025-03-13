import React from 'react';
import { useState, forwardRef } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { COLORS } from '../colors/colors.js';
import { TextInput, Menu, Divider } from 'react-native-paper';
import { CaretDown } from 'phosphor-react-native';
import { Button } from './button.js';

export const InputField = forwardRef(({ placeholder, style, value, dropdown, numeric, data, multiline, onChangeText, onSelect, required=true, disabled=false }, ref) => {
  const [visible, setVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const openMenu = () => {
    setVisible(true);
    Keyboard.dismiss();
  };
  const closeMenu = () => setVisible(false);

  const handleSelect = (value) => {
    setSelectedValue(value);
    closeMenu();
    if (onSelect) onSelect(value);
  };

  const handleChangeText = (text) => {
    setSelectedValue(text);
    if (onChangeText) onChangeText(text);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TextInput
          mode="outlined"
          placeholder={required ? `${placeholder} *` : placeholder}
          placeholderTextColor={COLORS.grey400}
          textColor={COLORS.grey900}
          outlineColor={COLORS.grey300}
          outlineStyle={{ borderRadius: 12 }}
          contentStyle={[{ fontFamily: 'bg-medium', fontSize: 16, textOverflow: 'ellipsis'}, style]}
          activeOutlineColor={COLORS.pink500}
          value={selectedValue || value} // Show selected value
          right={
            dropdown ? (
              <TextInput.Icon
                icon={() => <CaretDown color={COLORS.grey900} size={20} />}
                onPress={() => {
                  if (!disabled) openMenu();
                }}
              />
            ) : null
          }
          keyboardType={numeric ? 'numeric' : null}
          ellipsizeMode="tail"
          numberOfLines={multiline ? 6 : 1}
          multiline={multiline ? true : false}
          style={{paddingVertical: multiline? 14 : 0}}
          onChangeText={handleChangeText}
          ref={ref}
          disabled={disabled}
        />
      }
      anchorPosition='bottom'
      statusBarHeight={40}
      elevation={1}
      style={{borderRadius: 20}}
      contentStyle={{borderRadius: 16, paddingVertical: 0, overflow: 'hidden', backgroundColor: COLORS.grey100}}
    >
      {data && data.map((item, index) => (
        <Menu.Item 
          key={index} 
          titleStyle={styles.menuItem} 
          onPress={() => handleSelect(item)} 
          title={item} 
        />
      ))}
    </Menu>
  );
});

const styles = StyleSheet.create({
  menuItem: {
    fontFamily: 'bg-regular',
    color: COLORS.grey800,
  }
});

