import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { levels } from "../config/levels";
import { usePlayerStore } from "../stores/playerStore";
import TimerAnimationModule from "./timer-animation-module";

export default function LevelSelectScreen({ onConfirm }: { onConfirm: () => void }) {
  const { selectedLevel, setSelectedLevel, level } = usePlayerStore();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  
  // Find the index of the currently selected level
  useEffect(() => {
    const index = levels.findIndex(level => level.id === selectedLevel);
    if (index !== -1 && currentLevelIndex !== index) {
      setCurrentLevelIndex(index);
    }
  }, [selectedLevel, currentLevelIndex]);
  
  // Navigate to previous level
  const prevLevel = () => {
    const newIndex = currentLevelIndex > 0 ? currentLevelIndex - 1 : levels.length - 1;
    setCurrentLevelIndex(newIndex);
    setSelectedLevel(levels[newIndex].id);
  };
  
  const nextLevel = () => {
    const newIndex = currentLevelIndex < levels.length - 1 ? currentLevelIndex + 1 : 0;
    setCurrentLevelIndex(newIndex);
    setSelectedLevel(levels[newIndex].id);
  };
  
  // Get current level
  const currentLevel = levels[currentLevelIndex];
  
  // Check if level is locked
  const isLevelLocked = currentLevel.lvlReq > level;
  
  return (
    <Card className="w-full">
      <CardBody className="w-full flex flex-col relative min-h-[530px] overflow-hidden z-[0] justify-start items-center gap-10">
        <div className="w-full h-full absolute bottom-0 left-0">
          <TimerAnimationModule isRunning={false} />
        </div>
        
        <div className="flex flex-col items-center justify-center w-full h-full z-20 p-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg py-4 flex flex-col items-center gap-4 min-w-[320px] max-w-[320px]">
            <h2 className="text-2xl font-bold text-white">Select Level</h2>
            
            <div className="flex items-center gap-4 justify-between w-full px-4">
            <button onClick={prevLevel}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                </svg>
              </button>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white">{currentLevel.name}</h3>
                {isLevelLocked ? (
                  <p className="text-red-400 text-sm">
                    Unlocks at level {currentLevel.lvlReq}
                  </p>
                ) : (
                  <p className="text-green-400 text-sm">Available</p>
                )}
              </div>
              
              <button  onClick={nextLevel}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-5">
                    <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                  </svg>
                </button>
            </div>
            
            <Button
              color="primary"
              onPress={onConfirm}
              isDisabled={isLevelLocked}
              className="mt-4"
            >
              {isLevelLocked ? "Locked" : "Confirm Selection"}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}