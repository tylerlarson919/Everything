import { Enemy } from './types';
// animation .pngs for all characters is {folderPath}/enemy.png

  export const enemies: Enemy[] = [
    { 
    id: '1', 
    name: 'Skeleton', 
    folderPath: '/characters/enemies/skeleton_1', 
    animations: {
        attack_1: { row: 0, frames: 13, frameWidth: 128, frameHeight: 128 },
        die: { row: 1, frames: 13, frameWidth: 128, frameHeight: 128 },
        walk: { row: 2, frames: 12, frameWidth: 128, frameHeight: 128 },
        idle: { row: 3, frames: 4, frameWidth: 128, frameHeight: 128 },
        hurt: { row: 4, frames: 3, frameWidth: 128, frameHeight: 128 },
    }
    },
    { 
        id: '2', 
        name: 'Golem', 
        folderPath: '/characters/enemies/golem', 
        animations: {
            idle: { row: 0, frames: 8, frameWidth: 180, frameHeight: 128 },
            walk: { row: 1, frames: 10, frameWidth: 180, frameHeight: 128 },
            attack_1: { row: 2, frames: 11, frameWidth: 180, frameHeight: 128 },
            hurt: { row: 3, frames: 4, frameWidth: 180, frameHeight: 128 },
            die: { row: 4, frames: 13, frameWidth: 180, frameHeight: 128 },
        }
        },        
];