"use client";
import HabitsModule from "@/components/habits-module";
import TasksModule from "@/components/tasks-module";
import StatsModule from "@/components/stats-module";
import GoalsModule from "@/components/goals-module";
import ProtectedRoute from "@/components/ProtectedRoute";

const Home = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4 items-center justify-start min-h-screen">
        <GoalsModule/>
        <div className="flex flex-col md:flex-row gap-4 items-start justify-center h-full items-stretch w-full max-w-[1417px]">
          <div className="w-full md:w-2/3">
            <TasksModule />
          </div>
          <div className="w-full md:w-1/3">
            <HabitsModule />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;
