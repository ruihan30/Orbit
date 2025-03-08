import React, { createContext, useContext, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View,  } from 'react-native';
import { COLORS } from '../colors/colors';
import { Shadow } from 'react-native-shadow-2';
import { styles } from '../styles/styles';
import { Dimensions } from 'react-native';

const BottomSheetContext = createContext(null);
const { width, height } = Dimensions.get('window');

export const BottomSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null);
  const [content, setContent] = useState(null);

  const openBottomSheet = (getComponent) => {
    console.log("Opening BottomSheet with content...");
    setContent(() => getComponent);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    console.log("Closing BottomSheet...");
    bottomSheetRef.current?.close();
    setContent(null);
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheetContext.Provider value={{ bottomSheetRef, openBottomSheet, closeBottomSheet}}>
      {children}
      <CustomBottomSheet ref={bottomSheetRef} content={content} onChange={handleSheetChanges}/>
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};

const shadow = () => {
  return (
    <Shadow
      sides={{top: true, bottom: false, start: false, end: false}}
      style={{width: width, overflow: 'hidden'}}>
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
    </Shadow>
  );
};

const CustomBottomSheet = forwardRef(({ content, onChange }, ref) => {
  const bottomSheetRef = useRef(null);

  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand(),
    close: () => bottomSheetRef.current?.close(),
  }));

  console.log("Current BottomSheet content:", content);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["10%", "40%"]}
      enablePanDownToClose={true}
      onChange={onChange}
      style={{ zIndex: 100 }}
      handleComponent={shadow}
    >
      <BottomSheetView>
        {content ? content() : <Text style={{ fontSize: 16 }}>No Content</Text>}
      </BottomSheetView>
    </BottomSheet>
  );
});