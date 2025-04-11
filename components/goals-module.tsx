import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { fetchUserGoals } from "../user_data/collectUdata";
import { Goal } from "../config/types";
import PlusIcon from "@/components/icons/plus"
import { Tooltip } from "@heroui/tooltip";
import { QueryModal } from "@/components/query-modal";

export default function GoalsModule() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState(undefined);
  const prevModalOpenRef = React.useRef(isModalOpen);

  const loadGoals = async () => {
    try {
      const userGoals = await fetchUserGoals();
      setGoals(userGoals);
    } catch (err) {
      console.log("Failed to load goals", err);
    }
  };

  useEffect(() => {
    // Check if modal was just closed (previously open, now closed)
    if (prevModalOpenRef.current === true && isModalOpen === false) {
      loadGoals();
    }
    // Update the ref with current value for next comparison
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);


  useEffect(() => {
      loadGoals();
  }, []);


  const addGoalButton = () => {
    setModalType("addGoal");
    setModalData(undefined); // Use undefined instead of null
    setIsModalOpen(true);
  };

  const editGoalButton = (goal: any) => {
    setModalType("editGoal");
    setModalData(goal);
    setIsModalOpen(true);
  };

  const formatRecurrence = (recurrence: string[]): string => {
    return recurrence.map(day => day.charAt(0)).join(' ');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Card className="w-full h-full bg-transparent shadow-none">
        <CardBody className="w-full p-0">
            <div className="flex flex-row gap-2 items-center justify-between">
                <p className="font-bold text-2xl">Goals</p>
                <Tooltip content="Add Goal" placement="left" className="text-[10px]" offset={-2}>
                    <button onClick={addGoalButton}>
                        <PlusIcon className="text-black dark:text-white w-7 h-7"/>
                    </button>
                </Tooltip>
            </div>
          <ScrollShadow className="flex flex-row gap-4 mt-4 w-full max-h-[540px]">
            {goals.map((goal, index) => (
              <Card key={index} className="w-fit">
                <CardBody className="flex flex-row gap-2 w-full overflow-hidden ">
                  <p className="text-2xl">{goal.emoji}</p>
                  <div className="flex flex-col w-full min-w-0">
                    <div className="flex flex-row justify-start items-center gap-4">
                        <p className="text-[14px] font-bold truncate">{goal.name}</p>
                        <div className="flex flex-row gap-2">
                            <p className="whitespace-nowrap">{goal.xp} ✨</p>
                            <p className="whitespace-nowrap">{goal.coins} 🪙 </p>
                        </div>
                    </div>
                    <p className="truncate text-gray-600 dark:text-gray-400">{goal.description}</p>
                    <p className="truncate font-bold text-gray-600 dark:text-gray-400">{goal.taskId ? goal.taskId.length : 0} Tasks</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </ScrollShadow>
        </CardBody>
      </Card>
      <QueryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        data={modalData}
      />
    </div>
  );
}
