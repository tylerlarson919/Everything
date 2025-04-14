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
      <CardBody className="w-full flex flex-col relative min-h-[430px] overflow-hidden z-[0] justify-start items-center">
        <div className="w-full h-full absolute bottom-0 left-0">
          <TimerAnimationModule isRunning={false} />
        </div>
        
        <div className="flex flex-col items-center justify-center w-full h-full z-20 p-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Select Level</h2>
            
            <div className="flex items-center gap-4">
              <Button 
                size="sm" 
                variant="ghost" 
                onPress={prevLevel}
                className="text-white"
              >
                ←
              </Button>
              
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
              
              <Button 
                size="sm" 
                variant="ghost" 
                onPress={nextLevel}
                className="text-white"
              >
                →
              </Button>
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