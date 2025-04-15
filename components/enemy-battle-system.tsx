import { useEffect, useRef, useState, useCallback } from 'react';
import { enemies } from '../config/enemies';
import { Enemy } from '../config/types';

// For debugging
const DEBUG = false;
const debug = (...args: any[]) => {
  if (DEBUG) console.log('[EnemyBattle]', ...args);
};

// Update the interface to handle player animation changes
interface EnemyBattleSystemProps {
  isRunning: boolean;
  playerCharacter: any;
  onBattleStart: () => void;
  onBattleEnd: () => void;
  onPlayerAnimationChange?: (animation: string, inBattlePosition?: boolean) => void;
  onPlayerPositionChange?: (shouldMove: boolean) => void; // Add this line
  onPlayerZIndexChange?: (isOnTop: boolean) => void;
}

export default function EnemyBattleSystem({
  isRunning,
  playerCharacter,
  onBattleStart,
  onBattleEnd,
  onPlayerAnimationChange,
  onPlayerPositionChange, // Add this
  onPlayerZIndexChange    // Add this
}: EnemyBattleSystemProps) {
  // Replace state to be simpler
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [enemyState, setEnemyState] = useState({
    isActive: false,
    position: 120,
    animation: 'walk',
    frameCount: 0
  });
  const enemyRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const battleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const positionRef = useRef(100);
  const shouldMovePlayerRef = useRef(false);
  const lastTimeRef = useRef(0);
  const animationActiveRef = useRef(false);
  const scheduleNextSpawnRef = useRef<() => void>(() => {});
  const [playerOnTop, setPlayerOnTop] = useState(false);

  // Add reference to track battle state
  const battleInProgressRef = useRef(false);
  
  // Create a better spawn system
  const spawnEnemy = useCallback(() => {
    console.log('spawnEnemy called - active:', enemyState.isActive, 'battle:', battleInProgressRef.current);
    
    // Add check to prevent spawning during battle
    if (enemyState.isActive || !isRunning || battleInProgressRef.current) {
      console.log('Spawn prevented - active:', enemyState.isActive, 'running:', isRunning, 'battle:', battleInProgressRef.current);
      return;
    }
  
    // Reset animation flag
    animationActiveRef.current = false;
  
    // Select random enemy
    const randomIndex = Math.floor(Math.random() * enemies.length);
    const enemy = enemies[randomIndex];
    console.log('Spawning enemy:', enemy.name);
  
    setCurrentEnemy(enemy);
    setEnemyState({
      isActive: true,
      position: 120,
      animation: 'walk',
      frameCount: 0
    });
  }, [isRunning]);
  
  // Define startBattle before it's used in animateEnemy
  const startBattle = useCallback(() => {
    if (!currentEnemy || battleInProgressRef.current) return;
    
    console.log('Starting battle sequence');
    battleInProgressRef.current = true;
    console.log(`Battle started with enemy: ${currentEnemy.name}`);
    onBattleStart();
  
    // Get available animations for enemy and player
    const enemyAttacks = ['attack_1'];
    if (currentEnemy.animations.attack_2) enemyAttacks.push('attack_2');
    if (currentEnemy.animations.special) enemyAttacks.push('special');
  
    const playerAttacks = ['attack_1'];
    if (playerCharacter.animations.attack_2) playerAttacks.push('attack_2');
    if (playerCharacter.animations.special) playerAttacks.push('special');
  
    // Choose random attack animations
    const randomPlayerAttack1 = playerAttacks[Math.floor(Math.random() * playerAttacks.length)];
    const randomPlayerAttack2 = playerAttacks[Math.floor(Math.random() * playerAttacks.length)];
    const randomEnemyAttack = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
  
    // Better timed battle sequence with randomized attacks
    const battleSequence = [
      // Starting poses
      { delay: 300, playerAnim: 'idle', enemyAnim: 'idle', inBattlePosition: true, playerOnTop: false },
      
      // Player's first attack - player on top
      { delay: 700, playerAnim: randomPlayerAttack1, enemyAnim: null, inBattlePosition: true, playerOnTop: true },
      { delay: 400, playerAnim: null, enemyAnim: 'hurt', inBattlePosition: true, playerOnTop: true },
      { delay: 500, playerAnim: 'idle', enemyAnim: 'idle', inBattlePosition: true, playerOnTop: false },
      
      // Enemy's attack - enemy on top
      { delay: 700, playerAnim: null, enemyAnim: randomEnemyAttack, inBattlePosition: true, playerOnTop: false },
      { delay: 400, playerAnim: 'hurt', enemyAnim: null, inBattlePosition: true, playerOnTop: false },
      { delay: 500, playerAnim: 'idle', enemyAnim: 'idle', inBattlePosition: true, playerOnTop: false },
      
      // Player's second attack - player on top again
      { delay: 800, playerAnim: randomPlayerAttack2, enemyAnim: null, inBattlePosition: true, playerOnTop: true },
      { delay: 500, playerAnim: null, enemyAnim: 'hurt', inBattlePosition: true, playerOnTop: true },
      
      // Enemy dies
      { delay: 500, playerAnim: 'idle', enemyAnim: 'die', inBattlePosition: true, playerOnTop: true },
      
      // Battle end
      { delay: 1000, playerAnim: 'run', enemyAnim: null, inBattlePosition: false, cleanup: true, endBattle: true, playerOnTop: false }
    ];
  
    let currentStep = 0;
  
    const executeNextStep = () => {
      if (currentStep >= battleSequence.length) {
        console.log('Battle sequence completed');
        
        // Add a delay before allowing next spawn
        setTimeout(() => {
          // Reset all battle-related flags
          battleInProgressRef.current = false;
          shouldMovePlayerRef.current = false;
          animationActiveRef.current = false;
          
          // Make sure enemy is cleared
          setEnemyState({
            isActive: false,
            position: 120,
            animation: 'walk',
            frameCount: 0
          });
          setCurrentEnemy(null);
          
          // Force a spawn after a short delay
          setTimeout(() => {
            if (isRunning) {
              console.log('Forcing next spawn after battle');
              spawnEnemy();
            }
          }, 5000); // 5 seconds delay before next spawn
        }, 2000);
        
        return;
      }
      
        const step = battleSequence[currentStep];
    console.log('Battle step:', currentStep, step);
    
    // Update player animation if needed
    if (step.playerAnim && onPlayerAnimationChange) {
      onPlayerAnimationChange(step.playerAnim, step.inBattlePosition);
    }
    
    // Set who should be on top
    if (step.playerOnTop !== undefined) {
      setPlayerOnTop(step.playerOnTop);
    }

    if (step.endBattle) {
      // Don't set battleInProgressRef to false here - do it in the setTimeout after battle sequence completes
      shouldMovePlayerRef.current = false;

      // Use setTimeout to safely call position change
      if (onPlayerPositionChange) {
        setTimeout(() => onPlayerPositionChange(false), 0);
      }
      
      onBattleEnd();
      // Clear animation frame if it exists
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Immediately set isActive to false to allow new enemies to spawn
      setEnemyState({
        isActive: false,
        position: 120,
        animation: 'walk',
        frameCount: 0
      });
      setCurrentEnemy(null);
    }
        
          // Update enemy animation if needed
    if (step.enemyAnim) {
      if (step.enemyAnim === 'die') {
        console.log(`Enemy ${currentEnemy.name} death animation triggered`);
      }
      setEnemyState(prev => ({
        ...prev,
        animation: step.enemyAnim!
      }));
    }
    
    // If this is a cleanup step, remove the enemy
    if (step.cleanup && !step.endBattle) {
      // Only handle cleanup here if it's not also the endBattle step
      setEnemyState(prev => ({
        ...prev,
        animation: 'walk'
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
  }, [currentEnemy, onBattleStart, onBattleEnd, onPlayerAnimationChange, playerCharacter]);

  // Now define animateEnemy after startBattle is declared
  const animateEnemy = useCallback(() => {
    const enemy = currentEnemy;
    
    if (!enemyState.isActive || !enemy) {
      animationActiveRef.current = false;
      return;
    }
    
    // Don't set animationActiveRef.current here again
    console.log('Starting enemy animation');
    const moveSpeed = 0.2;
  
  const animate = () => {
    setEnemyState(prev => {
      // Update animation frame count here
      const newFrameCount = (prev.frameCount + 1) % enemy.animations.walk.frames;
      
      // Simply decrease the position value directly (moving left)
      const newPosition = prev.position - moveSpeed;
      positionRef.current = newPosition; // Track current position
        
        // Trigger player movement at 60%
        if (newPosition <= 60 && !shouldMovePlayerRef.current) {
          console.log('Setting player to move flag');
          shouldMovePlayerRef.current = true;
        }
  
        // Check if enemy reached the player position (45%)
        if (newPosition <= 45 && prev.animation === 'walk' && !battleInProgressRef.current) {
          console.log('Enemy reached player - starting battle');
          // Cancel the animation frame to stop movement
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          animationActiveRef.current = false;
          setTimeout(() => startBattle(), 0);
          return { ...prev, position: 45, frameCount: newFrameCount }; // Ensure it stops at 45
        }
        
        return { ...prev, position: newPosition, frameCount: newFrameCount };
      });
      
      // Only continue animation if we haven't reached the target position
      if (positionRef.current > 45 && !battleInProgressRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationActiveRef.current = false;
      }
    };
    
    // Start the animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentEnemy, startBattle]);

  useEffect(() => {
    console.log('Enemy state updated:', 
      'isActive:', enemyState.isActive, 
      'animation:', enemyState.animation,
      'battle in progress:', battleInProgressRef.current
    );
  }, [enemyState.isActive, enemyState.animation]);

  useEffect(() => {
    if (enemyState.isActive && currentEnemy && enemyState.animation === 'walk' && !animationActiveRef.current) {
      console.log('Enemy is active, starting animation with animation:', enemyState.animation);
      // Set the flag before calling animateEnemy to prevent double-starts
      animationActiveRef.current = true;
      animateEnemy();
    }
  }, [enemyState.isActive, currentEnemy, animateEnemy, enemyState.animation]);

    useEffect(() => {
      if (onPlayerZIndexChange) {
        onPlayerZIndexChange(playerOnTop);
      }
    }, [playerOnTop, onPlayerZIndexChange]);

  const spawnNext = useCallback(() => {
    // Clear function to prevent memory leaks
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    
    // Don't spawn if running is false or a battle is in progress
    if (!isRunning || battleInProgressRef.current) {
      console.log('Skipping spawn - running:', isRunning, 'battle:', battleInProgressRef.current);
      return;
    }
    
    // Spawn an enemy if there isn't one active
    if (!enemyState.isActive) {
      console.log('Scheduling a new enemy spawn');
      spawnEnemy();
    }
    
    // Always schedule another check after a delay
    const nextDelay = Math.floor(Math.random() * 10000) + 10000; // 10-20 seconds
    console.log(`Next enemy check in ${nextDelay/1000} seconds`);
    spawnTimerRef.current = setTimeout(spawnNext, nextDelay);
  }, [isRunning, spawnEnemy]);

  useEffect(() => {
    // Start the spawn loop if running
    if (isRunning) {
      // Initial spawn delay
      const initialDelay = enemyState.isActive ? 5000 : 500;
      spawnTimerRef.current = setTimeout(spawnNext, initialDelay);
    }
    
    // Cleanup on unmount
    return () => {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
    };
  }, [isRunning, spawnNext, enemyState.isActive]);


    // Add separate cleanup useEffect
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (spawnTimerRef.current) {
          clearTimeout(spawnTimerRef.current);
          spawnTimerRef.current = null;
        }
        if (battleTimerRef.current) {
          clearTimeout(battleTimerRef.current);
          battleTimerRef.current = null;
        }
        // Reset all state flags for good measure
        battleInProgressRef.current = false;
        shouldMovePlayerRef.current = false;
        animationActiveRef.current = false;
      };
    }, []);

  useEffect(() => {
    if (shouldMovePlayerRef.current && onPlayerPositionChange) {
      // Use setTimeout to push the state update out of the render cycle
      const timeoutId = setTimeout(() => {
        console.log('Safely notifying player position change:', true);
        onPlayerPositionChange(true);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [shouldMovePlayerRef.current, onPlayerPositionChange]);

  useEffect(() => {
    if (enemyState.isActive && !battleInProgressRef.current) {
      const checkPosition = () => {
        if (positionRef.current <= 60 && positionRef.current > 45 && !shouldMovePlayerRef.current) {
          console.log('Setting move flag from position check');
          shouldMovePlayerRef.current = true;
        }
        
        if (shouldMovePlayerRef.current) {
          return; // Stop checking once flag is set
        }
        
        requestAnimationFrame(checkPosition);
      };
      
      const animId = requestAnimationFrame(checkPosition);
      return () => cancelAnimationFrame(animId);
    }
  }, [enemyState.isActive, battleInProgressRef.current]);

  
  // 1. Modify the animation frames effect to avoid double-updating frameCount for walk animation
  useEffect(() => {
    if (!currentEnemy || !enemyRef.current) return;
  
    const animation = currentEnemy.animations[enemyState.animation];
    if (!animation) return;
    
    const { frames, frameWidth, frameHeight, row } = animation;
    
    // Set animation speed based on type
    let animationSpeed;
    switch (enemyState.animation) {
      case 'attack_1':
      case 'attack_2':
        animationSpeed = 80;
        break;
      case 'hurt':
        animationSpeed = 120;
        break;
      case 'die':
        animationSpeed = 125;
        break;
      case 'walk':
        animationSpeed = 140;
        break;
      default:
        animationSpeed = 100; // default
    }
  
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
  
      if (elapsed > animationSpeed) {
        let newFrameCount = (enemyState.frameCount + 1) % frames;
        
        // For die animation, keep it at the last frame
        if (enemyState.animation === 'die' && enemyState.frameCount >= frames - 1) {
          newFrameCount = frames - 1;
        }
  
        const xPos = -newFrameCount * frameWidth;
        const yPos = -row * frameHeight;
        
        if (enemyRef.current) {
          enemyRef.current.style.backgroundPosition = `${xPos}px ${yPos}px`;
        }
        
        // Update frame count only if not in walk animation
        if (enemyState.animation !== 'walk') {
          setEnemyState(prev => ({
            ...prev, 
            frameCount: newFrameCount
          }));
        }
        
        lastTimeRef.current = timestamp;
      }
  
      animationFrameRef.current = requestAnimationFrame(animate);
    };
  
    animationFrameRef.current = requestAnimationFrame(animate);
  
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentEnemy, enemyState.animation, enemyState.frameCount]);

  // Only render if there's an active enemy
  if (!enemyState.isActive || !currentEnemy) return null;
  
  return (
    <div 
      ref={enemyRef}
      className="absolute bottom-[22px]"
      style={{
        width: `${currentEnemy.animations[enemyState.animation]?.frameWidth || 90}px`,
        height: `${currentEnemy.animations[enemyState.animation]?.frameHeight || 64}px`,
        backgroundImage: `url(${currentEnemy.folderPath}/enemy.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0px 0px',
        backgroundSize: 'auto',
        position: 'absolute',
        imageRendering: 'pixelated',
        transform: 'scale(1.5) scaleX(-1)',
        transformOrigin: 'bottom center',
        left: `${enemyState.position}%`,
        zIndex: playerOnTop ? 101 : 103
      }}
    />
  );
}