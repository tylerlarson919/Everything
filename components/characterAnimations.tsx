import React, { useEffect, useState } from 'react';
import { gameCharacters } from '../config/characters';
import { Character } from '../config/types';

interface CharacterAnimationProps {
  characterId: string;
  animationTrigger: 'idle' | 'run' | 'walk' | 'attack' | 'special' | null;
}

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({ characterId, animationTrigger }) => {
  const character = gameCharacters.find(char => char.id === characterId);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationPath, setAnimationPath] = useState<string>('');
  const frameWidth = 512; // Width of each frame
  const frameHeight = 512; // Height of each frame
  const [totalFrames, setTotalFrames] = useState(0);
  const [isIdle, setIsIdle] = useState(true);

  useEffect(() => {
    if (character) {
      const pathsToPreload = [
        `${character.folderPath}/idle.png`,
        `${character.folderPath}/run.png`,
        `${character.folderPath}/walk.png`,
        `${character.folderPath}/attack.png`,
        `${character.folderPath}/special.png`,
      ];
  
      pathsToPreload.forEach(path => {
        const img = new Image();
        img.src = path;
      });
    }
  }, [character]);
  
  useEffect(() => {
    if (character) {
      if (animationTrigger) {
        const paths = getAnimationPath(animationTrigger, character);
        setIsIdle(false);
        if (Array.isArray(paths)) {
          // Handle multiple sprite sheets for attack and special
          setAnimationPath(paths[0]);
          setCurrentFrame(0);
        } else {
          // Single sprite sheet
          setAnimationPath(paths);
          setCurrentFrame(0);
        }
      } else {
        setAnimationPath(`${character.folderPath}/idle.png`);
        setCurrentFrame(0);
        setIsIdle(true);
      }
    }
  }, [animationTrigger, character]);

  useEffect(() => {
    if (animationPath) {
      const img = new Image();
      img.src = animationPath;
      img.onload = () => {
        setTotalFrames(img.width / frameWidth);
      };
    }
  }, [animationPath]);

  useEffect(() => {
    if (animationPath) {
      const interval = setInterval(() => {
        setCurrentFrame(prevFrame => {
          const nextFrame = prevFrame + 1;
          if (nextFrame >= totalFrames) {
            if (!isIdle) {
              clearInterval(interval);
              setAnimationPath(`${character?.folderPath}/idle.png`);
              setIsIdle(true);
              return 0; // Reset to the first frame
            }
            return 0; // Reset to the first frame for idle
          }
          return nextFrame;
        });
      }, 100); // Adjust duration as needed
  
      return () => clearInterval(interval);
    }
  }, [animationPath, totalFrames, isIdle, character]);

  const getAnimationPath = (trigger: string, character: Character) => {
    switch (trigger) {
      case 'run':
        return `${character.folderPath}/run.png`;
      case 'walk':
        return `${character.folderPath}/walk.png`;
      case 'attack':
        return `${character.folderPath}/attack.png`;
      case 'special':
        return `${character.folderPath}/special.png`;
      default:
        return `${character.folderPath}/idle.png`;
    }
  };
  
  return (
    <div className="-mt-[250px] sm:absolute sm:bottom-28 flex justify-center items-center w-fit h-full">
      <div
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          backgroundImage: `url(${animationPath})`,
          backgroundPosition: `-${currentFrame * frameWidth}px 0px`,
          backgroundSize: `${frameWidth * totalFrames}px ${frameHeight}px`,
        }}
        className="sprite-animation"
      />
    </div>
  );
};

export default CharacterAnimation;