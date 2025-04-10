import GoalsModule from "@/components/goals-module";
import TasksModule from "@/components/tasks-module";
import StatsModule from "@/components/stats-module";
import DailyTasksModule from "@/components/daily-tasks";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 items-center justify-start min-h-screen">
      <div className="w-full h-full flex justify-center">
        <StatsModule />
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-start justify-center h-full items-stretch">
        <div className="w-full md:w-2/3">
          <TasksModule />
        </div>
        <div className="w-full md:w-1/3">
          <GoalsModule />
        </div>
      </div>
      <DailyTasksModule />
    </div>
  );
}
