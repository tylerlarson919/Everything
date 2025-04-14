import React, { useRef, useEffect, useState, useCallback } from "react";
import { gameCharacters } from "../config/characters";
import { levels } from "../config/levels";
import { Character as CharacterType, Level } from '../config/types';
import { usePlayerStore } from '../stores/playerStore';
import EnemyBattleSystem from './enemy-battle-system';

// Add this function as a named export at the top of the file
export function determineTextColor(): "light" | "dark" {
  const { selectedLevel } = usePlayerStore();
  const level = levels.find(l => l.id === selectedLevel) || levels.find(l => l.id === '1') || levels[0];
  return level.textColor || "light"; // Default to light if textColor is undefined
}

interface TimerAnimationModuleProps {
  isRunning: boolean;
  progress?: number; // Add progress prop
  mode?: any; // Add mode prop
}
// Replace the entire component with this updated version
export default function TimerAnimationModule({ isRunning }: TimerAnimationModuleProps) {
  const { selectedCharacter, selectedLevel } = usePlayerStore();
  const [inBattle, setInBattle] = useState(false);
  const [characterAnimation, setCharacterAnimation] = useState('idle');
  // Get the character data and level data
  const character = gameCharacters.find(c => c.id === selectedCharacter) || gameCharacters[0];
  const level = levels.find(l => l.id === selectedLevel) || levels.find(l => l.id === '1') || levels[0];
  // References for animation frames
  const characterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  // References for layer positions
  const layerRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  // Positions for parallax layers
  const positionsRef = useRef<{[key: string]: number}>({});
  const animationSpeedRef = useRef<number>(100); // milliseconds per frame
  // Initialize positions for all layers
  useEffect(() => {
    // Reset positions when level changes
    const newPositions: {[key: string]: number} = {};
    Object.keys(level.layerPaths).forEach(layer => {
      newPositions[layer] = 0;
    });
    positionsRef.current = newPositions;
  }, [level]);

 // Update character animation based on running state
  useEffect(() => {
    if (!inBattle) {
      setCharacterAnimation(isRunning ? 'run' : 'idle');
    }
  }, [isRunning, inBattle]);

  // Add handler for battle system animation changes
  const handlePlayerAnimationChange = useCallback((animation: string) => {
    setCharacterAnimation(animation);
  }, []);

  // Update character animation effect to use the new animation state
  useEffect(() => {
    const animation = character.animations[characterAnimation];
    if (!animation || !characterRef.current) return;

    const { frames, frameWidth, frameHeight, row } = animation;
    
    // Adjust animation speed based on type
    if (characterAnimation === 'attack_1' || characterAnimation === 'attack_2' || characterAnimation === 'special') {
      animationSpeedRef.current = 80; // Faster for attacks
    } else if (characterAnimation === 'hurt') {
      animationSpeedRef.current = 150; // Slower for hurt
    } else {
      animationSpeedRef.current = 100; // Default speed
    }
    
    // Reset frame count when animation changes
    frameCountRef.current = 0;
    
    const interval = setInterval(() => {
      if (!characterRef.current) return;
      
      // Update character sprite position
      const position = -(frameCountRef.current % frames) * frameWidth;
      const rowPosition = -row * frameHeight;
      characterRef.current.style.backgroundPosition = `${position}px ${rowPosition}px`;
      
      // Increment frame count
      frameCountRef.current = (frameCountRef.current + 1) % frames;
    }, animationSpeedRef.current);
    
    return () => clearInterval(interval);
  }, [character, characterAnimation]);

  // Parallax animation for background
  useEffect(() => {
    if (!isRunning || inBattle) return;
    
    const animateBackground = () => {
      const layers = Object.keys(level.layerPaths);
      
      layers.forEach((layerKey) => {
        const layerRef = layerRefs.current[layerKey];
        if (!layerRef) return;
        
        const layerNumber = parseInt(layerKey.replace("layer", ""));
        const isFloor = level.layerPaths[layerKey as keyof typeof level.layerPaths] === "floor.png";
        
        // Improved speed calculation for smoother parallax
        const speed = isFloor ? 3 : 0.5 + (layerNumber * 0.5);
        
        // Update position
        positionsRef.current[layerKey] = (positionsRef.current[layerKey] - speed) % window.innerWidth;
        
        // Apply position
        layerRef.style.backgroundPositionX = `${positionsRef.current[layerKey]}px`;
      });
      
      animationFrameRef.current = requestAnimationFrame(animateBackground);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateBackground);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, level, inBattle]);

  // Get all layer keys from the level
  const layerKeys = Object.keys(level.layerPaths);
  
  // Sort layers to ensure floor.png is in the correct z-index position
  const sortedLayers = [...layerKeys].sort((a, b) => {
    const aPath = level.layerPaths[a as keyof typeof level.layerPaths];
    const bPath = level.layerPaths[b as keyof typeof level.layerPaths];
    
    // If one is floor.png, determine its position based on layer key number
    if (aPath === "floor.png" && bPath !== "floor.png") {
      const aNum = parseInt(a.replace("layer", ""));
      const bNum = parseInt(b.replace("layer", ""));
      return aNum - bNum;
    }
    if (bPath === "floor.png" && aPath !== "floor.png") {
      const aNum = parseInt(a.replace("layer", ""));
      const bNum = parseInt(b.replace("layer", ""));
      return aNum - bNum;
    }
    
    // Otherwise sort by layer number
    const aNum = parseInt(a.replace("layer", ""));
    const bNum = parseInt(b.replace("layer", ""));
    return aNum - bNum;
  });

  const floorLayerIndex = sortedLayers.findIndex(layerKey => 
    level.layerPaths[layerKey as keyof typeof level.layerPaths] === "floor.png"
  );
  
  // Calculate character z-index before the return statement
  const characterZIndex = floorLayerIndex !== -1 ? floorLayerIndex + 2 : 100;  

  return (
    <div className="relative w-full min-h-full overflow-hidden">
      {/* Parallax Background Layers */}
      {sortedLayers.map((layerKey, index) => {
      const layerPath = level.layerPaths[layerKey as keyof typeof level.layerPaths];
      const isFloor = layerPath === "floor.png";
      // Use the pre-calculated characterZIndex here
      const layerZIndex = index <= floorLayerIndex ? index + 1 : characterZIndex + (index - floorLayerIndex);

        return (
          <div 
            key={`${level.id}-${layerKey}`}
            ref={(el) => { layerRefs.current[layerKey] = el; }}
            className="absolute inset-0 w-full h-full bg-repeat-x"
            style={{
              backgroundImage: `url(${level.folderPath}${layerPath})`,
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'repeat-x',
              backgroundPositionX: '0px',
              zIndex: layerZIndex,
              imageRendering: 'pixelated',
              willChange: 'background-position',
              transform: 'translate3d(0, 0, 0)',
              height: '100%',
            }}
          />
        );
      })}
      
      {/* Character */}
      <div 
        ref={characterRef}
        className="absolute bottom-[23px] transform -translate-x-1/2 transition-all duration-300"
        style={{
          width: `${character.animations[characterAnimation]?.frameWidth || 128}px`,
          height: `${character.animations[characterAnimation]?.frameHeight || 128}px`,
          backgroundImage: `url(${character.folderPath}/player.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto',
          imageRendering: 'pixelated',
          transform: 'scale(1.5)',
          transformOrigin: 'bottom center',
          zIndex: characterZIndex,
          left: inBattle ? '40%' : '50%',
        }}
      />
      <EnemyBattleSystem 
        isRunning={isRunning && !inBattle}
        playerCharacter={character}
        onBattleStart={() => setInBattle(true)}
        onBattleEnd={() => setInBattle(false)}
        onPlayerAnimationChange={handlePlayerAnimationChange}
      />
    </div>
  );
}