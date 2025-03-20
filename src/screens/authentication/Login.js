import { React, useState, useRef, useEffect }from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Snackbar, ActivityIndicator } from 'react-native-paper';
import { COLORS } from '../../colors/colors.js';
import { Button } from '../../components/button.js';
import Logo from '../../../assets/logo_name.svg';
import { styles } from '../../styles/styles.js';
import { GoogleLogo, X } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithCredential} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import useAuthStore from '../../store/useAuthStore.js';
import { app, auth } from '../../utilities/firebaseConfig.js';
import { db } from '../../utilities/firebaseConfig.js';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import useMedStore from '../../store/useMedStore.js';
import useAlarmStore from '../../store/useAlarmStore.js';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '226869919323-5ktefds9afuu9qg5ovamsc75rospoqlo.apps.googleusercontent.com'
  });
  const { medications, fetchMedications } = useMedStore();
  const { alarms, fetchAlarms, updateAlarm } = useAlarmStore(); 

  const [email, setEmail] = useState('');
  const emailRef = useRef(null);

  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordRef = useRef(null);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const [visible, setVisible] = useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  const [errorMsg, setError] = useState('');

  // GoogleSignin.configure({
  //   webClientId: '226869919323-1g26u463boij6bv7jguuqafoeh27s34h.apps.googleusercontent.com', 
  // });

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        emailRef.current.focus();
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'Your account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        passwordRef.current.focus(); 
        return 'Incorrect password. Please try again.';
      case 'auth/missing-password':
        passwordRef.current.focus(); 
        return 'Missing password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/internal-error':
        return 'An unexpected error occurred. Please try again later.';
      case 'auth/invalid-credential':
        return 'The email or password you entered is incorrect.  Please try again later.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  const handleLogin = async () => {
    const auth = getAuth(app);
    
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
  
      const userDocRef = doc(db, "user", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.email,
          profileIcon: null,
          profileColor: '',
          invites: [],
          connectedUsers: [],
          reminders: [],
          createdAt: serverTimestamp(), 
        });
      } else {
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
        });
      }

      login(user, idToken);

      await fetchMedications();
      await fetchAlarms();

      navigation.navigate('NavBar'); 
  
    } catch (error) {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      onToggleSnackBar();
      console.log(error.message);
    } finally {
      setLoading(false); 
    }
  };
  
  useEffect(() => {
    if (response?.type === 'success') {
      const {id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response])

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
    <SafeAreaView style={loginStyles.container}>

      {/* Header */}
      <View style={loginStyles.header}>
        <View style={loginStyles.logoWrapper}><Logo height='70'></Logo></View>
        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, textAlign: 'center'}}>
          Welcome to Orbit
        </Text>
        <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey500, textAlign: 'center'}}>
          Log in to manage your medication and stay at the heart of your wellness.
        </Text>
      </View>

      {/* Input fields */}
      <View style={loginStyles.inputs}>
        <TextInput 
          label="Email Address" 
          value={email} 
          onChangeText={email => setEmail(email)} 
          mode='outlined'
          outlineColor={COLORS.grey300}
          textColor={COLORS.grey700}
          contentStyle={{fontFamily: 'bg-regular'}}
          outlineStyle={{borderRadius: 12}}
          activeOutlineColor={COLORS.pink600}
          ref={emailRef}
        />

        <TextInput 
          label="Password" 
          value={password} 
          onChangeText={password => setPassword(password)} 
          mode='outlined'
          outlineColor={COLORS.grey300}
          textColor={COLORS.grey700}
          contentStyle={{fontFamily: 'bg-regular'}}
          outlineStyle={{borderRadius: 12}}
          activeOutlineColor={COLORS.pink600}
          right={<TextInput.Icon 
            icon={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} 
            onPress={togglePasswordVisibility} 
          />}
          secureTextEntry={!isPasswordVisible}
          ref={passwordRef}
        />
      </View>

      {/* Buttons */}
      <View style={loginStyles.buttons}>
        <Button size='large' type='fill' label='Log in' onPress={handleLogin}></Button>
        <View style={{height: 2, borderTopWidth: 0.5, marginHorizontal: 20, borderColor: COLORS.grey400 }}></View>
        <Button onPress={() => promptAsync()} size='large' type='outline' label='Log in with Google' icon={<GoogleLogo size={18} color={COLORS.teal900} weight='regular' />}></Button>
      </View>
      
      {/* Footer */}
      <View style={loginStyles.footer}>
        <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey500, textAlign: 'center'}}>
          Don't have an account? <Text onPress={() => navigation.replace('Signup')} style={{fontFamily: 'bg-medium', color: COLORS.pink600, textDecorationLine: 'underline'}}>Sign Up</Text>
        </Text>
      </View>

      {/* Toast */}
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={5000}
        onIconPress={() => setVisible(false)}
        icon={() => <X size={20} color={COLORS.white} weight='bold' />}
        style={[styles.snackbar, {backgroundColor: COLORS.error}]}
        wrapperStyle={{width: Dimensions.get("window").width}}
      >
        <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.white}}>
          {errorMsg}
        </Text>
      </Snackbar>
      
    </SafeAreaView>
  );
}
 
const loginStyles = StyleSheet.create({
  container: {
    display: 'relative',
    flex: 1,
    padding: 24,
    gap: 32,
    justifyContent: 'center',
    backgroundColor: COLORS.white
  },
  logoWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  header: {
    gap: 8,
    textAlign: 'center'
  },
  inputs: {
    gap: 8
  },
  buttons: {
    gap: 16
  },
  footer: {
    padding: 20
  }
});