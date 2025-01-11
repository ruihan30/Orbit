import { StyleSheet } from 'react-native';
import {COLORS} from '../colors/colors.js';

export const styles = StyleSheet.create({
  test: {
    backgroundColor: 'blue',
    padding: 0,
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
    borderRadius: 24
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
  alarms: {
    backgroundColor: COLORS.white, 
    height: 2000,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  text: {
    fontSize: 40,
  },
  alarmItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grey200,
    borderRadius: 16,
    marginBottom: 8
  }

});