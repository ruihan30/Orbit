import { StyleSheet } from 'react-native';
import {COLORS} from '../colors/colors.js';

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
    backgroundColor: COLORS.pink500,
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
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },

  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 100,
    // backgroundColor: 'blue'
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  picker: {
    // width: '100%',
    // height: 150,
    flex: 1
  },
  selectedTime: {
    fontSize: 18,
    marginTop: 20,
  },

});