"use client";
import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/dropdown";
import { ScrollShadow } from "@heroui/scroll-shadow";
import PlusIcon from "@/components/icons/plus"
import { Tooltip } from "@heroui/tooltip";
import { QueryModal } from "@/components/query-modal";
import { useFirestore } from "../config/FirestoreContext";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { usePlayerStore } from "../stores/playerStore";

const filterDisplayMap: { [key: string]: string } = {
  "today": "today",
  "today-context": "today (context)",
  "tomorrow": "tomorrow"
};

export default function TasksModule() {
  const [selectedFilter, setSelectedFilter] = useState("today");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState(undefined);
  const prevModalOpenRef = React.useRef(isModalOpen);
  const { user } = useFirestore();

  // Make sure uncompleteTask is included in the imports
  const { 
    tasks, 
    addTask, 
    completeTask: completePlayerTask,
    uncompleteTask,  // Add this import
    syncToFirebase
  } = usePlayerStore();

  const updateTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      if (completed) {
        // Use the player store to complete the task
        completePlayerTask(taskId);
        
        addToast({
          title: "Are you sure?",
          description: "This cannot be undone later.",
          
          endContent: (
            <div className="flex gap-2">
              <Button color={"primary"} size="sm" variant="bordered" onPress={() => undoCompleteTaskButton(taskId)}>
                No, undo
              </Button>
              <Button aria-label="Close" className="underline-offset-2" color={"primary"} size="sm" variant="light">
                Yes
              </Button>
            </div>
          ),
          color: "primary",
        });
      } else {
        // If we need to undo a completion
        undoCompleteTaskButton(taskId);
      }
    } catch (err) {
      console.error("Failed to update task completion status", err);
    }
  };

  const undoCompleteTaskButton = async (taskId: string) => {
    try {
      uncompleteTask(taskId);  // Use the store method directly
    } catch (err) {
      console.error("Failed to undo task completion", err);
    }
  };

  useEffect(() => {
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  const addTaskButton = () => {
    setModalType("addTask");
    setModalData(undefined);
    setIsModalOpen(true);
  };

  const editTaskButton = (task: any) => {
    setModalType("editTask");
    setModalData(task);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-visable relative z-0">
      <Card className="w-full h-full bg-transparent shadow-none z-first">
        <CardBody className="w-full p-0">
          <div className="flex flex-row gap-2 items-center justify-between">
            <Dropdown>
                <DropdownTrigger>
                  <p className="font-bold text-2xl cursor-pointer">Tasks {selectedFilter}</p>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Filter Options"
                  selectedKeys={selectedFilter}
                  selectionMode="single"
                  onSelectionChange={(selectedKeys) => {
                    const key = Array.from(selectedKeys)[0] as string;
                    const displayValue = filterDisplayMap[key];
                    setSelectedFilter(displayValue);
                  }}
                >
                  <DropdownItem key="today">Today</DropdownItem>
                  <DropdownItem key="today-context">Today (context)</DropdownItem>
                  <DropdownItem key="tomorrow">Tomorrow</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Tooltip content="Add Task" placement="left" className="text-[10px]" offset={-2}>
              <button onClick={addTaskButton}>
                <PlusIcon className="text-black dark:text-white w-7 h-7"/>
              </button>
            </Tooltip>
          </div>
          <ScrollShadow className="grid grid-cols-1 gap-4 mt-4 w-full max-h-[540px]">
            {tasks.map((task, index) => (
              <button key={index + "btn"} onClick={() => editTaskButton(task)}>
                <Card key={index} className="w-full">
                  <CardBody className="flex flex-row gap-2 w-full overflow-hidden">
                    <div className="flex flex-col h-fit items-center gap-1">
                      <p className="text-2xl">{task.emoji}</p>
                      <Checkbox 
                        isSelected={task.completed} 
                        onValueChange={(isChecked) => updateTaskCompletion(task.id, isChecked)}
                        classNames={{
                          base: "p-0 m-0",
                          wrapper: "m-0 p-0",
                        }}
                      >
                      </Checkbox>
                    </div>
                    <div className="flex flex-col w-full min-w-0">
                      <div className="flex flex-row justify-between items-center gap-2">
                          <p className="text-[14px] font-bold truncate">{task.name}</p>
                          <div className="flex flex-row gap-2">
                              <p>{task.xp} ✨</p>
                              <p>{task.coins} 🪙 </p>
                          </div>
                      </div>
                      <p className="truncate text-gray-600 dark:text-gray-400">{task.description}</p>
                      <p className="truncate font-bold text-gray-600 dark:text-gray-400">{task.startTime}</p>
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