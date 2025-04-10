"use client";
import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Goal } from "../config/types";
import { Image } from "@heroui/image";
import ProgressBar from "@/components/progress-bar";
import HealthBar from "@/components/health-bar";
import {Tooltip} from "@heroui/tooltip";
import {Badge} from "@heroui/badge";
import TimerModule from "@/components/timer-module";

export default function StatsModule() {
    const [totalCoins, setTotalCoins] = React.useState(100);
    const [currentLevel, setCurrentLevel] = React.useState(1);
  
    return (
      <div className="w-full h-full flex flex-row items-center justify-start gap-4 max-w-[1417px]">
        <Card className="w-full h-full max-w-[746px] min-w-[535px]">
          <CardBody className="w-full flex flex-row items-start relative min-h-[430px] overflow-hidden z-[0]">
            <div className="absolute right-0 bottom-0 w-auto z-[1]">
              <Image
                alt="User Avatar"
                className="w-auto h-[350px]"
                isBlurred
                src="/avatar-test.png"
              />
            </div>
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 w-64">
              {/* XP Bar with icon and value */}
              <div className="flex items-center gap-2">
                <div className="bg-blue-900/70 rounded-full p-1.5 shadow-glow-blue">
                  <span className="text-lg">✨</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-medium text-blue-300">XP</span>
                    <span className="text-xs font-bold text-blue-200">
                      50/100
                    </span>
                  </div>
                  <Tooltip content="50/100 XP">
                    <div className="flex w-full">
                      <ProgressBar percent={50} />
                    </div>
                  </Tooltip>
                </div>
              </div>
  
              {/* Health Bar with icon and value */}
              <div className="flex items-center gap-2">
                <div className="bg-red-900/70 rounded-full p-1.5 shadow-glow-red">
                  <span className="text-lg">❤️</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-medium text-red-300">
                      HEALTH
                    </span>
                    <span className="text-xs font-bold text-red-200">95/100</span>
                  </div>
                  <Tooltip content="95/100" placement="bottom">
                    <div className="flex w-full">
                      <HealthBar percent={95} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-6 w-fit md:w-[380px] absolute bottom-8 left-0 z-[2]">
                <div className="flex flex-row gap-2 items-end relative">
                  <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    Clove
                  </p>
                  <p className="font-bold pb-1">
                    lvl ${currentLevel}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 flex gap-2 pb-1 absolute right-0">
                    Playtime:{" "}
                    <span className="font-semibold">568H</span>
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-5 max-w-[400px]">
                    <Tooltip placement="bottom" content="# of goals accomplished.">
                        <div className="flex flex-col gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Goals
                            </p>
                            <p className="text-2xl font-bold">3</p>
                        </div>
                    </Tooltip>
                    <Tooltip placement="bottom" content="# of missions completed.">
                        <div className="flex flex-col gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Missions
                            </p>
                            <p className="text-2xl font-bold">35</p>
                        </div>
                    </Tooltip>
                    <Tooltip placement="bottom" content="Avg. # of missions completed per day.">
                        <div className="flex flex-col gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Comp/R
                            </p>
                                <p className="text-2xl font-bold">3.5</p>
                        </div>
                    </Tooltip>
                    <Tooltip content="# of habits formed.">
                        <div className="flex flex-col gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Formed
                            </p>
                                <p className="text-2xl font-bold">4</p>
                        </div>
                    </Tooltip>
                    <Tooltip content="# of habits completed.">
                        <div className="flex flex-col gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Habits
                            </p>
                            <p className="text-2xl font-bold">20</p>
                        </div>
                    </Tooltip>
                    <Tooltip content="Avg. # of habits completed per day.">
                        <div className="flex flex-col gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Comp/R
                            </p>
                            <p className="text-2xl font-bold">1.4</p>
                        </div>
                    </Tooltip>
                </div>
              </div>
            <div className="flex flex-row gap-4 absolute top-6 right-6 z-[10]">
              <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
                <span className="font-bold text-xl text-amber-800 dark:text-amber-200">
                  {totalCoins}
                </span>
                <span className="text-xl">🪙</span>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
                <span className="font-bold text-xl text-blue-800 dark:text-blue-200">
                  lvl {currentLevel}
                </span>
                <span className="text-xl">✨</span>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="w-full">
            <CardBody className="w-full flex flex-row items-center relative min-h-[430px] overflow-hidden z-[0] ">
                <TimerModule />
            </CardBody>
        </Card>
      </div>
    );
  }
  