import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { COLORS } from './src/colors/colors.js';
import { Heart, House, Pill, Planet} from 'phosphor-react-native';
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

  const Tab = createBottomTabNavigator();
  const [index, setIndex] = React.useState(0);

  const routes = [
    {
      key: 'home',
      title: 'Home',
      focusedIcon: <House weight="fill" color="blue" size={28}/>,  // For focused state
      unfocusedIcon: <House weight="regular" color={COLORS.primary} size={28}/>  // For unfocused state
    },
    {
      key: 'medication',
      title: 'Medication',
      focusedIcon: <Pill weight="fill" />, 
      unfocusedIcon: <Pill weight="regular" />
    },
    {
      key: 'orbital',
      title: 'Orbital',
      focusedIcon: <Planet weight="fill" />, 
      unfocusedIcon: <Planet weight="regular" />
    }
  ];

  return (
    // <NavigationContainer>
    //   <Tab.Navigator
    //     screenOptions={({ route }) => {
    //       const tab = tabData.find(t => t.name === route.name);
          
    //       return {
    //         headerShown: false,
    //         tabBarLabel: tab.label,
    //         tabBarIcon: ({ size, focused }) => {
    //           return React.cloneElement(focused ? tab.focusedIcon : tab.unfocusedIcon, {
    //             size
    //           });
    //         }
    //       };
    //     }}
    //     tabBar={(props) => <CustomTabBar {...props} />}
    //   >

    //     <Tab.Screen name="Home" component={Home} />
    //     <Tab.Screen name="Medication" component={Medication} />
    //     <Tab.Screen name="Orbital" component={Orbital} />
    //   </Tab.Navigator>
    // </NavigationContainer>

    <SafeAreaProvider>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex} // Update state on tab change
        renderScene={({ route }) => {
          switch (route.key) {
            case 'home':
              return <Home />;
            case 'medication':
              return <Medication/>;
            case 'orbital':
              return <Orbital />;
            default:
              return null;
          }
        }}
      >
        {/* Render the visual representation of the bottom navigation bar */}
        <BottomNavigation.Bar
          navigationState={{ index, routes }}
          onTabPress={({ route }) => setIndex(routes.findIndex(r => r.key === route.key))}// Update the active tab
          renderIcon={({ route, focused, color }) => {
            const routeData = routes.find(r => r.key === route.key);
            return focused ? routeData.focusedIcon : routeData.unfocusedIcon;
          }}
        />
      </BottomNavigation>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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