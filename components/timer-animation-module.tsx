import React, { useRef, useEffect } from "react";
import { gameCharacters } from "../config/characters";
import { levels } from "../config/levels";
import { Character as CharacterType, Level } from '../config/types';
import { usePlayerStore } from '../stores/playerStore';

// Add this function as a named export at the top of the file
export function determineTextColor(): "light" | "dark" {
  const { selectedLevel } = usePlayerStore();
  const level = levels.find(l => l.id === selectedLevel) || levels.find(l => l.id === '1') || levels[0];
  return level.textColor || "light"; // Default to light if textColor is undefined
}

interface TimerAnimationModuleProps {
  isRunning: boolean;
}
export default function TimerAnimationModule({ isRunning }: TimerAnimationModuleProps) {
  const { selectedCharacter, selectedLevel } = usePlayerStore();
  
  // Get the character data and level data
  const character = gameCharacters.find(c => c.id === selectedCharacter) || gameCharacters[0];
  const level = levels.find(l => l.id === selectedLevel) || levels.find(l => l.id === '1') || levels[0];
  
  // References for animation frames
  const characterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  // References for parallax background layers
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);
  
  // Positions for parallax layers
  const positionsRef = useRef<{[key: string]: number}>({
    layer1: 0,
    layer2: 0,
    layer3: 0,
    layer4: 0
  });

  // Animation logic for character
  useEffect(() => {
    const animationType = isRunning ? 'run' : 'idle';
    const animation = character.animations[animationType];
    if (!animation || !characterRef.current) return;

    const { frames, frameWidth, frameHeight, row } = animation;
    
    // Use setInterval with fixed timing for more consistent animation speed
    const animationSpeed = 100; // Animation speed in milliseconds (lower = faster)
    
    const interval = setInterval(() => {
      if (!characterRef.current) return;
      
      // Update character sprite position
      const position = -(frameCountRef.current % frames) * frameWidth;
      const rowPosition = -row * frameHeight;
      characterRef.current.style.backgroundPosition = `${position}px ${rowPosition}px`;
      
      // Increment frame count
      frameCountRef.current = (frameCountRef.current + 1) % frames;
    }, animationSpeed);
    
    // Reset frame count when animation type changes
    frameCountRef.current = 0;
    
    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [character, isRunning]);

    // Parallax animation for background
  useEffect(() => {
      if (!isRunning) return;
    
    // Use setInterval with fixed timing for background animation too
    const backgroundSpeed = 200; // Background animation speed in milliseconds (lower = faster)
    
    const interval = setInterval(() => {
      // Different speeds for different layers
      positionsRef.current.layer1 -= 0.2; // Slowest
      positionsRef.current.layer2 -= 0.5;
      positionsRef.current.layer3 -= 1.0;
      positionsRef.current.layer4 -= 1.5; // Fastest
      
      // Apply positions
      if (layer1Ref.current) layer1Ref.current.style.backgroundPositionX = `${positionsRef.current.layer1}px`;
      if (layer2Ref.current) layer2Ref.current.style.backgroundPositionX = `${positionsRef.current.layer2}px`;
      if (layer3Ref.current) layer3Ref.current.style.backgroundPositionX = `${positionsRef.current.layer3}px`;
      if (layer4Ref.current) layer4Ref.current.style.backgroundPositionX = `${positionsRef.current.layer4}px`;
    }, backgroundSpeed);
    
    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  return (
    <div className="relative w-full min-h-full overflow-hidden">
    {/* Parallax Background Layers */}
    <div 
      ref={layer1Ref}
      className="absolute inset-0 w-full h-full bg-repeat-x"
      style={{
        backgroundImage: `url(${level.folderPath}${level.layerPaths.layer1})`,
        backgroundSize: 'auto 100%',
        zIndex: 1,
        transition: 'background-position-x 0.2s linear',
        imageRendering: 'pixelated',
        willChange: 'background-position',
        filter: 'none',
        transform: 'scale(1)',
      }}
    />
    <div 
      ref={layer2Ref}
      className="absolute inset-0 w-full h-full bg-repeat-x"
      style={{
        backgroundImage: `url(${level.folderPath}${level.layerPaths.layer2})`,
        backgroundSize: 'auto 100%',
        zIndex: 2,
        transition: 'background-position-x 0.2s linear',
        imageRendering: 'pixelated',
        willChange: 'background-position',
        filter: 'none',
        transform: 'scale(1)',
      }}
    />
    <div 
      ref={layer3Ref}
      className="absolute inset-0 w-full h-full bg-repeat-x"
      style={{
        backgroundImage: `url(${level.folderPath}${level.layerPaths.layer3})`,
        backgroundSize: 'auto 100%',
        zIndex: 3,
        transition: 'background-position-x 0.2s linear',
        imageRendering: 'pixelated',
        willChange: 'background-position',
        filter: 'none',
        transform: 'scale(1)',
      }}
    />
    <div 
      ref={layer4Ref}
      className="absolute inset-0 w-full h-full bg-repeat-x"
      style={{
        backgroundImage: `url(${level.folderPath}${level.layerPaths.layer4})`,
        backgroundSize: 'auto 100%',
        zIndex: 4,
        transition: 'background-position-x 0.2s linear',
        imageRendering: 'pixelated',
        willChange: 'background-position',
        filter: 'none',
        transform: 'scale(1)',
      }}
    />
      
      {/* Character */}
      <div 
        ref={characterRef}
        className="absolute bottom-0 left-0 right-0 mx-auto transform -translate-x-1/2"
        style={{
          width: `${character.animations.idle.frameWidth}px`,
          height: `${character.animations.idle.frameHeight}px`,
          backgroundImage: `url(${character.folderPath}/player.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto',
          imageRendering: 'pixelated',
          transform: 'scale(1)', // Optional: scale up the character
          transformOrigin: 'bottom center',
          zIndex: 100
        }}
      />
    </div>
  );
}