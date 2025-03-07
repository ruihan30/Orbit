import { React, useState, useRef }from 'react';
import { Image, View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar, TextInput } from 'react-native-paper';
import { COLORS } from '../../colors/colors.js';
import { Button } from '../../components/button.js';
import Logo from '../../../assets/logo_name.svg';
import { styles } from '../../styles/styles.js';
import { GoogleLogo, X } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../../utilities/firebaseConfig.js'

export default function Signup() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const emailRef = useRef(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const passwordRef = useRef(null);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const [visible, setVisible] = useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  const [errorMsg, setError] = useState('');

  const validatePassword = (password) => {
    // Password must be at least 8 characters, contain one uppercase, one lowercase, one number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        emailRef.current.focus();
        return 'The email address is already in use by another account.';
      case 'auth/invalid-email':
        emailRef.current.focus();
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Contact the administrator.';
      case 'auth/weak-password':
        passwordRef.current.focus(); 
        return 'Password must have at least 8 characters, contain one uppercase, one lowercase and one number.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  const handleSignUp = () => {
    const auth = getAuth(app);

    if (!validatePassword(password)) {
      setPasswordError('Password must have at least 8 characters, contain one uppercase, one lowercase and one number.')
      onToggleSnackBar()
      passwordRef.current.focus(); 
      return;
    } else setPasswordError('');
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User created:', user.email);
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error.code);
        setError(errorMessage);
        onToggleSnackBar()
        console.log(error.message);
      });
  };

  return (
    <SafeAreaView style={loginStyles.container}>

      {/* Header */}
      <View style={loginStyles.header}>
        <View style={loginStyles.logoWrapper}><Logo height='70'></Logo></View>
        <Text style={{fontFamily: 's-semibold', fontSize: 20, color: COLORS.grey800, textAlign: 'center'}}>
          Create an account
        </Text>
        <Text style={{fontFamily: 'bg-regular', fontSize: 16, color: COLORS.grey500, textAlign: 'center'}}>
          Already have an account? <Text onPress={() => navigation.navigate('Login')} style={{fontFamily: 'bg-medium', color: COLORS.teal900, textDecorationLine: 'underline'}}>Log in</Text>
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
        <Button size='large' type='fill' label='Continue' onPress={handleSignUp}></Button>
        <View style={{height: 2, borderTopWidth: 0.5, marginHorizontal: 20, borderColor: COLORS.grey400 }}></View>
        <Button size='large' type='outline' label='Sign up with Google' icon={<GoogleLogo size={18} color={COLORS.teal900} weight='regular' />}></Button>
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
          {passwordError}
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
    gap: 8,
  },
  buttons: {
    gap: 16
  },
});