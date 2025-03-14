import { React, useState, useCallback, useEffect,useRef }from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,  } from 'react-native';
import { useFonts } from 'expo-font';
import { COLORS } from './src/colors/colors.js';
import { Sparkle, House, Pill, Planet, Plus} from 'phosphor-react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigationState } from '@react-navigation/native';

import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, BottomNavigation, FAB, Portal, PaperProvider } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';

import { getAuth, onAuthStateChanged, signInWithCredential, GoogleAuthProvider} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { app } from './src/utilities/firebaseConfig.js';
import useAuthStore from './src/store/useAuthStore.js';

import { NavBar } from './src/components/navbar.js';
import { TopBar } from './src/components/topbar.js';
import Home from './src/screens/Home.js';
import Medication from './src/screens/Medication.js';
import Orbital from './src/screens/Orbital.js';
import CareBot from './src/screens/CareBot.js';
import Profile from './src/screens/Profile.js';
import Login from './src/screens/authentication/Login';
import Signup from './src/screens/authentication/Signup';
import Landing from './src/screens/authentication/Landing';
import AlarmDetails from './src/screens/actions/alarmDetails.js';
import MedicationDetails from './src/screens/actions/medicationDetails.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/utilities/authProvider.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // const user = useAuthStore((state) => state.user);
  const [userInfo, setUserInfo] = useState();
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   androidClientId: '226869919323-nkog4dbbqniscijkhddfik67fouq1duv.apps.googleusercontent.com'
  // });

  // Fonts
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

  const Stack = createStackNavigator();

  const checkLocalUser = async () => {
    try {
      setLoading(true);
      const userJSON = await AsyncStorage.getItem("@user");
      const userData = userJSON ? JSON.parse(userJSON) : null;
      setUserInfo(userData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);    
    }
  }

  useEffect(() => {
    checkLocalUser();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // console.log(JSON.stringify(user, null, 2));
        setUserInfo(user);
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        console.log('auth changed')
      } else {
        console.log('user is not authenticated')
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    console.log('Loading: ', loading);
  }, [loading])

  if (loading) 
    return (
      <View 
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIndicator animating={true}/>
      </View>
    );
  return (
    <SafeAreaProvider style={styles.container}>
      <PaperProvider>
        <AuthProvider>
          <GestureHandlerRootView>
              <NavigationContainer>
                <Stack.Navigator initialRouteName={userInfo ? 'NavBar' : 'Landing'}>
                  <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }}/>
                  <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                  <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }}/>
                  <Stack.Screen name="NavBar" component={NavBar} options={{ headerShown: false }}/>
                  <Stack.Screen name="AlarmDetails" component={AlarmDetails} options={{ headerShown: false }}/>
                  <Stack.Screen name="MedicationDetails" component={MedicationDetails} options={{ headerShown: false }}/>
                  <Stack.Screen name="Profile" component={Profile} options={{ header: (props) => <TopBar title='Profile' left={true}/>}}/>
                </Stack.Navigator>
              </NavigationContainer>
          </GestureHandlerRootView>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});