"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import TimerAnimationModule from "@/components/timer-animation-module";
import { usePlayerStore } from "../stores/playerStore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../config/firebase";
import SettingsIcon from "./icons/settings";
import { relative } from "path";

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
  const { userId, addCoins, addXP, incrementPlaytime } = usePlayerStore();

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
  
  const timerRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  // Reset timer when mode changes
  useEffect(() => {
    setTimeRemaining(settings[mode]);
    if (isRunning) {
      stopTimer();
    }
  }, [mode, settings]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Start the timer
  const startTimer = () => {
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
    
    setIsRunning(true);
    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          completeTimer();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Stop the timer
  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  // Handle timer completion
  const completeTimer = () => {
    stopTimer();
    
    // If we completed a work session (pomodoro)
    if (mode === TimerMode.POMODORO) {
      // Calculate session duration
      const sessionDuration = calculateSessionDuration();
      setTotalSessionTime(prev => prev + sessionDuration);
      
      // Increment sessions completed
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      // Show completion dialog with rewards
      setShowCompletionDialog(true);
      
      // Determine which break to take next
      if (newSessions % settings.sessionsUntilLongBreak === 0) {
        setMode(TimerMode.LONG_BREAK);
      } else {
        setMode(TimerMode.SHORT_BREAK);
      }
      
      // Log session to Firestore and award rewards
      logCompletedSession(sessionDuration);
    } else {
      // If we completed a break, go back to pomodoro
      setMode(TimerMode.POMODORO);
    }
    
    // Reset the timer for the new mode
    setTimeRemaining(settings[mode]);
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
  const logCompletedSession = async (durationSeconds: number) => {
    if (!userId) return;
    
    try {
      // Calculate rewards based on duration
      // 1 coin per minute, 2 XP per minute
      const minutes = Math.floor(durationSeconds / 60);
      const coinReward = Math.max(1, minutes);
      const xpReward = Math.max(2, minutes * 2);
      
      // Add the session to Firestore
      const sessionsRef = collection(firestore, `users/${userId}/pomodoro-sessions`);
      await addDoc(sessionsRef, {
        title: sessionTitle,
        notes: sessionNotes,
        duration: durationSeconds,
        startTime: sessionStartTimeRef.current,
        endTime: new Date(),
        coinReward,
        xpReward,
        createdAt: serverTimestamp(),
      });
      
      // Award coins and XP
      addCoins(coinReward);
      addXP(xpReward);
      
      // Increment total playtime
      incrementPlaytime(durationSeconds);
      
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
      <CardBody className="w-full flex flex-col relative min-h-[430px] overflow-hidden z-[0] justify-start items-center gap-10">
          <div className="w-full h-full absolute bottom-0 left-0">
            <TimerAnimationModule isRunning={isRunning} />
          </div>
          <div className="flex flex-col justify-center items-center w-full z-[20]">
            <button onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon className="absolute top-2 right-3 w-7 h-7 text-black dark:text-white"/>
            </button>
            <button onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon className="absolute top-2 left-3 w-7 h-7 text-black dark:text-white"/>
            </button>
            
          </div>
          <div className="flex flex-col gap-1 items-center justify-center w-fit z-[20] p-4 bg-black/20 rounded-lg backdrop-blur-sm">
          {/* Timer Display */}
            <div className="text-5xl font-bold font-mono">
              {formatTime(timeRemaining)}
            </div>
            
            {/* Session Counter (only in Pomodoro mode) */}
            {mode === TimerMode.POMODORO && (
              <div className={`text-gray-600 dark:text-gray-400 ${isRunning ? "hidden" : "relative"} transition-all duration-1000`}>
                Session {sessions + 1} • Total Focus Time: {Math.floor(totalSessionTime / 60)} minutes
              </div>
            )}
            {/* Timer Mode Tabs */}
            <Tabs 
              className={`${isRunning ? "hidden" : "absolute"} transition-all duration-1000`}
              selectedKey={mode}
              size="sm"
              onSelectionChange={(key: any) => setMode(key as TimerMode)}
              classNames={{
                base: "absolute -top-[43px]"
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
                  input: "text-[12px]",
                  label: "absolute hidden top-0 left-0",
                  base: "data-[has-label=true]:mt-0"
                }}
              />
            )}
            {/* Timer Controls */}
            <div className="flex gap-3">
              {isRunning ? (
                <div className="flex gap-3">
                  <Button size="sm" color="warning" onPress={stopTimer}>Pause</Button>
                  <Button size="sm" color="danger" onPress={resetTimer}>Reset</Button>
                </div>
              ) : (
                <Button size="sm" color="success" onPress={startTimer}>Start</Button>
              )}
            </div>
          </div>
        
        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-[1010]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Timer Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500">✕</button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Focus Duration (minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={String(settings[TimerMode.POMODORO] / 60)}
                  onChange={(e) => updateSettings(TimerMode.POMODORO, parseInt(e.target.value) || 25)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Short Break Duration (minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={String(settings[TimerMode.SHORT_BREAK] / 60)}
                  onChange={(e) => updateSettings(TimerMode.SHORT_BREAK, parseInt(e.target.value) || 5)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Long Break Duration (minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={String(settings[TimerMode.LONG_BREAK] / 60)}
                  onChange={(e) => updateSettings(TimerMode.LONG_BREAK, parseInt(e.target.value) || 15)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sessions Until Long Break</label>
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
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onPress={() => setIsSettingsOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
        
        {/* Session Completion Modal */}
        {showCompletionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-[1010]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Focus Session Completed!</h3>
                <button onClick={() => setShowCompletionDialog(false)} className="text-gray-500">✕</button>
              </div>              
              <div className="flex flex-col items-center gap-4">
                <p>Great job completing your focus session!</p>
                <div className="flex justify-between w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-bold text-xl">{Math.floor(calculateSessionDuration() / 60)} min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Coins Earned</p>
                    <p className="font-bold text-xl text-amber-500">+{Math.floor(calculateSessionDuration() / 60)} 🪙</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">XP Gained</p>
                    <p className="font-bold text-xl text-blue-500">+{Math.floor((calculateSessionDuration() / 60) * 2)} ✨</p>
                  </div>
                </div>
                
                <textarea
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add notes about this session (optional)"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onPress={() => setShowCompletionDialog(false)}>Continue</Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
