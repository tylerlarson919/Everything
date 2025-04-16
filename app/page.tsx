"use client";
import HabitsModule from "@/components/habits-module";
import TasksModule from "@/components/tasks-module";
import StatsModule from "@/components/stats-module";
import DailyTasksModule from "@/components/daily-tasks";
import ProtectedRoute from "@/components/ProtectedRoute";

const Home = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4 items-center justify-start min-h-screen">
        <div className="w-full h-full flex justify-center">
          <StatsModule />
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start justify-center h-full items-stretch w-full max-w-[1417px] relative z-0">
          <div className="w-full md:w-2/3 relative z-0">
            <TasksModule />
          </div>
          <div className="w-full md:w-1/3">
            <HabitsModule />
          </div>
        </div>
        <DailyTasksModule />
      </div>
    </ProtectedRoute>
  );
};

export default Home;
