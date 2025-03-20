import { COLORS } from '../../../colors/colors.js';
import { Button } from '../../../components/button.js';
import { useNavigation } from '@react-navigation/native';
import { Image, View, Text } from 'react-native';
import { styles } from '../../../styles/styles.js';
import OnboardingIllus from '../../../../assets/onboarding/orbital.svg'

export default function OnboardingOrbital() {
  const navigation = useNavigation();
  return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: COLORS.grey100, paddingHorizontal: 36, paddingTop: 60}}>
      <View style={{gap: 32}}>
        <View style={{alignItems: 'center', height: 210, justifyContent: 'center'}}>
          <OnboardingIllus height={280} />
        </View>

        <View style={{gap: 4}}>
          <Text style={styles.onboardingHeader}>Support Each Other in Orbital</Text>
          <Text style={styles.onboardingText}>Connect with family or caregivers to share medication schedules, send reminders, and post encouraging messages on each other's boards.</Text>
        </View>

        <View style={{padding: 8, flexDirection: 'row', gap: 8}}>
          <View style={{flex: 0.3}}>
            <Button size='large' type='outline' label='Back' onPress={() => navigation.goBack()}></Button>
          </View>
          <View style={{flex: 0.7}}>
            <Button size='large' type='fill' label='Next' onPress={() => navigation.navigate('OnboardingCarebot')} style={{flex: 0.7}}></Button>
          </View>
        </View>
      </View>
    </View>
  );
}