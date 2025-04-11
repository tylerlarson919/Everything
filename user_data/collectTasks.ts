import { Task } from "../config/types";

const tasks: Task[] = [
  {
    name: "Learn React",
    startTime: "2025-04-10T09:00:00.000",
    endTime: "2025-04-10T11:30:00.000",
    description: "Master the fundamentals of React for modern web development and this is some extra text.",
    emoji: "💻",
    xp: 5,
    coins: 20,
    completed: false,
    color: "green",
    id: "1",
  },
  {
    name: "Build Portfolio",
    startTime: "2025-04-10T13:00:00.000",
    endTime: "2025-04-10T15:00:00.000",
    description: "Create a portfolio website to showcase projects and skills.",
    emoji: "💻",
    xp: 15,
    coins: 20,
    completed: true,
    color: "blue",
    id: "2",

  },
  {
    name: "Deploy Project",
    startTime: "2025-04-10T14:30:00.000",
    endTime: "2025-04-10T18:00:00.000",
    description: "Deploy the project on a cloud platform.",
    emoji: "🔥",
    xp: 50,
    coins: 20,
    completed: false,
    color: "blue",
    id: "3",

  },
  // Add more tasks as needed
];

export default tasks;