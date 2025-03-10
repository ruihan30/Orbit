import { create } from 'zustand';
import { db } from '../utilities/firebaseConfig.js';
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// const auth = getAuth();

const useMedStore = create((set) => ({
  medications: [],
  loading: false,
  error: null,
  setMedications: (medications) => set({ medications }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchMedications: async () => {
    const user = getAuth().currentUser;
    set({ loading: true }); // Set loading to true when fetching
    try {
      const medicationsCollection = collection(db, "user", user.uid, 'medications');
      const querySnapshot = await getDocs(medicationsCollection);
      const medications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      set({ medications }); // Set fetched medications in the store
      set({ loading: false }); // Set loading to false after fetching
      console.log('fetched medications')
    } catch (error) {
      console.error('Error fetching medications from Firestore:', error);
      set({ error: error.message, loading: false }); // Handle error
    }
  },
}));

export default useMedStore;