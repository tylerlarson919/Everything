import React, { useEffect, useRef, useState, useCallback } from 'react';
import { enemies } from '../config/enemys';
import { Enemy } from '../config/types';

// Update the interface to handle player animation changes
interface EnemyBattleSystemProps {
  isRunning: boolean;
  playerCharacter: any;
  onBattleStart: () => void;
  onBattleEnd: () => void;
  onPlayerAnimationChange?: (animation: string) => void; // Add this
}

export default function EnemyBattleSystem({
  isRunning,
  playerCharacter,
  onBattleStart,
  onBattleEnd,
  onPlayerAnimationChange // Add this parameter
}: EnemyBattleSystemProps) {
  // Replace state to be simpler
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [enemyState, setEnemyState] = useState({
    isActive: false,
    position: window.innerWidth,
    animation: 'walk',
    frameCount: 0
  });
  const enemyRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const battleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // Add reference to track battle state
  const battleInProgressRef = useRef(false);
  
  // Create a better spawn system
  const spawnEnemy = useCallback(() => {
    if (enemyState.isActive || !isRunning || battleInProgressRef.current) return;
    
    // Select random enemy
    const randomIndex = Math.floor(Math.random() * enemies.length);
    const enemy = enemies[randomIndex];
    
    setCurrentEnemy(enemy);
    setEnemyState({
      isActive: true,
      position: window.innerWidth,
      animation: 'walk',
      frameCount: 0
    });
    animateEnemy();
  }, [enemyState.isActive, isRunning]);
  
  // Add this function after the spawnEnemy callback
  const animateEnemy = useCallback(() => {
    if (!enemyState.isActive || !currentEnemy) return;
    
    const moveSpeed = 5; // pixels per frame
    
    const animate = () => {
      setEnemyState(prev => {
        const newPosition = prev.position - moveSpeed;
        
        // Check for collision with player (middle of screen)
        if (newPosition <= window.innerWidth / 2 && prev.animation !== 'die' && !battleInProgressRef.current) {
          startBattle();
          return { ...prev, position: newPosition };
        }
        
        return { ...prev, position: newPosition };
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentEnemy, enemyState.isActive]);


  // Replace spawn timer with a better implementation
  useEffect(() => {
    if (!isRunning) {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      return;
    }

    // Add this cleanup effect
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (spawnTimerRef.current) {
          clearTimeout(spawnTimerRef.current);
        }
        if (battleTimerRef.current) {
          clearTimeout(battleTimerRef.current);
        }
      };
    }, []);

    // Update enemy animation frames
    useEffect(() => {
      if (!currentEnemy || !enemyRef.current) return;
      
      const animation = currentEnemy.animations[enemyState.animation] || currentEnemy.animations.idle;
      if (!animation) return;
      
      const { frames, frameWidth, frameHeight, row } = animation;
      
      // Animation timing
      const animationSpeed = 100; // milliseconds per frame
      
      const interval = setInterval(() => {
        if (!enemyRef.current) return;
        
        setEnemyState(prev => {
          const newFrameCount = (prev.frameCount + 1) % frames;
          
          // Update sprite position
          const position = -newFrameCount * frameWidth;
          const rowPosition = -row * frameHeight;
          enemyRef.current!.style.backgroundPosition = `${position}px ${rowPosition}px`;
          
          return { ...prev, frameCount: newFrameCount };
        });
      }, animationSpeed);
      
      return () => clearInterval(interval);
    }, [currentEnemy, enemyState.animation]);
    
    const scheduleNextSpawn = () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      
      const randomDelay = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
      spawnTimerRef.current = setTimeout(() => {
        if (isRunning && !enemyState.isActive && !battleInProgressRef.current) {
          spawnEnemy();
        }
        scheduleNextSpawn();
      }, randomDelay);
    };
    
    scheduleNextSpawn();
    
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [isRunning, spawnEnemy, enemyState.isActive]);
  
  // Replace battle sequence with a step-by-step choreographed battle
  const startBattle = useCallback(() => {
    if (!currentEnemy || battleInProgressRef.current) return;
    
    battleInProgressRef.current = true;
    onBattleStart();
    
    // Create a battle sequence with proper timing
    const battleSequence = [
      // Starting poses
      { delay: 300, playerAnim: 'idle', enemyAnim: 'idle' },
      
      // Player's first attack
      { delay: 800, playerAnim: 'attack_1', enemyAnim: null },
      { delay: 400, playerAnim: null, enemyAnim: 'hurt' },
      { delay: 500, playerAnim: 'idle', enemyAnim: 'idle' },
      
      // Enemy's attack
      { delay: 800, playerAnim: null, enemyAnim: 'attack_1' },
      { delay: 400, playerAnim: 'hurt', enemyAnim: null },
      { delay: 500, playerAnim: 'idle', enemyAnim: 'idle' },
      
      // Player's second attack (special)
      { delay: 1000, playerAnim: 'special', enemyAnim: null },
      { delay: 600, playerAnim: null, enemyAnim: 'hurt' },
      
      // Enemy dies
      { delay: 500, playerAnim: 'idle', enemyAnim: 'die' },
      
      // Battle end
      { delay: 1200, playerAnim: 'run', enemyAnim: null }
    ];
    
    let currentStep = 0;
    
    const executeNextStep = () => {
      if (currentStep >= battleSequence.length) {
        // Battle sequence complete
        battleInProgressRef.current = false;
        
        // Remove enemy and continue running
        setTimeout(() => {
          setEnemyState({
            isActive: false,
            position: window.innerWidth,
            animation: 'walk',
            frameCount: 0
          });
          onBattleEnd();
        }, 500);
        
        return;
      }
      
      const step = battleSequence[currentStep];
      
      // Update player animation if needed
      if (step.playerAnim && onPlayerAnimationChange) {
        onPlayerAnimationChange(step.playerAnim);
      }
      
      // Update enemy animation if needed
      if (step.enemyAnim) {
        setEnemyState(prev => ({
          ...prev,
          animation: step.enemyAnim!
        }));
      }
      
      // Schedule next step
      setTimeout(() => {
        currentStep++;
        executeNextStep();
      }, step.delay);
    };
    
    // Start battle sequence
    executeNextStep();
  }, [currentEnemy, onBattleStart, onBattleEnd, onPlayerAnimationChange]);
  
  // Only render if there's an active enemy
  if (!enemyState.isActive || !currentEnemy) return null;
  
  return (
    <div 
      ref={enemyRef}
      className="absolute bottom-[23px] transform -translate-x-1/2"
      style={{
        width: `${currentEnemy.animations[enemyState.animation]?.frameWidth || 128}px`,
        height: `${currentEnemy.animations[enemyState.animation]?.frameHeight || 128}px`,
        backgroundImage: `url(${currentEnemy.folderPath}/enemy.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        imageRendering: 'pixelated',
        transform: 'scale(1.5) scaleX(-1)', // Flip horizontally since enemy comes from right
        transformOrigin: 'bottom center',
        left: `${enemyState.position}px`,
        zIndex: 200, // Make sure it's above background layers
      }}
    />
  );
}