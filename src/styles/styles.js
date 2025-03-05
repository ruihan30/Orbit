import { StyleSheet } from 'react-native';
import {COLORS} from '../colors/colors.js';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  test: {
    backgroundColor: 'blue',
    padding: 0,
  },
  flexRow: {
    display: 'flex',  
    flexDirection: 'row', 
    alignItems: 'center',
  },
  flexColumn: {
    display: 'flex',  
    flexDirection: 'column', 
    alignItems: 'center',
  },
  snackbar: {
    backgroundColor: COLORS.teal900,
    borderRadius: 10
  },

  // Top Bar
  logo: {
    height: 22,
    width: 91
  },
  profile: {
    height: 40,
    width: 40,
    backgroundColor: COLORS.grey200,
  },
  action: {
    borderRadius: 20,
    height: 34,
    width: 42,
    backgroundColor: COLORS.grey200,
  },
  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontFamily: 's-semibold',
    color: COLORS.grey800,
    flex: 1,
    textAlign: 'center',
    fontSize: 16
  },

  // Calendar
  calendar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    display: 'flex',
    gap: 4,
    borderRadius: 20
  },
  week: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4
  },
  weekBtn: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    flex: 1,
    borderRadius: 8
  },
  weekBtnSelected: {
    backgroundColor: COLORS.bg,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    flex: 1,
    borderRadius: 8
  },
  weekBtnToday: {
    backgroundColor: COLORS.teal700,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    flex: 1,
    borderRadius: 8
  },

  // Alarm List
  homeHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bg
  },
  dateHeader: {
    fontFamily: 's-semibold',
    fontSize: 16,
    paddingBottom: 8,
    textAlign: 'center',
    color: COLORS.grey500
  },
  userSelection: {
    display: 'flex',  
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.white,
    padding: 8,
    paddingRight: 16,
    borderRadius: 24,
    justifyContent: 'space-between'
  },
  alarms: {
    paddingHorizontal: 12,
    gap: 8,
    position: 'relative'
  },
  linearGradient: {
    position: 'absolute',
    bottom: -50,
    left: -12,
    right: -12, 
    height: 50,
    zIndex: 2
  },
  alarmItem: {
    backgroundColor: COLORS.white, 
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 4,
    // borderWidth: 0.5,
    borderColor: COLORS.grey300,
    borderRadius: 28,
    marginBottom: 8,
    gap: 4,
  },
  alarmMedicationRipple: {
    backgroundColor: COLORS.pink150,
    borderWidth: 1.5,
    borderColor: COLORS.pink400,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden'
  },
  alarmMedication: {
    display: 'flex',  
    flexDirection: 'row', 
    alignItems: 'center',
    borderRadius: 24,
    height: 100
  },
  alarmMedicationInfo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flex: 1,
  },

  // Add/edit alarm
  days: {
    height: 44,
    width: 44,
    borderWidth: 1,
    borderColor: COLORS.grey300,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40
  },
  daysText: {
    fontFamily: 's-regular',
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.grey600
  },
  daysActive: {
    height: 44,
    width: 44,
    backgroundColor: COLORS.pink550,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
  daysTextActive: {
    fontFamily: 's-regular',
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.white
  },
  deleteSm: {
    backgroundColor: COLORS.pink200,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.error
  },
  bottomBtns: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.grey200,
    position: 'absolute',
    bottom: 0
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(243,243,243,0.75)',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  picker: {
    flex: 1,
  },
  selectedTime: {
    fontSize: 18,
    marginTop: 20,
  },

  // Medication
  medicationGrid:{
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  medicationRipple: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    alignSelf: 'start',
    width: (width/2)-16,
    marginTop: 8
  },
  medicationText: {
    fontFamily: 'bg-medium',
    fontSize: 14,
    color: COLORS.grey600
  },

  
  // Medication Details
  medicationImg: {
    height: height/10*4,
    backgroundColor: COLORS.grey400
  },
  cameraBtn: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.teal700,
    borderRadius: 100,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 12,
    right: 12
  },
  sideEffects: {
    gap: 8, 
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 32,
    backgroundColor: COLORS.grey100,
    borderRadius: 16,
  },
  sideEffectChip: {
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.pink400,
    paddingHorizontal: 12,
    borderRadius: 20
  },

  // Orbital
  profileImg: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.grey300,
    borderRadius: 100,
  },
  reminderBoard: {
    backgroundColor: COLORS.white,
    flex: 1,
    borderTopLeftRadius: 24,
    padding: 8,
  },
  reminderCard: {
    padding: 10,
    gap: 20,
    borderRadius: 16,
    margin: 4
  }


});