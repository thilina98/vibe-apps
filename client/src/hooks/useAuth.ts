import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

// Store the ID token in sessionStorage to persist across page reloads
const getStoredToken = () => sessionStorage.getItem('firebaseIdToken');
const setStoredToken = (token: string) => sessionStorage.setItem('firebaseIdToken', token);
const clearStoredToken = () => sessionStorage.removeItem('firebaseIdToken');

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(getStoredToken());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get the ID token for API calls
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          setStoredToken(token);

          // Extract user info
          const nameParts = firebaseUser.displayName?.split(' ') || ['', ''];
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            profileImageUrl: firebaseUser.photoURL,
          };
          
          setUser(userData);
        } catch (error) {
          console.error("Error processing Firebase user:", error);
          setUser(null);
          setIdToken(null);
          clearStoredToken();
        }
      } else {
        setUser(null);
        setIdToken(null);
        clearStoredToken();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIdToken(null);
      clearStoredToken();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    idToken,
    signInWithGoogle,
    signOut,
  };
}
