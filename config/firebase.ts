import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Import Firestore functions

const firebaseConfig = {
  apiKey: "AIzaSyAlosKtzy7eSbganxGzwyJHsl9ok3jVFHg",
  authDomain: "everything-cf74f.firebaseapp.com",
  projectId: "everything-cf74f",
  storageBucket: "everything-cf74f.firebasestorage.app",
  messagingSenderId: "244379818432",
  appId: "1:244379818432:web:89a144d001cb6a4d165025",
  measurementId: "G-SX9ZKW3G5F"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app); // Initialize Firestore

const writeSelectedCharacter = async (userId: string, characterId: string) => {
  const playerRef = doc(firestore, `users/${userId}/playerData/selectedCharacter`); // Adjust the path as necessary
  await setDoc(playerRef, { selectedCharacter: characterId });
};

const completeTask = async (userId: string, taskId: string) => {
  const taskRef = doc(firestore, `users/${userId}/tasks/${taskId}`);
  await updateDoc(taskRef, { completed: true});
};

// Fix the undoCompleteTask function
const undoCompleteTask = async (userId: string, taskId: string) => {
  const taskRef = doc(firestore, `users/${userId}/tasks/${taskId}`);
  await updateDoc(taskRef, { completed: false});
};

const readSelectedCharacter = async (userId: string) => {
  try {
    const playerRef = doc(firestore, `users/${userId}/playerData/selectedCharacter`); // Adjust the path as necessary
    const docSnap = await getDoc(playerRef);

    if (docSnap.exists()) {
      return docSnap.data().selectedCharacter; // Return the selected character
    } else {
      console.log("No such document!");
      return null; // Return null if no document exists
    }
  } catch (error) {
    console.error("Error reading selected character:", error);
    throw error; // Re-throw the error after logging it
  }
};


export { auth, firestore, writeSelectedCharacter, readSelectedCharacter, completeTask, undoCompleteTask }; 