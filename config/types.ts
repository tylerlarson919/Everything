export interface Habit {
    name: string;
    description: string;
    emoji: string;
    xp: number;
    health: number;
    recurrence: string[];
    formed: boolean;
    id: string;
  }
  export interface HabitLog {
    name: string;
    description: string;
    emoji: string;
    xp: number;
    health: number;
    dueDate: string;
    id: string;
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
    goalId?: string;
  }
  export interface Goal {
    name: string;
    dueDate: string;
    description: string;
    emoji: string;
    xp: number;
    coins: number;
    completed: boolean;
    color: string;
    id: string;
    taskId?: string[];
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

  export interface Player {
    id: string;
    name: string;
    level: number;
    xp: number;
    coins: number;
    characters: Character[];
    currentCharacter: Character | null;
  }