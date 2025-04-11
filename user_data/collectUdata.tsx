import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { firestore, auth } from "../config/firebase";
import { Task, Goal, Habit } from "../config/types";
import { onAuthStateChanged } from "firebase/auth";


export const fetchUserTasks = async (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Unsubscribe immediately after getting the user

      if (!user) {
        console.error("No user is signed in");
        resolve([]);
        return;
      }

      try {
        const userId = user.uid;
        const tasksCollectionRef = collection(firestore, `users/${userId}/tasks`);
        const tasksQuery = query(tasksCollectionRef, orderBy("startTime"));
        const querySnapshot = await getDocs(tasksQuery);
        
        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
          const taskData = doc.data() as Omit<Task, 'id'>;
          tasks.push({
            ...taskData,
            id: doc.id,
          });
        });
        
        resolve(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        reject(error);
      }
    });
  });
};

export const fetchUserHabits = async (): Promise<Habit[]> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Unsubscribe immediately after getting the user

      if (!user) {
        console.error("No user is signed in");
        resolve([]);
        return;
      }

      try {
        const userId = user.uid;
        const habitsCollectionRef = collection(firestore, `users/${userId}/habits`);
        const habitsQuery = query(habitsCollectionRef, orderBy("formed"));
        const querySnapshot = await getDocs(habitsQuery);
        
        const habits: Habit[] = [];
        querySnapshot.forEach((doc) => {
          const habitData = doc.data() as Omit<Habit, 'id'>;
          habits.push({
            ...habitData,
            id: doc.id,
          });
        });
        
        resolve(habits);
      } catch (error) {
        console.error("Error fetching habits:", error);
        reject(error);
      }
    });
  });
};


export const fetchUserGoals = async (): Promise<Goal[]> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Unsubscribe immediately after getting the user

      if (!user) {
        console.error("No user is signed in");
        resolve([]);
        return;
      }

      try {
        const userId = user.uid;
        const goalsCollectionRef = collection(firestore, `users/${userId}/goals`);
        const goalsQuery = query(goalsCollectionRef, orderBy("dueDate"));
        const querySnapshot = await getDocs(goalsQuery);
        
        const goals: Goal[] = [];
        querySnapshot.forEach((doc) => {
          const goalData = doc.data() as Omit<Goal, 'id'>;
          goals.push({
            ...goalData,
            id: doc.id,
          });
        });
        
        resolve(goals);
      } catch (error) {
        console.error("Error fetching goals:", error);
        reject(error);
      }
    });
  });
};