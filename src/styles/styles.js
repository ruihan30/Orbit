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
    paddingTop: 8,
    paddingBottom: 12,
    borderColor: COLORS.grey300,
    borderRadius: 24,
    marginBottom: 8,
    gap: 8,
    elevation: 1
  },
  numberOfMeds: {
    backgroundColor: COLORS.pink100,
    width: 40,
    height: 30,
    borderWidth: 1,
    borderColor: COLORS.pink500,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2
  },
  alarmMedicationRipple: {
    backgroundColor: COLORS.pink100,
    borderWidth: 1.5,
    borderColor: COLORS.pink300,
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

  // Alarm Details
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
    color: COLORS.grey700
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 2,
    backgroundColor: COLORS.pink100,
    borderRadius: 20,
    padding: 2,
    borderWidth: 0.5,
    borderColor: COLORS.pink400
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
    backgroundColor: '#F6F6F6',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 12
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
  checkbox: {
    position: 'absolute', 
    zIndex: 4, 
    right: 0,
    backgroundColor: COLORS.grey100, 
    borderRadius: 8,
  },
  imgWrapper: {

  },

  // Medication
  medicationGrid:{
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  medicationRipple: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    alignSelf: 'start',
    width: (width/2)-12,
    marginTop: 8,
  },
  medicationHeader: {
    fontFamily: 's-semibold',
    fontSize: 12,
  },
  medicationText: {
    fontFamily: 'bg-regular',
    fontSize: 14,
    color: COLORS.grey700
  },

  
  // Medication Details
  medicationImgWrapper: {
    height: height/10*5,
    backgroundColor: COLORS.grey200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicationImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  cameraBtn: {
    width: 58,
    height: 58,
    backgroundColor: COLORS.teal100,
    borderRadius: 100,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 12,
    right: 12,
    elevation: 5
  },
  calendarPicker: {
    zIndex: 2,
    borderRadius: 16,
    elevation: 5,
  },
  sideEffects: {
    gap: 8, 
    marginHorizontal: 16,
    padding: 12,
    paddingBottom: 16,
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
  modalWrapper: {
    width: width/10*9,
    backgroundColor: COLORS.white,
    alignSelf: 'center',
    borderRadius: 28,
    padding: 20,
    
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
  },

  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    width: 30,
    height: 4,
    backgroundColor: COLORS.grey400,
    borderRadius: 4,
  },


});