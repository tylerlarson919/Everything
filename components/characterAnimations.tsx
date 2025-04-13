import React, { useEffect, useState } from 'react';
import { gameCharacters } from '../config/characters';
import { Character, Animation } from '../config/types';

interface CharacterAnimationProps {
  characterId: string;
  animationTrigger: keyof Character['animations'] | null;
}

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({ characterId, animationTrigger }) => {
  const character = gameCharacters.find(char => char.id === characterId);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<Animation | null>(null);
  const [animationName, setAnimationName] = useState<string>('idle');
  const [isIdle, setIsIdle] = useState(true);

  // Preload the character sprite sheet
  useEffect(() => {
    if (!character) return;

    const img = new Image();
    img.src = `${character.folderPath}/player.png`;
  }, [character]);

  // Handle animation trigger changes
  useEffect(() => {
    if (!character) return;

    if (!animationTrigger) {
      // Default to idle animation
      setAnimationName('idle');
      setCurrentAnimation(character.animations.idle);
      setIsIdle(true);
      setCurrentFrame(0);
      return;
    }

    if (character.animations[animationTrigger]) {
      setAnimationName(animationTrigger);
      setCurrentAnimation(character.animations[animationTrigger]);
      setIsIdle(animationTrigger === 'idle');
      setCurrentFrame(0);
    } else {
      // Fall back to idle if the requested animation doesn't exist
      setAnimationName('idle');
      setCurrentAnimation(character.animations.idle);
      setIsIdle(true);
      setCurrentFrame(0);
    }
  }, [animationTrigger, character]);

  // Animation frame controller
  useEffect(() => {
    if (!character || !currentAnimation) return;

    const interval = setInterval(() => {
      setCurrentFrame(prevFrame => {
        const nextFrame = prevFrame + 1;
        if (nextFrame >= currentAnimation.frames) {
          if (!isIdle) {
            // Non-idle animations should revert to idle when complete
            setAnimationName('idle');
            setCurrentAnimation(character.animations.idle);
            setIsIdle(true);
            return 0;
          }
          return 0; // Loop idle animation
        }
        return nextFrame;
      });
    }, 100); // Animation speed (adjust as needed)

    return () => clearInterval(interval);
  }, [character, currentAnimation, isIdle]);

  if (!character || !currentAnimation) {
    return null;
  }

  // Calculate background position based on current animation row and frame
  const backgroundPositionX = -currentFrame * currentAnimation.frameWidth;
  const backgroundPositionY = -currentAnimation.row * currentAnimation.frameHeight;

  return (
    <div className="-mt-[250px] sm:absolute sm:bottom-28 flex justify-center items-center w-fit h-full">
      <div
        style={{
          width: `${currentAnimation.frameWidth}px`,
          height: `${currentAnimation.frameHeight}px`,
          backgroundImage: `url(${character.folderPath}/player.png)`,
          backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
          backgroundSize: 'auto',
          imageRendering: 'pixelated',
          transform: 'scale(2.5)',
          transformOrigin: 'center',
        }}
        className="sprite-animation"
      />
    </div>
  );
};

export default CharacterAnimation;