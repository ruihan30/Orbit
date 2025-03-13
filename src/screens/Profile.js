import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Alert, Dimensions, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, SegmentedButtons, List, TouchableRipple, Menu, Divider, PaperProvider, Modal, Portal, Snackbar } from 'react-native-paper';
import { Plus, User, PersonArmsSpread, Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse, PawPrint } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../colors/colors.js';
import { styles } from '../styles/styles.js';
import { Button } from '../components/button.js';
import { InputField } from '../components/inputField.js';
import useAuthStore from '../store/useAuthStore.js';
import { getAuth } from 'firebase/auth';
import { db } from '../utilities/firebaseConfig.js';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Shadow } from 'react-native-shadow-2';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function Profile() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [displayName, setDisplayName] = useState('');
  const [selectedColor, setSelectedColor] = useState('red');
  const [bgColor, setBgColor] = useState('fadedRed');
  const [selectedAvatar, setSelectedAvatar] = useState('Rabbit');
  const [modalVisible, setModalVisible] = useState(false);
  const testcolor = 'error';
  
  const bottomSheetRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  
  const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
  const RAINBOW_FADED = ['fadedRed', 'fadedOrange', 'fadedYellow', 'fadedGreen', 'fadedBlue', 'fadedPurple', 'fadedPink'];
  const ICONS = [Rabbit, Bird, Butterfly, Cat, Cow, Dog, FishSimple, Horse, PawPrint];
  const ICONS_STRING = ['Rabbit', 'Bird', 'Butterfly', 'Cat', 'Cow', 'Dog', 'FishSimple', 'Horse'];

  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const closeBottomSheet = () => bottomSheetRef.current?.close();

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

  useEffect(() => {
    setDisplayName(user.email);
  }, [])

  useEffect(() => {
    const index = RAINBOW.indexOf(selectedColor);
    if (index !== -1) {
      setBgColor(RAINBOW_FADED[index]);
    }
  }, [selectedColor])
  
  return (
    <PaperProvider>
      <ScrollView style={{backgroundColor: COLORS.white, position: 'relative', padding: 16}}>
        <Portal>
          
          <Modal 
            visible={modalVisible} 
            onDismiss={() => setModalVisible(false)}
            // style={{backgroundColor: COLORS.white, marginHorizontal: 16}}
          >
            <View style={[styles.modalWrapper, {padding: 0, paddingTop: 12}]}>
              <View style={{paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.grey300}}>
                <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}>
                  Choose your avatar
                </Text>
              </View>

              <View style={styles.flexRow}>
                <View style={[styles.flexColumn, {gap: 4, padding: 8, justifyContent: 'flex-start', paddingVertical: 12, height: 450}]}>
                  {RAINBOW.map((color) => (
                    <Pressable 
                      key={color}
                      style={[styles.chooseColor, {
                        borderColor: selectedColor == color ? COLORS[color] : 'transparent',
                        borderWidth: selectedColor == color ? 2 : 0,
                        zIndex: 1000
                      }]}
                      onPress={() => {setSelectedColor(color); console.log('pressed')}}
                    >
                      <View style={{backgroundColor: COLORS[color], width: '100%', height: '100%', borderRadius: 100}}></View>
                    </Pressable>
                  ))}
                </View>

                <View style={{flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: 'row', flex: 1, gap: 8, justifyContent: 'space-between', padding: 12, height: 450}}>
                  {ICONS.map((Icon, index) => (
                    <TouchableRipple
                      key={ICONS_STRING[index]}
                      style={[styles.chooseAvatar, {
                        backgroundColor: COLORS[bgColor],
                        borderWidth: selectedAvatar === ICONS_STRING[index] ? 2 : 0, 
                        borderColor: selectedAvatar === ICONS_STRING[index] ? COLORS[selectedColor] : 'transparent',
                      }]}
                      rippleColor={'rgba(51,51,51,0.25)'}
                      onPress={() => {setSelectedAvatar(ICONS_STRING[index]); console.log('icon: ', ICONS_STRING[index]);}}
                      borderless={true}
                    >
                      <Icon size={44} color={COLORS[selectedColor]} weight='regular'/>
                    </TouchableRipple>
                  ))}

                </View>
              </View>

              <View style={[styles.bottomBtns, {}]}>
                <Button 
                  size='large' 
                  type='outline' 
                  label='Cancel' 
                  onPress={() => setModalVisible(false)}
                  customStyle={{flex: 1}}
                  rippleColor={'rgba(51,51,51,0.25)'}></Button>
                <Button 
                  size='large' 
                  type='fill' 
                  label='Save' 
                  onPress={() => {

                  }}
                  customStyle={{flex: 1}}></Button>
              </View>
            </View>
            
          </Modal>

        </Portal>

        {/* Profile pic */}
        <View style={{width: '100%', padding: 20, gap: 12}}>
          <Pressable style={styles.avatar} onPress={() => setModalVisible(true)}>
            
            <User size={64} color={COLORS.grey400} weight='regular'/>
            <Pressable style={styles.changeAvatar} onPress={openBottomSheet}>
              <PersonArmsSpread size={28} color={COLORS.green600}/>
            </Pressable>
          </Pressable>
          
          <View>
            <TextInput
              value={displayName}
              onChangeText={(text) => setDisplayName(text)}
              placeholder='Display Name'
              mode='flat'
              underlineColor={COLORS.pink800}
              activeUnderlineColor={COLORS.pink500}
              underlineStyle={{borderRadius: 20}}
              contentStyle={{fontFamily: 's-regular', backgroundColor: COLORS.white}}
              textColor={COLORS.grey600}
              placeholderTextColor={COLORS.grey450}
              style={{marginHorizontal: 20}}
            />
          </View>
        </View>

        {/* Support Orbital */}

        <View style={{paddingVertical: 20, gap: 12}}>
          <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14}}>Support Orbital</Text>
          <ScrollView
            horizontal={true}
            style={{overflow: 'visible'}}
          >
            <View style={{width: 76, gap: 4}}>
              <View style={styles.supportImgs}>
                <Plus color={COLORS.grey600}/>
              </View>
              <Text 
                style={{fontFamily: 'bg-regular', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}
                numberOfLines={1} 
                ellipsizeMode="tail" 
              >
              </Text>
            </View>
            
            <View style={styles.supportImgs}></View>
            <View style={styles.supportImgs}></View>
            <View style={styles.supportImgs}></View>
            <View style={styles.supportImgs}></View>
            <View style={styles.supportImgs}></View>
            <View style={styles.supportImgs}></View>
            <View style={styles.supportImgs}></View>

          </ScrollView>
        </View>

      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["40%", "80%"]}
        enablePanDownToClose={true}
        // onChange={handleSheetChanges}
        style={{ zIndex: 100 }}
        handleComponent={shadow}
        gestureEnabled={false}
      >
        <BottomSheetView style= {{flex: 1}}>

          <View style={{paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.grey300}}>
            <Text style={{fontFamily: 's-semibold', color: COLORS.grey600, fontSize: 14, textAlign: 'center'}}>
              Choose your avatar
            </Text>
          </View>

          <View style={[styles.flexRow, {gap: 4, padding: 8, justifyContent: 'space-between', paddingTop: 20}]}>
            {RAINBOW.map((color) => (
              <Pressable 
                key={color}
                style={[styles.chooseColor, {
                  borderColor: selectedColor == color ? COLORS[color] : 'transparent',
                  borderWidth: selectedColor == color ? 2 : 0,
                  zIndex: 1000
                }]}
                onPress={() => {setSelectedColor(color); console.log('pressed')}}
              >
                <View style={{backgroundColor: COLORS[color], width: '100%', height: '100%', borderRadius: 100}}></View>
              </Pressable>
            ))}
          </View>

          <View style={{flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: 'row'}}>
            {ICONS.map((Icon) => (
              <TouchableRipple
                key={Icon}
                style={[styles.chooseAvatar, {
                  backgroundColor: COLORS[bgColor],
                  
                }]}
                rippleColor={'rgba(51,51,51,0.25)'}
                onPress={() => {console.log('select avatar')}}
                borderless={true}
              >
                <Icon size={44} color={COLORS[selectedColor]} weight='regular'/>
              </TouchableRipple>
            ))}

          </View>



          <View style={[styles.bottomBtns, {}]}>
            <Button 
              size='large' 
              type='outline' 
              label='Cancel' 
              onPress={closeBottomSheet}
              customStyle={{flex: 1}}
              rippleColor={'rgba(51,51,51,0.25)'}></Button>
            <Button 
              size='large' 
              type='fill' 
              label='Save' 
              onPress={() => {

              }}
              customStyle={{flex: 1}}></Button>
          </View>

        </BottomSheetView>
      </BottomSheet>
    </PaperProvider>
  );
}