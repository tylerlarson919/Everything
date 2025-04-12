// components/PlayerDataProvider.tsx
"use client";
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth'; // You'll need to install this
import { auth } from '../config/firebase';
import { usePlayerStore } from '../stores/playerStore';

export const PlayerDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const { userId, setUserId, initializeFromFirebase } = usePlayerStore();
  
  useEffect(() => {
    // When auth state changes and we have a user
    if (!loading) {
      if (user) {
        // If user is logged in and user ID doesn't match
        if (userId !== user.uid) {
          setUserId(user.uid);
          initializeFromFirebase(user.uid);
        }
      } else {
        // User logged out
        setUserId(null);
      }
    }
  }, [user, loading, userId, setUserId, initializeFromFirebase]);
  
  return <>{children}</>;
};