import { create } from 'zustand';
import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import useAuthStore from './useAuthStore.js';

// const auth = getAuth();

const useAlarmStore = create((set) => ({
  alarms: [],
  loading: false,
  error: null,
  setAlarms: (alarms) => set({ alarms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchAlarms: async () => {
    const user = getAuth().currentUser;
    set({ loading: true }); // Set loading to true when fetching
    try {
      const alarmsCollection = collection(db, "user", user.uid, 'alarms');
      const querySnapshot = await getDocs(alarmsCollection);
      const alarms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      set({ alarms }); // Set fetched medications in the store
      set({ loading: false }); // Set loading to false after fetching
      console.log('fetched alarm')
    } catch (error) {
      console.error('Error fetching alarms from Firestore:', error);
      set({ error: error.message, loading: false }); // Handle error
    }
  },
  updateAlarm: async (updatedAlarm) => {
    const user = getAuth().currentUser;
    set({ loading: true }); // Set loading to true when updating

    try {
      // Reference to the alarm document in Firestore
      const alarmDocRef = doc(db, "user", user.uid, 'alarms', updatedAlarm.id);
      const alarmDocSnap = await getDoc(alarmDocRef);
      const existingAlarm = alarmDocSnap.data();
      const alarmToUpdate = {
        ...existingAlarm,
        ...updatedAlarm,
      };

      // Update the document in Firestore
      await updateDoc(alarmDocRef, alarmToUpdate);

      // Update the alarm in the Zustand store
      set((state) => {
        const updatedAlarms = state.alarms.map((alarm) =>
          alarm.id === updatedAlarm.id ? updatedAlarm : alarm
        );
        return { alarms: updatedAlarms }; // Update the specific alarm in the store
      });

      set({ loading: false }); // Set loading to false after updating
    } catch (error) {
      console.error('Error updating alarm in Firestore:', error);
      set({ error: error.message, loading: false }); // Handle error
    }
  },
  addAlarm: async (newAlarm) => {
    const user = getAuth().currentUser;
    set({ loading: true });
  
    try {
      // Exclude the 'id' property from alarmDetails before sending to Firestore
      const { id, ...alarmWithoutId } = newAlarm;
  
      // Add the alarm to Firestore (Firestore will generate the ID)
      const newAlarmRef = await addDoc(collection(db, "user", user.uid, "alarms"), alarmWithoutId);
  
      set({ loading: false });
    } catch (error) {
      console.error('Error adding alarm in Firestore:', error);
      set({ error: error.message, loading: false });
    }
  },
}));

export default useAlarmStore;