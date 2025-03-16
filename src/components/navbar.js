import { COLORS } from "../colors/colors";
import { StyleSheet, Text, View,  } from 'react-native';
import useMedStore from "../store/useMedStore";
import useAlarmStore from "../store/useAlarmStore";
import { Sparkle, House, Pill, Planet, Plus} from 'phosphor-react-native';
import { React, useState, useCallback, useEffect,useRef } from 'react';
import { BottomNavigation } from "react-native-paper";
import Home from "../screens/Home";
import Medication from "../screens/Medication";
import Orbital from "../screens/Orbital";
import CareBot from "../screens/CareBot";
import { Portal, FAB } from "react-native-paper";
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { TopBar } from "./topbar";
import Logo from '../../assets/logo_name_nopad.svg';

export const NavBar = () => {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const navigationState = useNavigationState(state => state);
  const [fabVisible, setFabVisible] = useState(true);
  const [state, setState] = useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;

  useEffect(() => {
    if (navigationState) {
      const currentScreen = navigationState.routes[navigationState.index].name;
      setFabVisible(currentScreen === "NavBar");
    }
  }, [navigationState]);

  const routes = [
    {
      key: 'home',
      title: 'Home',
      focusedIcon: <House weight="fill" color={COLORS.green600} size={28}/>,  
      unfocusedIcon: <House weight="regular" color={COLORS.grey500} size={28}/> 
    },
    {
      key: 'medication',
      title: 'Medication',
      focusedIcon: <Pill weight="fill" color={COLORS.green600} size={28} />, 
      unfocusedIcon: <Pill weight="regular" color={COLORS.grey500} size={28}/>
    },
    {
      key: 'orbital',
      title: 'Orbital',
      focusedIcon: <Planet weight="fill" color={COLORS.green600} size={28}/>, 
      unfocusedIcon: <Planet weight="regular" color={COLORS.grey500} size={28}/>
    },
    {
      key: 'carebot',
      title: 'CareBot',
      focusedIcon: <Sparkle weight="fill" color={COLORS.green600} size={28}/>, 
      unfocusedIcon: <Sparkle weight="regular" color={COLORS.grey500} size={28}/>
    },

  ];

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <Home onNavigateTo={handleTabChange} params={{ message: 'message' }}/>;
      case 'medication':
        return <Medication />;
      case 'orbital':
        return <Orbital />;
      case 'carebot':
        return <CareBot />;
      // case 'add':
      //     return <Login />;
      default:
        return null;
    }
  };

  const handleTabChange = (newIndex) => {
    setIndex(newIndex); // Change the index based on the tab you want to navigate to
  };

  const getTitle = (index) => {
    switch (index) {
      case 0:
        return <Logo height={22} width={100}/>;
      case 1:
        return 'My Medications';
      case 2:
        return 'My Orbital';
      case 3:
        return 'CareBot';
      default:
        return 'App';
    }
  };

  return (
  <GestureHandlerRootView>
    <Portal>
      <FAB.Group
        open={open}
        visible={fabVisible}
        icon={open ? 'window-close' : 'plus'}
        actions={[
          {
            icon: 'account-heart',
            label: 'Orbital',
            onPress: () => navigation.navigate('Profile'),
            size:'medium',
            color: COLORS.grey800,
            labelStyle: styles.label,
            style: styles.backgroundColor
          },
          {
            icon: 'note-text',
            label: 'Reminder',
            onPress: () => navigation.navigate('ReminderDetails'),
            size:'medium',
            color: COLORS.grey800,
            labelStyle: styles.label,
            style: styles.backgroundColor
          },
          {
            icon: 'alarm',
            label: 'Alarm',
            onPress: () => navigation.navigate('AlarmDetails'),
            size:'medium',
            color: COLORS.grey800,
            labelStyle: styles.label,
            style: styles.backgroundColor
          }, 
          {
            icon: 'pill',
            label: 'Medication',
            onPress: () => navigation.navigate('MedicationDetails'),
            size:'medium',
            color: COLORS.grey800,
            labelStyle: styles.label,
            style: styles.backgroundColor
          },
        ]}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
        style={{position: 'absolute', paddingBottom: 70, zIndex: 0}}
        color={COLORS.white}
        fabStyle={{backgroundColor: COLORS.green500}}
        backdropColor='rgba(0, 0, 0, 0.5)'
        mode='flat'
        rippleColor='rgba(68,114,118,0.2)'
      />
    </Portal>

    <TopBar title={getTitle(index)} />

    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex} // Update state on tab change
      renderScene={renderScene}
      renderIcon={({ route, focused }) => {
        const routeData = routes.find(r => r.key === route.key);
        return focused ? routeData.focusedIcon : routeData.unfocusedIcon;
      }}
      renderLabel={({ route, focused }) => (
        <Text
          style={{
            fontFamily: 'bg-regular',
            fontSize: 12,
            color: focused ? COLORS.green500 : COLORS.grey500, 
            textAlign: 'center',
          }}
        >
          {route.title}
        </Text>
      )}
      barStyle={{  
        elevation: 0,
        height: 76,
        backgroundColor: '#ffffff',
        opacity: 0.98,
        borderTopWidth: 1,
        borderTopColor: COLORS.grey200,
      }}
      activeIndicatorStyle={{
        height: 34,
        marginTop: 4,
        backgroundColor: COLORS.teal100
      }}
    >
    </BottomNavigation>
  </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontFamily: 'bg-medium',
    fontSize: 16,
    color: COLORS.white
  },
  backgroundColor: {
    backgroundColor: COLORS.grey200
  }
});