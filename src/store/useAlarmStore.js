import { create } from 'zustand';
import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import useAuthStore from './useAuthStore.js';

const useAlarmStore = create((set) => ({
  alarms: [],
  loading: false,
  error: null,
  setAlarms: (alarms) => set({ alarms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchAlarms: async () => {
    const auth = getAuth();
    set({ loading: true }); // Set loading to true when fetching
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const alarmsCollection = collection(db, "user", user.uid, "alarms");
          const querySnapshot = await getDocs(alarmsCollection);
          const alarms = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          set({ alarms, loading: false });
          // console.log("Fetched alarms:", alarms);
        } catch (error) {
          console.error("Error fetching alarms:", error);
          set({ error: error.message, loading: false });
        }
      } else {
        console.warn("No user logged in, skipping alarm fetch");
        set({ loading: false });
      }

      unsubscribe(); // Stop listening after first call
    });
  },
  updateAlarm: async (updatedAlarm) => {
    const user = getAuth().currentUser;
    set({ loading: true }); 

    try {
      const alarmDocRef = doc(db, "user", user.uid, 'alarms', updatedAlarm.id);
      const alarmDocSnap = await getDoc(alarmDocRef);
      const existingAlarm = alarmDocSnap.data();
      const alarmToUpdate = {
        ...existingAlarm,
        ...updatedAlarm,
      };

      await updateDoc(alarmDocRef, alarmToUpdate);

      set((state) => {
        const updatedAlarms = state.alarms.map((alarm) =>
          alarm.id === updatedAlarm.id ? updatedAlarm : alarm
        );
        return { alarms: updatedAlarms }; 
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
      const newAlarmRef = await addDoc(collection(db, "user", user.uid, "alarms"), alarmWithoutId);
  
      set({ loading: false });
    } catch (error) {
      console.error('Error adding alarm in Firestore:', error);
      set({ error: error.message, loading: false });
    }
  },
  deleteAlarm: async (alarmId) => {
    const user = getAuth().currentUser;
    set({ loading: true });

    try {
      const alarmDocRef = doc(db, "user", user.uid, "alarms", alarmId);
      await deleteDoc(alarmDocRef); // Delete the alarm from Firestore

      // Remove the alarm from the Zustand store
      set((state) => {
        const filteredAlarms = state.alarms.filter((alarm) => alarm.id !== alarmId);
        return { alarms: filteredAlarms };
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error deleting alarm from Firestore:', error);
      set({ error: error.message, loading: false });
    }
  },
}));

export default useAlarmStore;