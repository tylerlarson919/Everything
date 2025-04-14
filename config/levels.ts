import { Level } from './types';

  export const levels: Level[] = [
          { 
            id: '1', 
            lvlReq: 1,
            name: 'Glacial Mountains',
            textColor: "dark",
            folderPath: '/levels/base_level_1/Layers/', 
            layerPaths: {
              layer1: "1.png",
              layer2: "2.png",
              layer3: "3.png",
              layer4: "4.png",
              layer5: "floor.png",
            }
          },
          { 
            id: '2', 
            lvlReq: 1,
            name: 'Snowy Mountains',
            textColor: "dark",
            folderPath: '/levels/base_level_2/Layers/', 
            layerPaths: {
              layer1: "1.png",
              layer2: "2.png",
              layer3: "3.png",
              layer4: "4.png",
              layer5: "floor.png",
            }
          },
          { 
            id: '3', 
            lvlReq: 1,
            name: 'Dead Forrest',
            textColor: "light",
            folderPath: '/levels/base_level_3/Layers/', 
            layerPaths: {
              layer1: "1.png",
              layer2: "2.png",
              layer3: "3.png",
              layer4: "4.png",
              layer5: "floor.png",
              layer6: "6.png",
            }
          },
          { 
            id: '4', 
            lvlReq: 2,
            name: 'Windrise forrest',
            textColor: "dark",
            folderPath: '/levels/level_4_Windrise_Valley/', 
            layerPaths: {
              layer1: "1.png",
              layer2: "floor.png",
            }
          },
          { 
            id: '5', 
            lvlReq: 3,
            name: 'Stringstar Fields',
            textColor: "dark",
            folderPath: '/levels/level_5_Stringstar_Fields/', 
            layerPaths: {
              layer1: "1.png",
              layer2: "2.png",
              layer3: "3.png",
              layer4: "4.png",
              layer5: "5.png",
              layer6: "6.png",
              layer7: "7.png",
              layer8: "floor.png",
              layer9: "9.png",
            }
          },
        ];