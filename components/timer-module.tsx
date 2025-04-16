"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { Checkbox } from "@heroui/checkbox";
import TimerAnimationModule from "@/components/timer-animation-module";
import { usePlayerStore } from "../stores/playerStore";
import LevelSelectScreen from "./level-select-screen";
// Timer modes
enum TimerMode {
  POMODORO = "pomodoro",
  SHORT_BREAK = "shortBreak",
  LONG_BREAK = "longBreak",
}

// Default timer settings
const DEFAULT_SETTINGS = {
  [TimerMode.POMODORO]: 25 * 60, // 25 minutes in seconds
  [TimerMode.SHORT_BREAK]: 5 * 60, // 5 minutes
  [TimerMode.LONG_BREAK]: 15 * 60, // 15 minutes
  sessionsUntilLongBreak: 4, // After 4 pomodoros, take a long break
};

export default function TimerModule() {
  // Player store state
  const { 
    userId, 
    addCoins, 
    addXP, 
    incrementPlaytime, 
    tasks, 
    logPomodoroSession 
  } = usePlayerStore();

  // Timer state
  const [mode, setMode] = useState<TimerMode>(TimerMode.POMODORO);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_SETTINGS[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const [lockedSessionDuration, setLockedSessionDuration] = useState(0);
  const [lockedCoinReward, setLockedCoinReward] = useState(0);
  const [lockedXpReward, setLockedXpReward] = useState(0);
  const [lockedCoinBonus, setLockedCoinBonus] = useState(0);
  const [lockedXpBonus, setLockedXpBonus] = useState(0);
  const [linkedTasks, setLinkedTasks] = useState<string[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [tempLinkedTasks, setTempLinkedTasks] = useState<string[]>([]);
  // Reset timer when mode changes
  useEffect(() => {
    setTimeRemaining(settings[mode]);
    if (isRunning) {
      stopTimer();
    }
  }, [mode, settings]);

  const linkTaskClick = () => {
    // Initialize temporary state with current selections
    setTempLinkedTasks([...linkedTasks]);
    setIsLinkModalOpen(true);
  };
  

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Start the timer with animation sync
  const startTimer = () => {
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
    
    setIsRunning(true);
    
    // Use requestAnimationFrame for smoother animation sync
    const startTime = Date.now();
    const initialTime = timeRemaining;
    
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTime = Math.max(0, initialTime - elapsed);
      
      setTimeRemaining(newTime);
      
      if (newTime <= 0) {
        completeTimer();
        return;
      }
      
      timerRef.current = requestAnimationFrame(updateTimer);
    };
    
    timerRef.current = requestAnimationFrame(updateTimer);
  };

  // Stop the timer
  const stopTimer = () => {
    if (timerRef.current !== null) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  // Handle timer completion with animation and sound feedback
  const completeTimer = async () => {
    stopTimer();
    
    // Play completion sound
    const sound = new Audio(mode === TimerMode.POMODORO ? '/sounds/work-complete.mp3' : '/sounds/break-complete.mp3');
    sound.volume = 0.5;
    sound.play().catch(err => console.log('Audio playback error:', err));
    
    // If we completed a work session (pomodoro)
    if (mode === TimerMode.POMODORO) {
      // Calculate session duration and lock it
      const sessionDuration = calculateSessionDuration();
      setLockedSessionDuration(sessionDuration);
      setTotalSessionTime(prev => prev + sessionDuration);
      
      // Calculate rewards based on duration (minutes)
      const minutes = Math.floor(sessionDuration / 60);
      const coinReward = Math.max(1, minutes);
      const xpReward = Math.max(2, minutes * 2);
      
      // Set for display in modal
      setLockedCoinReward(coinReward);
      setLockedXpReward(xpReward);

      // Increment sessions completed
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      // Log the session
      await logCompletedSession(sessionDuration, coinReward, xpReward);
      
      // Show completion dialog with rewards
      setShowCompletionDialog(true);
      
      // Trigger browser notification if supported and page is not visible
      if (document.visibilityState !== 'visible' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Focus Session Complete!', {
            body: 'Great job! Time for a break.',
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
      
      // The mode change and reset will happen when the user closes the dialog
    } else {
      // If we completed a break, go back to pomodoro
      setMode(TimerMode.POMODORO);
      // Reset the timer for the new mode
      setTimeRemaining(settings[TimerMode.POMODORO]);
    }
  };

  const handleCompletionDialogClose = () => {
    setShowCompletionDialog(false);
    
    // Determine which break to take next based on sessions completed
    const nextMode = sessions % settings.sessionsUntilLongBreak === 0 
      ? TimerMode.LONG_BREAK 
      : TimerMode.SHORT_BREAK;
    
    // Update the mode
    setMode(nextMode);
    
    // Reset the timer for the new mode
    setTimeRemaining(settings[nextMode]);
    
    // Reset session data
    setLinkedTasks([]);
    sessionStartTimeRef.current = null;
    setSessionNotes("");
  };

  // Reset the current timer
  const resetTimer = () => {
    stopTimer();
    setTimeRemaining(settings[mode]);
    sessionStartTimeRef.current = null;
  };

  // Skip to the next timer mode
  const skipTimer = () => {
    if (mode === TimerMode.POMODORO) {
      // If there are already sessions completed, decide which break to take
      if (sessions % settings.sessionsUntilLongBreak === settings.sessionsUntilLongBreak - 1) {
        setMode(TimerMode.LONG_BREAK);
      } else {
        setMode(TimerMode.SHORT_BREAK);
      }
    } else {
      setMode(TimerMode.POMODORO);
    }
  };

  // Calculate session duration in seconds
  const calculateSessionDuration = () => {
    if (!sessionStartTimeRef.current) return 0;
    
    const now = new Date();
    const durationMs = now.getTime() - sessionStartTimeRef.current.getTime();
    return Math.floor(durationMs / 1000);
  };

  // Log completed pomodoro session to Firestore and award coins/XP
  const logCompletedSession = async (durationSeconds: number, coinReward: number, xpReward: number) => {
    if (!userId) return;
  
    try {
      // Create session object with corrected reward values
      const session = {
        title: sessionTitle,
        notes: sessionNotes,
        duration: durationSeconds,
        startTime: sessionStartTimeRef.current || new Date(),
        endTime: new Date(),
        coinReward: coinReward, // Use calculated rewards directly
        xpReward: xpReward,
        linkedTasks: linkedTasks
      };
      
      // Send to playerStore - don't apply the rewards here since the store will do that
      await logPomodoroSession(session);
      
      // Reset the session start time for the next session
      sessionStartTimeRef.current = null;
      
    } catch (error) {
      console.error("Error logging completed session:", error);
    }
  };

  // Update timer settings
  const updateSettings = (mode: TimerMode, minutes: number) => {
    setSettings(prev => ({
      ...prev,
      [mode]: minutes * 60, // Convert minutes to seconds
    }));
  };

  // Timer mode labels
  const modeLabels = {
    [TimerMode.POMODORO]: "Focus",
    [TimerMode.SHORT_BREAK]: "Short Break",
    [TimerMode.LONG_BREAK]: "Long Break",
  };

  return (
    <Card className="w-full">
      {showLevelSelect ? (
        <LevelSelectScreen onConfirm={() => setShowLevelSelect(false)} />
      ) : (
      <CardBody className="w-full flex flex-col relative min-h-[530px] overflow-hidden z-[0] justify-start items-center gap-10">
          <div className="w-full h-full absolute bottom-0 left-0">
            <TimerAnimationModule 
              isRunning={isRunning} 
              progress={(settings[mode] - timeRemaining) / settings[mode]}
              mode={mode}
            />
          </div>
          <div className="flex flex-col justify-center items-center w-full h-full z-[20]">
            <button onClick={() => setIsSettingsOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-6 absolute top-2 left-3 w-7 h-7 text-black dark:text-white">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
              </svg>
            </button>
            {isRunning ? (
            <button onClick={completeTimer}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dd2828" className="text-6 absolute top-2 right-3 w-7 h-7 text-red transition-all">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
              </svg>
            </button>
            ) : (
              <></>
            ) 
          }
          </div>
          <div className="flex flex-col gap-1 items-center justify-center w-[214px] z-[20] p-4 bg-black/20 rounded-lg backdrop-blur-sm">
            {/* Timer Display */}
            <div className="text-5xl font-bold font-mono">
              {formatTime(timeRemaining)}
            </div>
            
            {/* Session Counter (only in Pomodoro mode) */}
            {mode === TimerMode.POMODORO && (
              <div className={`text-gray-600 dark:text-gray-400 ${isRunning ? "relative" : "hidden"} transition-all duration-1000`}>
                Session {sessions + 1} • Total: {Math.floor(totalSessionTime / 60)} minutes
              </div>
            )}
            {/* Timer Mode Tabs */}
            <Tabs 
              className={`${isRunning ? "hidden" : "absolute"} transition-all duration-1000`}
              selectedKey={mode}
              size="sm"
              onSelectionChange={(key: any) => setMode(key as TimerMode)}
              classNames={{
                base: "absolute -top-[43px] ",
                tabList: "bg-black/20 rounded-lg backdrop-blur-sm ",
                tab: "bg-none backdrop-blur-none",
                cursor: "dark:bg-black/40 bg-black/40",
              }}
            >
              <Tab key={TimerMode.POMODORO} title="Focus" />
              <Tab key={TimerMode.SHORT_BREAK} title="Short Break" />
              <Tab key={TimerMode.LONG_BREAK} title="Long Break" />
            </Tabs>
            
            {/* Session Title Input (only in Pomodoro mode) */}
            {mode === TimerMode.POMODORO && (
              <Input
                label="Session Title"
                labelPlacement="outside"
                size="sm"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className={`max-w-xs ${isRunning ? "hidden" : "relative"} transition-all duration-1000`}
                placeholder="What are you working on?"
                classNames={{
                  input: "text-[12px] data-[has-end-content=true]:pr-0",
                  label: "absolute hidden top-0 left-0 ",
                  base: "data-[has-label=true]:mt-0 ",
                  inputWrapper: "dark:bg-black/40 bg-black/40 group-data-[focus=true]:bg-black/60",
                  innerWrapper: "pr-0",

                }}
                endContent={
                  <div className="relative">
                  <button onClick={linkTaskClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute right-0 top-0 bottom-0 my-auto size-4 text-foreground-500 hover:text-white transition-all">
                      <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                }
              />
            )}
            {/* Timer Controls */}
            <div className="flex gap-3 pt-2 max-w-[84px]">
              <button
                onClick={() => {
                  // Navigate to previous tab
                  if (mode === TimerMode.POMODORO) {
                    setMode(TimerMode.LONG_BREAK);
                  } else if (mode === TimerMode.SHORT_BREAK) {
                    setMode(TimerMode.POMODORO);
                  } else if (mode === TimerMode.LONG_BREAK) {
                    setMode(TimerMode.SHORT_BREAK);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                </svg>
              </button>
              {isRunning ? (
                  <button className="" onClick={stopTimer}>  
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                    </svg>
                  </button>
              ) : (
                <button className="" onClick={startTimer}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button 
                onClick={() => {
                  // Navigate to previous tab
                  if (mode === TimerMode.POMODORO) {
                    setMode(TimerMode.SHORT_BREAK);
                  } else if (mode === TimerMode.SHORT_BREAK) {
                    setMode(TimerMode.LONG_BREAK);
                  } else if (mode === TimerMode.LONG_BREAK) {
                    setMode(TimerMode.POMODORO);
                  }
                }}
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                </svg>
              </button>
            </div>
          </div>
          {/* Link tasks modal */}
          {isLinkModalOpen && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 absolute top-[53px] left-1/2 translate-x-[115px] w-64 z-[30]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Link Tasks ({tempLinkedTasks.length}/3)</h3>
                  <button onClick={() => setIsLinkModalOpen(false)} className="text-white/70 hover:text-white text-xs">
                    ✕
                  </button>
                </div>
                
                <div className="hiddenauto">
                  {tasks.length === 0 ? (
                    <div className="p-2 text-center text-white/60 text-xs">No tasks available</div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} 
                        className="flex items-center py-1.5 px-2 rounded hover:bg-white/10 transition-colors text-sm"
                      >
                        <Checkbox
                          size="sm"
                          isSelected={tempLinkedTasks.includes(task.id)}
                          isDisabled={tempLinkedTasks.length >= 3 && !tempLinkedTasks.includes(task.id)}
                          classNames={{
                            base: "data-[selected=true]:bg-white/30",
                          }}
                          onValueChange={(isChecked) => {
                            if (isChecked) {
                              if (tempLinkedTasks.length < 3) {
                                setTempLinkedTasks([...tempLinkedTasks, task.id]);
                              }
                            } else {
                              setTempLinkedTasks(tempLinkedTasks.filter(id => id !== task.id));
                            }
                          }}
                        />
                        <label className="flex-1 cursor-pointer ml-2 truncate text-white/90 text-xs">
                          <span className="mr-1">{task.emoji || '📝'}</span>
                          {task.title}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-end gap-2">
                  <button 
                    onClick={() => setIsLinkModalOpen(false)}
                    className="text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setLinkedTasks(tempLinkedTasks);
                      setIsLinkModalOpen(false);
                    }}
                    className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                  >
                    Save
                  </button>
                </div>
            </div>
          )}
        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="absolute inset-0 w-auto h-auto bg-black/50  backdrop-blur-md flex items-center justify-center z-[100] transition-opacity duration-200">
            <div className="p-6 w-full h-full z-[1001]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold pb-2">Timer Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500">✕</button>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Focus Duration (minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={String(settings[TimerMode.POMODORO] / 60)}
                  onChange={(e) => updateSettings(TimerMode.POMODORO, parseInt(e.target.value) || 25)}
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium">Short Break Duration (minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={String(settings[TimerMode.SHORT_BREAK] / 60)}
                  onChange={(e) => updateSettings(TimerMode.SHORT_BREAK, parseInt(e.target.value) || 5)}
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium">Long Break Duration (minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={String(settings[TimerMode.LONG_BREAK] / 60)}
                  onChange={(e) => updateSettings(TimerMode.LONG_BREAK, parseInt(e.target.value) || 15)}
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium">Sessions Until Long Break</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={String(settings.sessionsUntilLongBreak)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 4;
                    setSettings(prev => ({...prev, sessionsUntilLongBreak: value}));
                  }}
                />
              </div>
              <div className="absolute bottom-6 left-0 flex justify-between w-full px-6">
                <Button color="secondary" onPress={() => {
                  setIsSettingsOpen(false);
                  setShowLevelSelect(true);
                  if (isRunning) {
                    stopTimer();
                  }
                }}>
                  Return to Level Select
                </Button>
                <Button onPress={() => setIsSettingsOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
        
        {/* Session Completion Modal */}
        {showCompletionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-dark2 rounded-lg p-6 w-full max-w-md z-[1010]">
              <div className="flex justify-center items-center relative pb-4">
                <h3 className="text-2xl font-bold">Session Completed!</h3>
                <button onClick={handleCompletionDialogClose} className="text-gray-500 hover:text-gray-400 absolute -top-2 right-0 text-lg transition-all">✕</button>
              </div>              
              <div className="flex flex-col items-center gap-4">
                <p className="text-xl">{Math.floor(lockedSessionDuration / 60)} min</p>
                <div className="flex justify-center gap-6 w-full rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 relative">Coins
                    <Tooltip content={`+${lockedCoinBonus} 🪙 Task Link Bonus!`} placement="left" className="text-[10px]" >
                      <div className="font-bold text-sm text-amber-500 absolute bottom-0 right-full">
                        {lockedCoinBonus}
                      </div>
                    </Tooltip>
                    </div>
                    <p className="font-bold text-xl text-amber-500">+{lockedCoinReward} 🪙</p>

                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500 relative">XP
                    <Tooltip content={`+${lockedXpBonus} ✨ Task Link Bonus!`} placement="left" className="text-[10px]" >
                      <div className="font-bold text-sm text-blue-500 absolute bottom-0 right-full">
                        {lockedXpReward}
                      </div>
                    </Tooltip>
                    </div>
                    <p className="font-bold text-xl text-blue-500">+{lockedXpReward} ✨</p>
                  </div>
                </div>

                {linkedTasks.length > 0 && (
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Linked Tasks:</p>
                    <div className="rounded-md p-1">
                      {tasks
                        .filter(task => linkedTasks.includes(task.id))
                        .map(task => (
                          <div key={task.id} className="flex items-center py-1">
                            <span>{task.emoji || '📝'}</span>
                            <span className="ml-2">{task.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <textarea
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={1}
                  placeholder="Add notes about this session (optional)"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onPress={handleCompletionDialogClose}>Continue</Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
      )}
    </Card>
  );
}
