// stores/playerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    onSnapshot,
    serverTimestamp,
    collection,
    addDoc,
    getDocs,
    DocumentData,
    QuerySnapshot
  } from 'firebase/firestore';
import { firestore } from '../config/firebase'; // Import your Firebase instance

// Add to the PlayerState interface
interface PomodoroSession {
    id?: string;
    title: string;
    notes?: string;
    duration: number;
    startTime: Date;
    endTime: Date;
    coinReward: number;
    xpReward: number;
    linkedTasks?: string[];
  }
  // First, define a type for Firestore doc data:
type FirestoreTaskData = {
    id?: string;
    title?: string;
    name?: string;
    emoji?: string;
    xp?: number;
    coins?: number;
    description?: string;
    startTime?: string;
    completed?: boolean;
    [key: string]: any;
  }; 

  const calculateLevelInfo = (totalXp: number) => {
    // Determine level based on XP
    const level = Math.floor(totalXp / 100);
    
    // Calculate previous and next level thresholds
    const prevLevelThreshold = level * 100;
    const nextLevelThreshold = (level + 1) * 100;
    
    // Calculate progress percentage toward next level
    const xpForCurrentLevel = totalXp - prevLevelThreshold;
    const xpNeededForNextLevel = nextLevelThreshold - prevLevelThreshold;
    const xpPercent = (xpForCurrentLevel / xpNeededForNextLevel) * 100;
        
    return { level, xpPercent };
  };
// Define TypeScript interface for player state
interface PlayerState {
  // User info
  userId: string | null;
  isInitialized: boolean;
  
  // Player data
  coins: number;
  xp: number;
  xpPercent: number;
  level: number;
  selectedCharacter: string;
  selectedLevel: string;
  health: number;
  playtime: number;
  tasks: Array<{ 
    id: string; 
    title: string;
    name: string;  
    emoji?: string;
    xp?: number;   
    coins?: number;
    description?: string; 
    startTime?: string;   
    completed: boolean; 
  }>;
  pomodoroSessions: PomodoroSession[];
  logPomodoroSession: (session: PomodoroSession) => Promise<void>;
  
  
  // Firebase sync
  setUserId: (userId: string | null) => void;
  initializeFromFirebase: (userId: string) => Promise<void>;
  syncToFirebase: () => Promise<void>;
  unsubscribeListener?: (() => void) | null;
  cleanupFirebaseListeners: () => void;
  
  // Actions
  addCoins: (amount: number) => void;
  subtractCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  setSelectedCharacter: (character: string) => void;
  setSelectedLevel: (level: string) => void;
  setHealth: (health: number) => void;
  incrementPlaytime: (seconds: number) => void;
  addTask: (task: { 
    id: string; 
    title: string;
    name?: string;  
    emoji?: string;
    xp?: number;   
    coins?: number;
    description?: string; 
    startTime?: string;
  }) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
 
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // User info
      userId: null,
      isInitialized: false,
      
      // Initial state
      coins: 0,
      xp: 0,
      xpPercent: 0,
      level: 1,
      selectedCharacter: 'default',
      selectedLevel: 'default',
      health: 100,
      playtime: 0,
      tasks: [],
      pomodoroSessions: [],
      logPomodoroSession: async (session) => {
        const state = get();
        if (!state.userId) return;
        
        try {
          // Create a session object without the reward properties
          const sessionToStore = {
            title: session.title,
            notes: session.notes || "",
            duration: session.duration,
            startTime: session.startTime,
            endTime: session.endTime,
            linkedTasks: session.linkedTasks || []
          };
          
          // Add to Firestore WITHOUT reward values
          const sessionsRef = collection(firestore, `users/${state.userId}/pomodoro-sessions`);
          const docRef = await addDoc(sessionsRef, {
            ...sessionToStore,
            createdAt: serverTimestamp(),
          });
          
          // Update local state with proper type casting
          set(state => ({
            pomodoroSessions: [...state.pomodoroSessions, {
              ...sessionToStore,
              id: docRef.id,
              coinReward: session.coinReward,
              xpReward: session.xpReward
            }]
          }));

          console.log('Pomodoro Session Playtime:', {
            durationSeconds: session.duration,
            durationMinutes: session.duration / 60
          });
          
          // Award coins and XP - these will be saved to player stats
          get().addCoins(session.coinReward);
          get().addXP(session.xpReward);
          get().incrementPlaytime(session.duration);
          
        } catch (error) {
          console.error("Error logging pomodoro session:", error);
        }
      },
      
      // Firebase sync functions
      setUserId: (userId) => set({ userId }),
      
      initializeFromFirebase: async (userId) => {
        try {
          // Define tasksCollection at the function scope level, not inside the if block
          const tasksCollection = collection(firestore, `users/${userId}/tasks`);
          
          // Get player data document
          const playerRef = doc(firestore, `users/${userId}/playerData/stats`);
          const playerDoc = await getDoc(playerRef);
          
          if (playerDoc.exists()) {
            const data = playerDoc.data();
            const currentXP = data.xp || 0;
            
            // Add console log right before calculating level info
            console.log('Initialize Player XP:', {
              currentXP,
              source: 'initializeFromFirebase'
            });
            console.log('Initial Playtime:', data.playtime || 0);

            const { level, xpPercent } = calculateLevelInfo(data.xp || 0);

            // Set player state from Firebase data
            set({
              userId,
              isInitialized: true,
              coins: data.coins || 0,
              xp: data.xp || 0,
              level,
              xpPercent,
              selectedCharacter: data.selectedCharacter || 'default',
              selectedLevel: data.selectedLevel || 'default',
              health: data.health || 100,
              playtime: data.playtime || 0,
            });
            // Get tasks from the correct collection path
            const tasksSnapshot = await getDocs(tasksCollection);
            const tasksData = tasksSnapshot.docs.map(doc => {
                const data = doc.data() as FirestoreTaskData;
                return {
                    id: doc.id,
                    title: data.title || data.name || 'Untitled Task',
                    name: data.name || data.title || 'Untitled Task',
                    emoji: data.emoji || "📝",
                    xp: data.xp || 0,
                    coins: data.coins || 0,
                    description: data.description || "",
                    startTime: data.startTime || new Date().toISOString(),
                    completed: data.completed || false
                };
            });
            set({ tasks: tasksData });
          } else {
            // Initialize new player in Firebase
            await setDoc(playerRef, {
              coins: 0,
              xp: 0,
              level: 1,
              selectedCharacter: 'default',
              selectedLevel: 'default',
              health: 100,
              playtime: 0,
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp(),
            });
            
            // Initialize empty tasks array
            await setDoc(doc(firestore, `users/${userId}/playerData/tasks`), {
              tasks: []
            });
            
            set({ userId, isInitialized: true });
          }

          // Set up realtime listener for changes
            const unsubscribeStats = onSnapshot(playerRef, (docSnapshot) => {
                if (docSnapshot.exists() && docSnapshot.metadata.hasPendingWrites === false) {
                    const data = docSnapshot.data();
                    const currentXP = data.xp || 0;
    
                    // Add console log right before calculating level info
                    console.log('Snapshot Update XP:', {
                      currentXP,
                      source: 'onSnapshot'
                    });
                    console.log('Updated Playtime:', data.playtime || 0);

                    const { level, xpPercent } = calculateLevelInfo(data.xp || 0);
                    set(state => ({
                        ...state,
                        coins: data.coins || state.coins,
                        xp: data.xp || state.xp,
                        level,
                        xpPercent,
                        selectedCharacter: data.selectedCharacter || state.selectedCharacter,
                        selectedLevel: data.selectedLevel || state.selectedLevel,
                        health: data.health || state.health,
                        playtime: data.playtime || state.playtime,
                    }));
                }
            });

            // Add a separate listener for the tasks collection
            const unsubscribeTasks = onSnapshot(tasksCollection, (snapshot) => {
                const newTasks = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || data.name || 'Untitled Task',
                        name: data.name || data.title || 'Untitled Task',
                        emoji: data.emoji || "📝",
                        xp: data.xp || 0,
                        coins: data.coins || 0,
                        description: data.description || "",
                        startTime: data.startTime || new Date().toISOString(),
                        completed: data.completed || false
                    };
                });
                set(state => ({ ...state, tasks: newTasks }));
            });

            // Store both unsubscribe functions in one cleanup function
            set(state => ({ 
                ...state, 
                unsubscribeListener: () => {
                    unsubscribeStats();
                    unsubscribeTasks();
                }
            }));

          // You might want to save the unsubscribe function somewhere to clean up later
        } catch (error) {
          console.error("Error initializing player data from Firebase:", error);
          set({ isInitialized: true }); // Mark as initialized even on error
        }
      },

    

      cleanupFirebaseListeners: () => {
        const { unsubscribeListener } = get();
        if (unsubscribeListener) {
          unsubscribeListener();
          set({ unsubscribeListener: null });
        }
      },
      
      syncToFirebase: async () => {
        const state = get();
        if (!state.userId) return; // Don't sync if not logged in
        
        try {
          // Update player stats
          const playerRef = doc(firestore, `users/${state.userId}/playerData/stats`);
          await updateDoc(playerRef, {
            coins: state.coins,
            xp: state.xp,
            level: state.level,
            xpPercent: state.xpPercent,
            selectedCharacter: state.selectedCharacter,
            selectedLevel: state.selectedLevel,
            health: state.health,
            playtime: state.playtime,
            lastUpdated: serverTimestamp(),
          });
          
        } catch (error) {
          console.error("Error syncing to Firebase:", error);
        }
      },
      
      // Actions - modified to sync with Firebase
      addCoins: (amount) => {
        set((state) => {
          const newState = { coins: state.coins + amount };
          return newState;
        });
        get().syncToFirebase();
      },
      
      subtractCoins: (amount) => {
        set((state) => {
          const newState = { coins: Math.max(0, state.coins - amount) };
          return newState;
        });
        get().syncToFirebase();
      },
      
      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          // Add console log right before calculating level info
          console.log('Adding XP:', {
            previousXP: state.xp,
            amountAdded: amount,
            newTotalXP: newXP,
            source: 'addXP'
          });
          const { level, xpPercent } = calculateLevelInfo(newXP);
          
          return { 
            xp: newXP,
            level,
            xpPercent
          };
        });
        get().syncToFirebase();
      },
      
      setSelectedCharacter: (character) => {
        set({ selectedCharacter: character });
        get().syncToFirebase();
      },
      setSelectedLevel: (level) => {
        set({ selectedLevel: level });
        get().syncToFirebase();
      },
      
      setHealth: (health) => {
        set({ health });
        get().syncToFirebase();
      },
      
      incrementPlaytime: (seconds) => {
        // Convert seconds to minutes and add to existing playtime
        const minutesToAdd = seconds / 60;
        console.log('Playtime:', {
          seconds,
          minutesToAdd,
          currentPlaytime: get().playtime,
          newTotalPlaytime: get().playtime + minutesToAdd
        });
        set((state) => ({ playtime: state.playtime + minutesToAdd }));
        
        // Sync to Firebase after updating playtime
        get().syncToFirebase();
      },
      
      addTask: (task) => {
        const state = get();
        if (!state.userId) return;
        
        // Create the task in Firestore directly
        const tasksCollection = collection(firestore, `users/${state.userId}/tasks`);
        addDoc(tasksCollection, { 
          ...task, 
          name: task.name || task.title, 
          emoji: task.emoji || "📝",
          xp: task.xp || 0,
          coins: task.coins || 0,
          description: task.description || "",
          startTime: task.startTime || new Date().toISOString(),
          completed: false,
          createdAt: serverTimestamp()
        });
        // State will be updated by the onSnapshot listener
      },
      
      completeTask: (taskId) => {
        const state = get();
        if (!state.userId) return;
        
        // Update the task in Firestore directly
        const taskRef = doc(firestore, `users/${state.userId}/tasks/${taskId}`);
        updateDoc(taskRef, { completed: true });
        // State will be updated by the onSnapshot listener
      },
      
      uncompleteTask: (taskId) => {
        const state = get();
        if (!state.userId) return;
        
        // Update the task in Firestore directly
        const taskRef = doc(firestore, `users/${state.userId}/tasks/${taskId}`);
        updateDoc(taskRef, { completed: false });
        // State will be updated by the onSnapshot listener
      },
    }),
    {
      name: 'player-storage', // name for localStorage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        coins: state.coins,
        xp: state.xp,
        level: state.level,
        xpPercent: state.xpPercent,
        selectedCharacter: state.selectedCharacter,
        selectedLevel: state.selectedLevel,
        health: state.health,
        playtime: state.playtime,
        pomodoroSessions: state.pomodoroSessions,
        // Don't persist userId or tasks to localStorage since we'll get those from Firebase
      }),
    }
  )
);
