import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  balance: number;
  withdrawals: number;
  streak: number;
  language: string;
  currency: string;
  notifications: Record<string, boolean>;
  lastClaimedDate?: string;
  lastClaimedTimestamp?: number;
  hasSeenWelcomeBonus?: boolean;
  isBlocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  updateUser: (data: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(true);
        const userRef = doc(db, "users", firebaseUser.uid);
        
        let initialLoadDone = false;
        
        // Timeout to prevent infinite loading if Firestore is hanging
        const timeoutId = setTimeout(() => {
          if (!initialLoadDone) {
            console.warn("Firestore taking too long to respond. Using fallback.");
            initialLoadDone = true;
            setAppUser({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || "Alex Walker",
                email: firebaseUser.email || "",
                phone: firebaseUser.phoneNumber || "",
                avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                balance: 80,
                withdrawals: 0,
                streak: 0,
                language: "English (US)",
                currency: "INR (₹)",
                notifications: {},
                hasSeenWelcomeBonus: true
            });
            setLoading(false);
          }
        }, 1000); // 1 second timeout
        
        // Listen to real-time changes
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (!initialLoadDone) {
            initialLoadDone = true;
            clearTimeout(timeoutId);
          }
          if (docSnap.exists()) {
            setAppUser(docSnap.data() as AppUser);
            setLoading(false);
          } else {
            // Create user document if it doesn't exist
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Alex Walker",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "",
              avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              balance: 80,
              withdrawals: 0,
              streak: 0,
              language: "English (US)",
              currency: "INR (₹)",
              notifications: {
                "Push Notifications": true,
                "Email Updates": false,
                "SMS Alerts": true,
                "Task Reminders": false,
                "Marketing Emails": true
              },
              hasSeenWelcomeBonus: false
            };
            setDoc(userRef, newUser).then(() => {
              setAppUser(newUser);
              setLoading(false);
            }).catch(e => {
              console.error("Error creating user profile:", e);
              // Fallback to local state if write fails so the app doesn't break
              setAppUser(newUser); 
              setLoading(false);
            });
          }
        }, (error) => {
          if (!initialLoadDone) {
            initialLoadDone = true;
            clearTimeout(timeoutId);
          }
          console.error("Error listening to user doc:", error);
          // If permission denied, they might have strict rules. Just set a dummy user so they can access app.
          setAppUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Alex Walker",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "",
              avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              balance: 80,
              withdrawals: 0,
              streak: 0,
              language: "English (US)",
              currency: "INR (₹)",
              notifications: {},
              hasSeenWelcomeBonus: true // don't show the welcome bonus screen for fallback mode to avoid error loops
          });
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        // Not signed in
        setAppUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUser = async (data: Partial<AppUser>) => {
    if (user && appUser) {
      const updatedUser = { ...appUser, ...data };
      setAppUser(updatedUser); // Optimistic / Fallback update
      
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, data, { merge: true });
      } catch (e) {
        console.error("Failed to persist update to Firestore:", e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, updateUser }}>
      {!loading ? children : (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Initializing MINTLY PRO...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
