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

  export interface Animation {
    row: number;
    frames: number;
    frameWidth: number;
    frameHeight: number;
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
    specialAbility: string;
    animations: Record<string, Animation>;
  }
  export interface layerPaths {
    layer1: string;
    layer2: string;
    layer3?: string;
    layer4?: string;
    layer5?: string;
    layer6?: string;
    layer7?: string;
    layer8?: string;
    layer9?: string;
    layer10?: string;
  }
  type TextColorOption = "light" | "dark";

  export interface Level {
    id: string;
    lvlReq: number;
    name: string;
    textColor: TextColorOption;
    folderPath: string;
    layerPaths: layerPaths;
  }

  export interface Enemy {
    id: string;
    name: string;
    folderPath: string;
    animations: Record<string, Animation>;
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