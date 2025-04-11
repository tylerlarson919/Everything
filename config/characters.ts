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
            attackPath : '/characters/Homeless/Homeless_2/attack.png',
            specialAbility: 'Run Away',
            specialAbilityPath: '/characters/Homeless/Homeless_2/special.png', 
            MoveType: 'both',
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
            attackPath : '/characters/Homeless/Homeless_1/attack.png',
            specialAbility: 'Super Chug',
            specialAbilityPath: '/characters/Homeless/Homeless_1/special.png',
            MoveType: 'both',
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
            attackPath : '/characters/Raiders/Raider_3/attack.png',
            specialAbility: 'Beat to a Pulp',
            specialAbilityPath: '/characters/Raiders/Raider_3/special.png',
            MoveType: 'both',
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
            attackPath : '/characters/Raiders/Raider_1/attack.png',
            specialAbility: 'Pump with Lead',
            specialAbilityPath : '/characters/Raiders/Raider_1/special.png',
            MoveType: 'both',
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
            attackPath : '/characters/Raiders/Raider_2/attack.png',
            specialAbility: 'Gorilla Warefare',
            specialAbilityPath:'/characters/Raiders/Raider_2/shot_2.png',
            MoveType: 'both',
          },
          
          
        ];