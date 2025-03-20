import { COLORS } from '../../../colors/colors.js';
import { Button } from '../../../components/button.js';
import { useNavigation } from '@react-navigation/native';
import { Image, View, Text } from 'react-native';
import { styles } from '../../../styles/styles.js';
import OnboardingIllus from '../../../../assets/onboarding/medications.svg'

export default function OnboardingMedications() {
  const navigation = useNavigation();
  return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: COLORS.grey100, paddingHorizontal: 36, paddingTop: 60}}>
      <View style={{gap: 32}}>
        <View style={{alignItems: 'center', height: 210, justifyContent: 'center'}}>
          <OnboardingIllus height={280} />
        </View>

        <View style={{gap: 4}}>
          <Text style={styles.onboardingHeader}>Store Your Medications with Ease</Text>
          <Text style={styles.onboardingText}>Effortlessly add your medications to keep track of what you need to take.{'\n'}Stay organised and never forget a dose!</Text>
        </View>

        <View style={{padding: 8}}>
          <Button size='large' type='fill' label='Next' onPress={() => navigation.navigate('OnboardingAlarms')}></Button>
        </View>
      </View>
    </View>
  );
}