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
  const [battlePosition, setBattlePosition] = useState(false);
  const [layerImageWidths, setLayerImageWidths] = useState<{[key: string]: number}>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [playerMovedForBattle, setPlayerMovedForBattle] = useState(false);
  const [characterZIndexModifier, setCharacterZIndexModifier] = useState(0);

  // Get the character data and level data
  const character = gameCharacters.find(c => c.id === selectedCharacter) || gameCharacters[0];
  const level = levels.find(l => l.id === selectedLevel) || levels.find(l => l.id === '1') || levels[0];
  const characterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const layerRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const positionsRef = useRef<{[key: string]: number}>({});
  const animationSpeedRef = useRef<number>(100); // milliseconds per frame

// useEffect to preload images and get their natural widths
  useEffect(() => {
    const layerWidths: {[key: string]: number} = {};
    const imagesToLoad = Object.entries(level.layerPaths).length;
    let loadedCount = 0;
    
    Object.entries(level.layerPaths).forEach(([layerKey, path]) => {
      const img = new Image();
      img.src = `${level.folderPath}${path}`;
      img.onload = () => {
        layerWidths[layerKey] = img.naturalWidth;
        loadedCount++;
        if (loadedCount === imagesToLoad) {
          setLayerImageWidths(layerWidths);
          setImagesLoaded(true);
        }
      };
    });
  }, [level]);

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

  // For battle system animation changes
  const handlePlayerAnimationChange = useCallback((animation: string, inBattlePosition: boolean = false) => {
    setCharacterAnimation(animation);
    setBattlePosition(inBattlePosition);
  }, []);

  const handlePlayerPositionChange = useCallback((shouldMove: boolean) => {
    setPlayerMovedForBattle(shouldMove);
  }, []);

  // Character animation effect that uses the animation state
  useEffect(() => {
    const animation = character.animations[characterAnimation];
    if (!animation ||  !characterRef.current) return;

    const { frames, frameWidth, frameHeight, row } = animation;
    
    // Better animation speed based on type
    if (characterAnimation === 'attack_1' || characterAnimation === 'attack_2') {
      animationSpeedRef.current = 70; // Faster for normal attacks
    } else if (characterAnimation === 'special') {
      animationSpeedRef.current = 60; // Even faster for special
    } else if (characterAnimation === 'hurt') {
      animationSpeedRef.current = 120; // Slower for hurt
    } else if (characterAnimation === 'run') {
      animationSpeedRef.current = 90; // Good pace for running
    } else {
      animationSpeedRef.current = 100; // Default speed
    }
    
    // Reset frame count when animation changes
    frameCountRef.current = 0;
    
    const interval = setInterval(() => {
      if (!characterRef.current) return;
      
      // Update character sprite position
      const frameIndex = frameCountRef.current % frames;
      const position = -frameIndex * frameWidth;
      const rowPosition = -row * frameHeight;
      characterRef.current.style.backgroundPosition = `${position}px ${rowPosition}px`;
      
    // Increment frame count
    frameCountRef.current++;

    // For attack animations, automatically return to idle when complete
    if (frameCountRef.current >= frames && 
      (characterAnimation === 'attack_1' || 
      characterAnimation === 'attack_2' || 
      characterAnimation === 'special' || 
      characterAnimation === 'hurt')) {
    // Don't reset during battle sequences - the battle system controls this
    if (!inBattle) {
      setCharacterAnimation(isRunning ? 'run' : 'idle');
    }
    frameCountRef.current = 0;
    } else if (frameCountRef.current >= frames) {
    frameCountRef.current = 0;
    }

    }, animationSpeedRef.current);
    
    return () => clearInterval(interval);
  }, [character, characterAnimation, inBattle]);

  // Parallax animation for background
  useEffect(() => {
    // Initialize all layers properly on load, regardless of running state
    if (imagesLoaded) {
      const layers = Object.keys(level.layerPaths);
      
      layers.forEach((layerKey) => {
        const layerRef = layerRefs.current[layerKey];
        if (!layerRef || !layerImageWidths[layerKey]) return;
        
        // Always set the initial background properties
        layerRef.style.backgroundImage = `url("${level.folderPath}${level.layerPaths[layerKey as keyof typeof level.layerPaths]}")`;
        layerRef.style.backgroundSize = `auto 100%`;
        layerRef.style.backgroundPosition = `${positionsRef.current[layerKey]}px 0px`;
        layerRef.style.backgroundRepeat = 'repeat-x';
      });
    }
    
    // Only animate when running
    if (!isRunning || inBattle || !imagesLoaded) return;
    
    const animateBackground = () => {
      const layers = Object.keys(level.layerPaths);
      
      layers.forEach((layerKey) => {
        const layerRef = layerRefs.current[layerKey];
        if (!layerRef || !layerImageWidths[layerKey]) return;
        
        const layerNumber = parseInt(layerKey.replace("layer", ""));
        const isFloor = level.layerPaths[layerKey as keyof typeof level.layerPaths] === "floor.png";
        
        // Improved speed calculation
        const speed = isFloor ? 1.2 : 0.2 + (layerNumber * 0.1);
        
        // Update position with Math.round to prevent sub-pixel rendering issues
        positionsRef.current[layerKey] -= speed;
        
        // Use Math.round to prevent sub-pixel rendering which can cause gaps
        layerRef.style.backgroundPosition = `${Math.round(positionsRef.current[layerKey])}px 0px`;
      });
      
      animationFrameRef.current = requestAnimationFrame(animateBackground);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateBackground);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, level, inBattle, imagesLoaded, layerImageWidths]);

  // Get all layer keys from the level
  const layerKeys = Object.keys(level.layerPaths);
  
  // Sort layers to ensure floor.png is in the correct z-index position
  const sortedLayers = [...layerKeys].sort((a, b) => {
    // Extract layer numbers for proper numeric sorting
    const aNum = parseInt(a.replace("layer", ""));
    const bNum = parseInt(b.replace("layer", ""));
    return aNum - bNum;
  });
  
  // Find the floor layer for proper z-index calculation
  const floorLayerKey = Object.entries(level.layerPaths).find(
    ([key, path]) => path === "floor.png"
  )?.[0];
  
  const floorLayerIndex = floorLayerKey 
    ? sortedLayers.indexOf(floorLayerKey)
    : Math.floor(sortedLayers.length / 2); // Default if no floor found
  
  // Calculate character z-index before the return statement
  const characterZIndex = floorLayerIndex !== -1 ? floorLayerIndex + 2 : 100;  

  return (
  <div className="relative w-full min-h-full overflow-hidden">
      {/* Parallax Background Layers */}
      {sortedLayers.map((layerKey, index) => {
        const layerPath = level.layerPaths[layerKey as keyof typeof level.layerPaths];
        const isFloor = layerPath === "floor.png";
        
        // Determine the z-index based on layer position
        let layerZIndex;
        if (isFloor) {
          layerZIndex = floorLayerIndex + 1;
        } else if (index < floorLayerIndex) {
          layerZIndex = index + 1;
        } else if (index > floorLayerIndex) {
          layerZIndex = characterZIndex + 3 + (characterZIndex - index);
        }
        return (
          <div 
            key={`${level.id}-${layerKey}`}
            ref={(el) => { layerRefs.current[layerKey] = el; }}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url("${level.folderPath}${layerPath}")`,
              backgroundSize: 'auto 100%', 
              backgroundRepeat: 'repeat-x',
              backgroundPosition: '0 0',
              zIndex: layerZIndex,
              imageRendering: 'pixelated',
              willChange: 'background-position',
              // Add these properties to fix the gaps
              transform: 'translate3d(0, 0, 0)', // Forces hardware acceleration
              width: 'calc(100% + 2px)', // Slightly wider to prevent edge gaps
              height: 'calc(100% + 2px)', // Slightly taller to prevent edge gaps
              left: '-1px', // Offset to center the extra width
              top: '-1px', // Offset to center the extra height
            }}
          />
        );
      })}
      
      {/* Character */}
      <div 
        ref={characterRef}
        className="absolute left-0 right-0 mx-auto bottom-[22px] transition-[left,transform] duration-[700ms] ease-in-out"
        style={{
          width: `${character.animations[characterAnimation]?.frameWidth}px`,
          height: `${character.animations[characterAnimation]?.frameHeight}px`,
          backgroundImage: `url(${character.folderPath}/player.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0px 0px',
          imageRendering: 'pixelated',
          position: 'absolute',
          zIndex: characterZIndex,
          left: playerMovedForBattle ? '-13%' : '0%',
          transform: 'scale(2.5)',
          transformOrigin: 'bottom center',
          backgroundSize: 'auto',
        }}
      />
      <EnemyBattleSystem 
        isRunning={isRunning && !inBattle}
        playerCharacter={character}
        characterZindex={characterZIndex}
        onBattleStart={() => setInBattle(true)}
        onBattleEnd={() => {
          setInBattle(false);
          // Reset z-index modifier when battle ends
          setCharacterZIndexModifier(0);
          // Ensure character returns to running when battle ends
          setCharacterAnimation(isRunning ? 'run' : 'idle');
        }}
        onPlayerAnimationChange={handlePlayerAnimationChange}
        onPlayerPositionChange={handlePlayerPositionChange}
        onPlayerZIndexChange={(isOnTop) => {
          setCharacterZIndexModifier(isOnTop ? 2 : 0);
        }}
      />
    </div>
  );
}