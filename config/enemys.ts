import { Enemy } from './types';
// animation .pngs for all characters is {folderPath}/enemy.png

  export const enemies: Enemy[] = [
    { 
    id: '1', 
    name: 'Skeleton', 
    folderPath: '/characters/enemeys/skeleton', 
    animations: {
        attack_1: { row: 0, frames: 13, frameWidth: 64, frameHeight: 64 },
        die: { row: 1, frames: 13, frameWidth: 90, frameHeight: 64 },
        walk: { row: 2, frames: 12, frameWidth: 90, frameHeight: 64 },
        idle: { row: 3, frames: 4, frameWidth: 90, frameHeight: 64 },
        special: { row: 4, frames: 3, frameWidth: 90, frameHeight: 64 },
    }
    },
    { 
        id: '2', 
        name: 'Golem', 
        folderPath: '/characters/enemeys/golem', 
        animations: {
            idle: { row: 0, frames: 8, frameWidth: 90, frameHeight: 64 },
            walk: { row: 1, frames: 10, frameWidth: 90, frameHeight: 64 },
            attack_1: { row: 2, frames: 11, frameWidth: 90, frameHeight: 64 },
            hurt: { row: 3, frames: 4, frameWidth: 90, frameHeight: 64 },
            die: { row: 4, frames: 13, frameWidth: 90, frameHeight: 64 },
        }
        },        
];