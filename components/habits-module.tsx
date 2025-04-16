import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { fetchUserHabits } from "../user_data/collectUdata";
import { Habit } from "../config/types";
import PlusIcon from "@/components/icons/plus"
import { Tooltip } from "@heroui/tooltip";
import { QueryModal } from "@/components/query-modal";
import {Checkbox } from "@heroui/checkbox";

export default function HabitsModule() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState(undefined);
  const prevModalOpenRef = React.useRef(isModalOpen);
  const [isCompletedSelected, setIsCompletedSelected] = React.useState(false);

  const loadHabits = async () => {
    try {
      const userHabits = await fetchUserHabits();
      console.log("fetched user habits", userHabits);
      setHabits(userHabits);
    } catch (err) {
      console.log("Failed to load habits", err);
    }
  };
  
  useEffect(() => {
    // Check if modal was just closed (previously open, now closed)
    if (prevModalOpenRef.current === true && isModalOpen === false) {
      loadHabits();
    }
    // Update the ref with current value for next comparison
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  useEffect(() => { 
    loadHabits();
  }, []);


  const formatRecurrence = (recurrence: string[]): string => {
    return recurrence.map(day => day.charAt(0)).join(' ');
  };

  const addHabitButton = () => {
    setModalType("addHabit");
    setModalData(undefined); // Use undefined instead of null
    setIsModalOpen(true);
  };

  const editHabitButton = (habit: any) => {
    setModalType("editHabit");
    setModalData(habit);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center z-first relative">
      <Card className="w-full h-full bg-transparent shadow-none">
        <CardBody className="w-full p-0">
          <div className="flex flex-row gap-2 items-center justify-between">
            <p className="font-bold text-2xl">Habits</p>
            <Tooltip content="Add Habit" placement="left" className="text-[10px]" offset={-2}>
              <button onClick={addHabitButton}>
                <PlusIcon className="text-black dark:text-white w-7 h-7"/>
              </button>
            </Tooltip>
          </div>
          <ScrollShadow className="grid grid-cols-1 gap-4 mt-4 w-full max-h-[540px]">
            {habits.map((habit, index) => (
              <button key={index + "btn"} onClick={() => editHabitButton(habit)}>
                <Card key={index} className="w-full cursor-pointer">
                  <CardBody className="flex flex-row gap-2 w-full overflow-hidden ">
                    <div className="flex flex-col h-fit items-center gap-1">
                      <p className="text-2xl">{habit.emoji}</p>
                      <Checkbox 
                        isSelected={isCompletedSelected} 
                        onValueChange={setIsCompletedSelected}
                        classNames={{
                          base: "p-0 m-0",
                          wrapper: "m-0 p-0",
                        }}
                      >
                      </Checkbox>
                    </div>  
                    <div className="flex flex-col w-full min-w-0">
                      <div className="flex flex-row justify-between items-center gap-2">
                          <p className="text-[14px] font-bold truncate">{habit.name}</p>
                          <div className="flex flex-row gap-2">
                              <p className="whitespace-nowrap">{habit.xp} ✨</p>
                              <p className="whitespace-nowrap">{habit.health} ❤️ </p>
                          </div>
                      </div>
                      <p className="truncate text-gray-600 dark:text-gray-400">{habit.description}</p>
                      <p className="truncate font-bold text-gray-600 dark:text-gray-400">{formatRecurrence(habit.recurrence)}</p>
                    </div>
                  </CardBody>
                </Card>
              </button>
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
