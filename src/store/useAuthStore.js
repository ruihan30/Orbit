import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../utilities/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const auth= getAuth();

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      fetchUser: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          // console.error("No authenticated user found.");
          return;
        }

        try {
          const userDocRef = doc(db, "user", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            set({ user: userDoc.data() });
          } else {
            console.error("User document not found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      },
    }),
    {
      name: 'auth-storage', // Key to store in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage)
      // getStorage: () => AsyncStorage, // Specify AsyncStorage as the storage engine
      // getStorage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export default useAuthStore;
