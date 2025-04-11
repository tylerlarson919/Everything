"use client";
import React, { useState, useRef } from "react";
import { Button } from "@heroui/button";
import  { Card, CardBody } from "@heroui/card";
import GardenModule from "@/components/garden-module";
export default function TimerModule() {
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const startPauseTimer = () => {
    if (isRunning) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    } else {
      if (!hasStarted) {
        setHasStarted(true);
      }
      timerRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  const endTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    setTime(0);
    setIsRunning(false);
    setHasStarted(false);
  };

  return (
    <Card className="w-full">
      <CardBody className="w-full flex flex-row items-end justify-center relative min-h-[430px] overflow-hidden z-[0] ">
        <div className="absolute top-0 left-0 w-full h-full">
          <GardenModule />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 ">
          <p className="text-4xl font-bold">{formatTime(time)}</p>
          {!hasStarted ? (
            <Button onPress={startPauseTimer}>Start Timer</Button>
          ) : (
            <div className="flex flex-row items-center gap-2">
              <Button onPress={startPauseTimer}>
                {isRunning ? "Pause Timer" : "Resume Timer"}
              </Button>
              <Button onPress={endTimer}>End</Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}