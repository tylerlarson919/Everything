export interface Goal {
    name: string;
    startTime: string;
    endTime: string;
    description: string;
    emoji: string;
    xp: number;
    coins: number;
    completed: boolean;
  }
  export interface Task {
    name: string;
    startTime: string;
    endTime: string;
    description: string;
    emoji: string;
    xp: number;
    coins: number;
    completed: boolean;
    color: string;
    id: string;
  }
  

  export interface Character {
    id: string;
    class: string;
    name: string;
    folderPath: string;
    stats: {
      damage: number;
      defence: number;
      health: number;
    };
    attack: string;
    attackPath: string;
    specialAbility: string;
    specialAbilityPath: string;
    MoveType: 'walk' | 'run' | 'both';
  }