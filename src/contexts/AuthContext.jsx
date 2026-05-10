import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { getUserProfile } from '../utils/firestoreService';
import { loadLocalProfile } from '../utils/localProfileStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const remote = await getUserProfile(firebaseUser.uid);
        const offline = loadLocalProfile();
        if (remote) {
          setUserProfile(remote);
        } else if (offline && Object.keys(offline).length > 0) {
          setUserProfile(offline);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(loadLocalProfile());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userProfile, setUserProfile, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
