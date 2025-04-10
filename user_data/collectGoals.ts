import { Goal } from "../config/types";

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const goals: Goal[] = [
  {
    name: "Learn React",
    startTime: randomDate(new Date("2025-04-01"), new Date("2025-04-05")).toISOString(),
    endTime: randomDate(new Date("2025-04-06"), new Date("2025-04-10")).toISOString(),
    description: "Master the fundamentals of React for modern web development and this is some extra text.",
    emoji: "💻",
    xp: 5,
    coins: 20,
    completed: Math.random() < 0.5,
  },
  {
    name: "Build Portfolio",
    startTime: randomDate(new Date("2025-04-01"), new Date("2025-04-05")).toISOString(),
    endTime: randomDate(new Date("2025-04-06"), new Date("2025-04-10")).toISOString(),
    description: "Create a portfolio website to showcase projects and skills.",
    emoji: "💻",
    xp: 15,
    coins: 20,
    completed: Math.random() < 0.5,
  },
  {
    name: "Deploy Project",
    startTime: randomDate(new Date("2025-04-01"), new Date("2025-04-05")).toISOString(),
    endTime: randomDate(new Date("2025-04-06"), new Date("2025-04-10")).toISOString(),
    description: "Deploy the project on a cloud platform.",
    emoji: "🔥",
    xp: 50,
    coins: 20,
    completed: Math.random() < 0.5,
  },
];

export default goals;