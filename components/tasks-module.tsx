"use client";
import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Task } from "../config/types";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem
} from "@heroui/dropdown";
import { ScrollShadow } from "@heroui/scroll-shadow";
 
import tasks from "../user_data/collectTasks"; // Adjust the path as necessary


const filterDisplayMap: { [key: string]: string } = {
  "today": "today",
  "today-context": "today (context)",
  "tomorrow": "tomorrow"
};

export default function TasksModule() {

  const [selectedFilter, setSelectedFilter] = React.useState("today");

    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Card className="w-full h-full bg-transparent shadow-none">
          <CardBody className="w-full p-0">
            <div className="flex flex-row gap-2">
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
            </div>
            <ScrollShadow className="grid grid-cols-1 gap-4 mt-4 w-full max-h-[540px]">
              {tasks.map((task, index) => (
                <Card key={index} className="w-full">
                  <CardBody className="flex flex-row gap-2 w-full overflow-hidden">
                    <p className="text-2xl">{task.emoji}</p>
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
              ))}
            </ScrollShadow>
          </CardBody>
        </Card>
      </div>
    );
  }