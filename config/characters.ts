import { Character } from './types';

  export const gameCharacters: Character[] = [
          { 
            id: '1', 
            class: 'Homeless',
            name: 'Trish', 
            folderPath: '/characters/Homeless/Homeless_2', 
            stats: { 
              damage: 10, 
              defence: 15,
              health: 20, 
            },
            attack: 'Shiv',
            specialAbility: 'Run Away',
            animations: {
              idle: { row: 0, frames: 7, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 8, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 12, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 10, frameWidth: 128, frameHeight: 128 },
              special: { row: 5, frames: 8, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 6, frames: 3, frameWidth: 128, frameHeight: 128 },
              die:{ row: 7, frames: 4, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '2', 
            class: 'Homeless',
            name: 'Joe', 
            folderPath: '/characters/Homeless/Homeless_1', 
            stats: { 
              damage: 15, 
              defence: 15,
              health: 20, 
            },
            attack: 'Flailing Beer Stab',
            specialAbility: 'Super Chug',
            animations: {
              idle: { row: 0, frames: 6, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 8, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 16, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 5, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 5, frames: 3, frameWidth: 128, frameHeight: 128 },
              special: { row: 6, frames: 13, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 7, frames: 3, frameWidth: 128, frameHeight: 128 },
              die:{ row: 8, frames: 4, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '3', 
            class: 'Raider',
            name: 'Jason', 
            folderPath: '/characters/Raiders/Raider_3', 
            stats: { 
              damage: 25, 
              defence: 20,
              health: 28, 
            },
            attack: 'Bash',
            specialAbility: 'Beat to a Pulp',
            animations: {
              idle: { row: 0, frames: 6, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 7, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 8, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 5, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 5, frames: 5, frameWidth: 128, frameHeight: 128 },
              special: { row: 6, frames: 4, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 7, frames: 2, frameWidth: 128, frameHeight: 128 },
              die:{ row: 8, frames: 4, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '4', 
            class: 'Raider',
            name: 'Steve', 
            folderPath: '/characters/Raiders/Raider_1', 
            stats: { 
              damage: 28, 
              defence: 20,
              health: 30, 
            },
            attack: 'Gun Butt',
            specialAbility: 'Pump with Lead',
            animations: {
              idle: { row: 0, frames: 6, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 8, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 11, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 9, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 5, frames: 12, frameWidth: 128, frameHeight: 128 },
              special: { row: 6, frames: 12, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 7, frames: 2, frameWidth: 128, frameHeight: 128 },
              die:{ row: 8, frames: 4, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '5', 
            class: 'Raider',
            name: 'Jess', 
            folderPath: '/characters/Raiders/Raider_2', 
            stats: { 
              damage: 35, 
              defence: 25,
              health: 30, 
            },
            attack: 'Gun Butt',
            specialAbility: 'Gorilla Warefare',
            animations: {
              idle: { row: 0, frames: 8, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 7, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 7, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 8, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 5, frames: 8, frameWidth: 128, frameHeight: 128 },
              special: { row: 6, frames: 12, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 7, frames: 3, frameWidth: 128, frameHeight: 128 },
              die:{ row: 8, frames: 5, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '6', 
            class: 'Ninja',
            name: 'Fighter', 
            folderPath: '/characters/Ninjas/Fighter', 
            stats: { 
              damage: 35, 
              defence: 25,
              health: 30, 
            },
            attack: 'Chop',
            specialAbility: 'High Kick',
            animations: {
              idle: { row: 0, frames: 6, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 8, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 3, frames: 7, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 4, frames: 4, frameWidth: 128, frameHeight: 128 },
              special: { row: 5, frames: 4, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 6, frames: 3, frameWidth: 128, frameHeight: 128 },
              die:{ row: 7, frames: 3, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '7', 
            class: 'Ninja',
            name: 'Samurai', 
            folderPath: '/characters/Ninjas/Samurai', 
            stats: { 
              damage: 35, 
              defence: 25,
              health: 30, 
            },
            attack: 'Chop',
            specialAbility: 'High Kick',
            animations: {
              idle: { row: 0, frames: 6, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 8, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 12, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 10, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 5, frames: 13, frameWidth: 128, frameHeight: 128 },
              special: { row: 6, frames: 4, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 7, frames: 2, frameWidth: 128, frameHeight: 128 },
              die:{ row: 8, frames: 3, frameWidth: 128, frameHeight: 128 },
            }
          },
          { 
            id: '8', 
            class: 'Ninja',
            name: 'Shinobi', 
            folderPath: '/characters/Ninjas/Shinobi', 
            stats: { 
              damage: 35, 
              defence: 25,
              health: 30, 
            },
            attack: 'Chop',
            specialAbility: 'High Kick',
            animations: {
              idle: { row: 0, frames: 6, frameWidth: 128, frameHeight: 128 },
              walk: { row: 1, frames: 8, frameWidth: 128, frameHeight: 128 },
              run: { row: 2, frames: 8, frameWidth: 128, frameHeight: 128 },
              jump: { row: 3, frames: 12, frameWidth: 128, frameHeight: 128 },
              attack_1: { row: 4, frames: 8, frameWidth: 128, frameHeight: 128 },
              attack_2: { row: 5, frames: 4, frameWidth: 128, frameHeight: 128 },
              special: { row: 6, frames: 4, frameWidth: 128, frameHeight: 128 },
              hurt:{ row: 7, frames: 4, frameWidth: 128, frameHeight: 128 },
              die:{ row: 8, frames: 4, frameWidth: 128, frameHeight: 128 },
            }
          },
          {  
            id: '9', 
            class: 'Ninja',
            name: 'NightBorne', 
            folderPath: '/characters/Ninjas/NightBorne', 
            stats: { 
              damage: 35, 
              defence: 25,
              health: 30, 
            },
            attack: 'Gun Butt',
            specialAbility: 'Gorilla Warefare',
            animations: {
              idle: { row: 0, frames: 9, frameWidth: 80, frameHeight: 80 },
              run: { row: 1, frames: 6, frameWidth: 80, frameHeight: 80 },
              attack_1: { row: 2, frames: 12, frameWidth: 80, frameHeight: 80 },
              hurt:{ row: 3, frames: 5, frameWidth: 80, frameHeight: 80 },
              die:{ row: 4, frames: 23, frameWidth: 80, frameHeight: 80 },
            }
          },
          
        ];