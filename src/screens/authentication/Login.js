import { React, useState, useRef }from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Snackbar } from 'react-native-paper';
import { COLORS } from '../../colors/colors.js';
import { Button } from '../../components/button.js';
import Logo from '../../../assets/logo_name.svg';
import { styles } from '../../styles/styles.js';
import { GoogleLogo, X } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import { GoogleSignin } from '@react-native-google-signin/google-signin'; 
import useAuthStore from '../../store/useAuthStore.js';
import app from '../../utilities/firebaseConfig.js';

export default function Login() {
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const emailRef = useRef(null);

  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
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

  const handleLogin = () => {
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Login successful
        const user = userCredential.user;

        user.getIdToken()
          .then((idToken) =>{
            console.log('Logged in as:', user.email);
            console.log('ID Token:', idToken);
            login(user, idToken);
            navigation.navigate('NavBar'); 
          })
          .catch((error) => {
            console.error('Error fetching token:', tokenError.message);
          });
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error.code);
        setError(errorMessage);
        onToggleSnackBar()
        console.log(error.message);
      });
  };

  const handleGoogleLogin = async () => {
    try {
      // Sign in with Google
      const { idToken } = await GoogleSignin.signIn();
  
      // Create a Firebase credential with the Google ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
      // Sign in the user with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
  
      // Access user details
      const user = userCredential.user;
      console.log('Logged in as:', user.email);
      // Navigate or handle the logged-in user
    } catch (error) {
      console.error('Error during Google login:', error.message);
      // Handle errors (e.g., display a toast or message)
    }
  };
  
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
          activeOutlineColor={COLORS.teal700}
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
          activeOutlineColor={COLORS.teal700}
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
        <Button onPress={handleGoogleLogin} size='large' type='outline' label='Log in with Google' icon={<GoogleLogo size={18} color={COLORS.teal900} weight='regular' />}></Button>
      </View>
      
      {/* Footer */}
      <View style={loginStyles.footer}>
        <Text style={{fontFamily: 'bg-regular', fontSize: 14, color: COLORS.grey500, textAlign: 'center'}}>
          Don't have an account? <Text onPress={() => navigation.navigate('Signup')} style={{fontFamily: 'bg-medium', color: COLORS.teal900, textDecorationLine: 'underline'}}>Sign Up</Text>
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