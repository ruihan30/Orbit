import { create } from 'zustand';
import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useMedStore = create((set) => ({
  medications: [],
  loading: false,
  error: null,
  setMedications: (medications) => set({ medications }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchMedications: async () => {
    const auth = getAuth();
    set({ loading: true }); // Set loading to true when fetching
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const medicationsCollection = collection(db, "user", user.uid, "medications");
          const querySnapshot = await getDocs(medicationsCollection);
          const medications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          set({ medications, loading: false });
          // console.log("Fetched medications:", medications);
        } catch (error) {
          console.error("Error fetching medications:", error);
          set({ error: error.message, loading: false });
        }
      } else {
        console.warn("No user logged in, skipping medication fetch");
        set({ loading: false });
      }

      unsubscribe(); // Stop listening after first call
    });
  },
  // fetchMedications: () => {
  //   const auth = getAuth();
  //   set({ loading: true });
  //   const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       try {
  //         const medicationsCollection = collection(db, "user", user.uid, "medications");

  //         const unsubscribeMedications = onSnapshot(medicationsCollection, (querySnapshot) => {
  //           const medications = querySnapshot.docs.map(doc => ({
  //             id: doc.id,
  //             ...doc.data(),
  //           }));
  //           set({ medications, loading: false });
  //           // console.log("Real-time fetched medications:", medications);
  //         });

  //         return () => {
  //           unsubscribeMedications();
  //         };
  //       } catch (error) {
  //         console.error("Error fetching medications:", error);
  //         set({ error: error.message, loading: false });
  //       }
  //     } else {
  //       console.warn("No user logged in, skipping medication fetch");
  //       set({ loading: false });
  //     }
  //   });

  //   return () => {
  //     unsubscribeAuth(); 
  //   };
  // },

}));

export default useMedStore;