import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const initAnonymousAuth = (
  onAuthSuccess?: (user: User) => void,
  onAuthFailure?: (error: unknown) => void
) => {
  // Listen for auth state
  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    } else {
      // If not logged in, login anonymously exactly once
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Anonymous auth failed:', error);
        if (onAuthFailure) onAuthFailure(error);
      }
    }
  });
  
  return unsubscribe;
};

