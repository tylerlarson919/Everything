import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Goal } from "../config/types";
import { ScrollShadow } from "@heroui/scroll-shadow";
import goals from "../user_data/collectGoals"; // Adjust the path as necessary



export default function GoalsModule() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Card className="w-full h-full">
        <CardBody className="w-full">
          <p className="font-bold text-2xl">Goals</p>
          <ScrollShadow className="grid grid-cols-1 gap-4 mt-4 w-full max-h-[540px]">
            {goals.map((goal, index) => (
              <Card key={index} className="w-full">
                <CardBody className="flex flex-row gap-2 w-full overflow-hidden ">
                  <p className="text-2xl">{goal.emoji}</p>
                  <div className="flex flex-col w-full min-w-0">
                    <div className="flex flex-row justify-between items-center gap-2">
                        <p className="text-[16px] font-bold truncate">{goal.name}</p>
                        <div className="flex flex-row gap-2">
                            <p>{goal.xp} ✨</p>
                            <p>{goal.coins} 🪙 </p>
                        </div>
                    </div>
                    <p className="truncate text-gray-600 dark:text-gray-400">{goal.description}</p>
                    <p className="truncate font-bold text-gray-600 dark:text-gray-400">{goal.dueDate}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
}
