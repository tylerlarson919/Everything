"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, firestore } from "./firebase"; // Adjust the import path as necessary
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

interface FirestoreContextType {
  user: any;
  items: any[];
  loading: boolean;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export const FirestoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchItems(user.uid); // Fetch items when user is logged in
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchItems = async (userId: string) => {
    const itemsCollection = collection(firestore, `users/${userId}/playerData`); // Adjust the path as necessary
    const itemsSnapshot = await getDocs(itemsCollection);
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(itemsList);
  };

  return (
    <FirestoreContext.Provider value={{ user, items, loading }}>
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error("useFirestore must be used within a FirestoreProvider");
  }
  return context;
};