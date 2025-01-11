import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { COLORS } from './src/colors/colors.js';
import { Heart, House, Pill, Planet, Plus} from 'phosphor-react-native';
import { Button } from 'react-native-paper';

import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import CustomTabBar from './src/components/CustomTabBar';

import Home from './src/screens/Home';
import Medication from './src/screens/Medication';
import Orbital from './src/screens/Orbital';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [fontsLoaded] = useFonts ({
    'bg-xbold': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-ExtraBold.ttf'),
    'bg-semibold': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-SemiBold.ttf'),
    'bg-bold': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-Bold.ttf'),
    'bg-medium': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-Medium.ttf'),
    'bg-regular': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-Regular.ttf'),
    'bg-light': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-Light.ttf'),
    'bg-xlight': require('./assets/fonts/BricolageGrotesque/BricolageGrotesque-ExtraLight.ttf'),

    's-xbold': require('./assets/fonts/Sora/Sora-ExtraBold.ttf'),
    's-semibold': require('./assets/fonts/Sora/Sora-SemiBold.ttf'),
    's-bold': require('./assets/fonts/Sora/Sora-Bold.ttf'),
    's-medium': require('./assets/fonts/Sora/Sora-Medium.ttf'),
    's-regular': require('./assets/fonts/Sora/Sora-Regular.ttf'),
    's-thin': require('./assets/fonts/Sora/Sora-Thin.ttf'),
    's-light': require('./assets/fonts/Sora/Sora-Light.ttf'),
    's-xlight': require('./assets/fonts/Sora/Sora-ExtraLight.ttf'),
  })

  if (!fontsLoaded) {
    return null; // Or show a loading spinner
  }
  

  const [index, setIndex] = React.useState(0);

  const routes = [
    {
      key: 'home',
      title: 'Home',
      focusedIcon: <House weight="fill" color={COLORS.teal700} size={28}/>,  // For focused state
      unfocusedIcon: <House weight="regular" color={COLORS.grey500} size={28}/> // For unfocused state
    },
    {
      key: 'medication',
      title: 'Medication',
      focusedIcon: <Pill weight="fill" color={COLORS.teal700} size={28} />, 
      unfocusedIcon: <Pill weight="regular" color={COLORS.grey500} size={28}/>
    },
    {
      key: 'orbital',
      title: 'Orbital',
      focusedIcon: <Planet weight="fill" color={COLORS.teal700} size={28}/>, 
      unfocusedIcon: <Planet weight="regular" color={COLORS.grey500} size={28}/>
    },
    {
      key: 'add',
      title: 'Actions',
      focusedIcon: <Plus weight="fill" color={COLORS.teal700} size={28}/>, 
      unfocusedIcon: <Plus weight="regular" color={COLORS.grey500} size={28}/>
    }
  ];

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <Home />;
      case 'medication':
        return <Medication />;
      case 'orbital':
        return <Orbital />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
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
              color: focused ? COLORS.teal700 : COLORS.grey500, 
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'blue'
  },
});

  // <View style={styles.container}>
  //   <Text style={{ fontFamily: 'bg-medium', fontSize: 20 }}>Bricolage Grotesque Header</Text>
  //   <Text style={{ fontFamily: 's-regular', fontSize: 16, color: '#9E9E9E', }}>Sora Body font</Text>
  //   <Heart size={40} color="blue" />
  //   <Button mode='contained'>
  //     React Native Paper Button
  //   </Button>
  //   <StatusBar style="auto" />
  // </View>