"use client";
import React from 'react';
import tasks from "../user_data/collectTasks";

// Define a Task interface
interface Task {
    id: string; // Assuming id is a string
    name: string;
    completed: boolean;
    startTime: string; // Assuming startTime is a string
    endTime: string;  // Assuming endTime is a string
    color: string;
}

// Helper function to calculate duration
const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const duration = (end.getTime() - start.getTime()) / 60000; // Duration in minutes
    return `${duration} min`;
};

export default function StatsModule() {
    const [value, setValue] = React.useState(100);

    return (
        <div className="flex justify-center items-center ">
            <div className="p-4 w-full max-w-[1417px]">
                <h2 className="text-xl font-bold mb-4 text-center">Daily task</h2>
                <div className="relative">
                    <div className="absolute left-4 top-0 h-full border-l-2 border-purple-500"></div>
                    {tasks.map((task: Task, index: number) => (
                        <div key={index} className="mb-8 pl-12 relative">
                            <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">{task.startTime}</span>
                            </div>
                            <div className={`p-4 rounded-lg shadow-md ${task.color}`}>
                                <h3 className="font-semibold">{task.name}</h3>
                                <p className="text-sm">{task.completed ? 'Completed' : 'Pending'}</p>
                                <div className="flex items-center mt-2">
                                    <div className="flex -space-x-2">
                                        <div key={task.id} className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                            {task.id}
                                        </div>
                                    </div>
                                    <span className="ml-4 text-xs">{calculateDuration(task.startTime, task.endTime)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}