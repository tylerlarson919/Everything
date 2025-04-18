"use client";
import { Character } from '../../config/types';
import { useEffect, useState, useRef } from 'react';
import { gameCharacters } from '../../config/characters';
import { Button } from '@heroui/button';
import LeftCaret from '@/components/icons/left-caret';
import RightCaret from '@/components/icons/right-caret';
import CharacterAnimation from '@/components/characterAnimations';
import { useFirestore } from "../../config/FirestoreContext";
import { writeSelectedCharacter } from '../../config/firebase';
import { useRouter } from "next/navigation";
import { usePlayerStore } from '../../stores/playerStore';
import Image from 'next/image';

const CharacterSelection = () => {
  const { user, items, loading } = useFirestore();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'run' | 'walk' | 'attack_1' | 'attack_2' | 'jump' | 'special' | null>('idle');
  const router = useRouter();
  const playerStore = usePlayerStore();

  // Fetch available characters on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setCharacters(gameCharacters);
        
        if (gameCharacters.length > 0) {
          setSelectedCharacter(gameCharacters[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching characters:', error);
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handlePrevCharacter = () => {
    if (!selectedCharacter) return;
    const currentIndex = characters.findIndex(c => c.id === selectedCharacter.id);
    const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
    setSelectedCharacter(characters[prevIndex]);
  };

  const handleNextCharacter = () => {
    if (!selectedCharacter) return;
    const currentIndex = characters.findIndex(c => c.id === selectedCharacter.id);
    const nextIndex = (currentIndex + 1) % characters.length;
    setSelectedCharacter(characters[nextIndex]);
  };

  const handleSelectCharacter = async () => {
    if (!selectedCharacter || !user) return; 
    
    try {
      // Update the character in the player store instead of directly writing to Firestore
      playerStore.setSelectedCharacter(selectedCharacter.id);
      router.push("/");
    } catch (error) {
      console.error("Error saving selected character:", error);
    }
  };

  const playAttack = () => {
    if (!selectedCharacter) return;
    setCurrentAnimation('attack_1'); 
    setTimeout(() => {
      setCurrentAnimation('idle');
    }, 5000);
  };
  
  const playAbility = () => {
    if (!selectedCharacter) return;
    setCurrentAnimation('special');
    setTimeout(() => {
      setCurrentAnimation('idle'); // Reset to idle after attack animation
    }, 5000); // Adjust the duration 
  };

  const StatBar = ({ value }: { value: number }) => {
    const [width, setWidth] = useState(0);
  
    useEffect(() => {
      // Set the width to the new value to transition from the previous value
      setWidth(value);
    }, [value]);
  
    return (
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${width}%` }}
        ></div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen font-bold tracking-widest">Loading characters...</div>;
  }

  return (
    <div className="flex flex-col items-center p-8 w-screen bg-cover bg-center justify-start">
     {selectedCharacter && (

        <div className="flex flex-col w-full max-w-6xl">

          <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-4 relative">
            {/* Left Navigation Arrow */}
          <button 
            onClick={handlePrevCharacter}
            className="flex justify-center items-center text-4xl absolute left-0 top-1/4 sm:top-1/2 z-10"
          >
            <LeftCaret className="text-black hover-text-grey/80 dark:text-white dark:hover:text-white/80 transition-colors"/>
          </button>
          {/* Right Navigation Arrow */}
          <button 
            onClick={handleNextCharacter}
            className="flex justify-center items-center text-4xl absolute right-0 top-1/4 sm:top-1/2 z-10"
          >
            <RightCaret className="text-black hover-text-grey/80 dark:text-white dark:hover:text-white/80 transition-colors"/>
          </button>

            {/* Character Display Area */}
            <div className="flex flex-col items-center relative w-full sm:w-2/5">
              <CharacterAnimation characterId={selectedCharacter.id} animationTrigger={currentAnimation} />
            </div>
            {/* Character Stats Area */}
            <div className='flex flex-col gap-3 w-full sm:w-1/3'>
              <h1 className="text-left text-3xl font-bold tracking-wide">{selectedCharacter.name}</h1>
              <div className='flex gap-4'>
                <button onClick={playAttack} className='flex flex-row w-1/2 items-center justify-start'>
                  <div className='flex flex-col w-full items-start'>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">ATTACK</p>
                    <p className="text-sm font-bold text-left">{selectedCharacter.attack}</p>
                  </div>
                </button>
                <button onClick={playAbility} className='flex flex-row w-1/2 items-center justify-start'>
                  <div className='flex flex-col w-full items-start'>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">ABILITY</p>
                    <p className="text-sm font-bold text-left">{selectedCharacter.specialAbility}</p>
                  </div>
                </button>
              </div>
              <div>
                  <div className='flex flex-row justify-between w-full pb-[2px]'>
                    <p className="text-left text-[10px] text-gray-600 dark:text-gray-400">ATTACK</p>
                    <p className="text-left text-[10px] text-gray-600 dark:text-gray-400">{selectedCharacter.stats.damage}</p>
                  </div>
                  <StatBar value={selectedCharacter.stats.damage} />
                  <div className='flex flex-row justify-between w-full pb-[2px]'>
                    <p className="text-left text-[10px] pt-3 text-gray-600 dark:text-gray-400">DEFENCE</p>
                    <p className="text-left text-[10px] pt-3 text-gray-600 dark:text-gray-400">{selectedCharacter.stats.defence}</p>
                  </div>
                  <StatBar value={selectedCharacter.stats.defence} />
                  <div className='flex flex-row justify-between w-full pb-[2px]'>
                    <p className="text-left text-[10px] pt-3 text-gray-600 dark:text-gray-400">HEALTH</p>
                    <p className="text-left text-[10px] pt-3 text-gray-600 dark:text-gray-400">{selectedCharacter.stats.health}</p>
                  </div>
                  <StatBar value={selectedCharacter.stats.health} />
              </div>
              <div className="mt-auto flex justify-center pt-4">
                <Button 
                  onPress={handleSelectCharacter}
                  variant="flat"
                  color='primary'
                  className=""
                >
                  SELECT CHARACTER
                </Button>
              </div>
            </div>
          </div>
        <div className="w-full max-w-6xl mt-8">
          <h2 className="text-2xl font-bold mb-4">Characters</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map((character) => (
              <div 
                key={character.id} 
                onClick={() => setSelectedCharacter(character)}
                className={`cursor-pointer p-4 rounded-lg transition-all ${
                  selectedCharacter?.id === character.id 
                    ? 'bg-primary-100 dark:bg-dark1' 
                    : 'bg-gray-100 dark:bg-dark2 hover:bg-gray-200 dark:hover:bg-dark3'
                }`}
              >
                <div className="h-24 flex justify-center items-center overflow-hidden">
                  <img 
                    src={`${character.folderPath}/profile.png`}
                    alt={character.name}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <p className="text-center mt-2 font-medium">{character.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default CharacterSelection;