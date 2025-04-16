"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Task } from "../config/types";
import { fetchUserTasks } from "../user_data/collectUdata";
import RefreshIcon from './icons/refresh';
import { QueryModal } from "@/components/query-modal";

export default function DailyTaskView() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [modalData, setModalData] = useState(undefined);
    const prevModalOpenRef = React.useRef(isModalOpen);


    useEffect(() => {
      // Check if modal was just closed (previously open, now closed)
      if (prevModalOpenRef.current === true && isModalOpen === false) {
        loadTasks();
      }
      // Update the ref with current value for next comparison
      prevModalOpenRef.current = isModalOpen;
    }, [isModalOpen]);

    const loadTasks = async () => {
      try {
        const userTasks = await fetchUserTasks();
        setTasks(userTasks);
      } catch (err) {
        console.log("Failed to load tasks", err);
      }
    };
    
    useEffect(() => {    
      loadTasks();
    }, []);
  // Format ISO date string to time format (12:30pm)
  const formatTimeDisplay = (isoString: string): string => {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for midnight
    
    // Add leading zero to minutes if needed
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes}${ampm}`;
  };
  
  // Get hours and minutes from ISO string for position calculation
  const getTimeComponents = (isoString: string): { hours: number, minutes: number } => {
    const date = new Date(isoString);
    return {
      hours: date.getHours(),
      minutes: date.getMinutes()
    };
  };

  // Helper function to calculate the current time position
const calculateCurrentTimePosition = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Increase height per hour to 64px
    return (hours * 64) + ((minutes / 60) * 64 + 16);
  };

  // Helper function to check if a task is for the current day
const isTaskForToday = (task: Task): boolean => {
    const taskDate = new Date(task.startTime);
    const today = new Date();
    
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  };

  
  // Helper function to calculate position based on time
  const calculateTimePosition = (isoString: string): number => {
    const date = new Date(isoString);
    
    // Get hours and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Increase height per hour to 64px
    return (hours * 64) + ((minutes / 60) * 64 + 16);
  };
  
  // Helper function to calculate duration in minutes
  const calculateDuration = (startTimeIso: string, endTimeIso: string): number => {
    const startDate = new Date(startTimeIso);
    const endDate = new Date(endTimeIso);
    
    // Duration in milliseconds, convert to minutes
    return Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000));
  };
  
  // Helper function to format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  
  // Format today's date as "Day, M/D"
  const formatTodayDate = (): string => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[today.getDay()];
    const month = today.getMonth() + 1; // getMonth is 0-indexed
    const date = today.getDate();
    
    return `${day}, ${month}/${date}`;
  };

  const calculateTaskHeight = (startTimeIso: string, endTimeIso: string): number => {
    const durationMinutes = calculateDuration(startTimeIso, endTimeIso);
    // 16px for every 15 mins, with a minimum of 16px
    const heightPixels = Math.max(16, (durationMinutes / 15) * 16);
    return heightPixels;
  };
  
  // Scroll to current time when component mounts
  useEffect(() => {
    if (timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Calculate percentage through the day
      const percentageOfDay = (currentHour * 60 + currentMinute) / 1440;
      
      // Calculate scroll position (minus some offset to position current time in middle)
      const scrollPosition = (timelineRef.current.scrollHeight * percentageOfDay) - 
                             (timelineRef.current.clientHeight / 2);
      
      timelineRef.current.scrollTop = scrollPosition;
    }
  }, []);
  
  // Generate hour labels
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const displayHour = hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour-12}pm` : `${hour}am`;
    
    return (
      <div key={hour} className="relative h-16">
        <div className="absolute -left-3 -top-2 text-xs text-gray-500 z-10">{displayHour}</div>
        <div className="absolute left-[29px] top-0 w-full h-[1px] bg-white/10"></div>
      </div>
    );
  });

  return (
    <div className="dark:bg-[#18181b] rounded-xl shadow-lg p-4 w-full max-w-[1417px] min-h-[700px] mx-auto z-0">
      <div className='flex flex-row justify-start items-center pb-2 gap-2'>
        <h2 className="text-xl font-bold">Daily Tasks - {formatTodayDate()}</h2>
        <button onClick={loadTasks}>
          <RefreshIcon className='w-6 h-6 text-black dark:text-white'/>
        </button>
      </div>
      <div 
        ref={timelineRef}
        className="relative h-[650px] overflow-y-auto overflow-x-hidden pr-4 pt-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Timeline base */}
        <div className="absolute left-11 top-4 bottom-0 w-[1px] bg-white/10 h-[1536px] rounded-full"></div>
        
        {/* Hour markers */}
        <div className="ml-4">
          {hourMarkers}
        </div>

        {/* Current time indicator */}
        <div 
        className="absolute left-11 w-full h-[1px] bg-purple-500"
        style={{ top: `${calculateCurrentTimePosition()}px` }}
        >
        <div className="absolute -left-3 -top-[5px] w-3 h-3 bg-purple-500 rounded-full"></div>
        </div>
        
        {/* Tasks */}
        <div className="absolute left-0 top-0 w-full px-4">
    {tasks.filter(isTaskForToday).map((task: Task, index: number) => {
        const topPosition = calculateTimePosition(task.startTime);
        const duration = calculateDuration(task.startTime, task.endTime);
        const taskHeight = calculateTaskHeight(task.startTime, task.endTime);

        // Precompute the task status
        const taskStatus = task.completed ? 
            { text: "✓ Completed", className: "text-green-600" } : 
            { text: "Pending", className: "text-gray-600 dark:text-gray-400" };

        return (
            <div 
            key={index} 
            className="absolute left-12 right-0"
            style={{ 
                top: `${topPosition}px`,
                height: `${taskHeight}px` 
                }}
            >
            <div
            className={`p-3 rounded-lg shadow-md border border-[#18181b] h-full flex flex-col justify-between w-4/5 backdrop-blur-xl ${
                task.color === 'red' ? 'bg-[#8e2122]' :
                task.color === 'blue' ? 'bg-[#1f3e83]' :
                task.color === 'green' ? 'bg-[#176c37]' :
                'bg-gray-700' // Fallback color
            }`}
            >
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm">{task.name}</h3>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTimeDisplay(task.startTime)} - {formatTimeDisplay(task.endTime)}
                </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                <span className={`text-xs font-medium  ${taskStatus.className}`}>
                    {taskStatus.text}
                </span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{formatDuration(duration)}</span>
                </div>
            </div>
            </div>
        );
        })}
        </div>
      </div>
    </div>
  );
}