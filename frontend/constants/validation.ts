export const VALIDATION = {
  password: { min: 6, max: 128 },
  name: { min: 2, max: 60 },
  boardName: { min: 1, max: 80 },
  boardDescription: { max: 500 },
  taskTitle: { min: 1, max: 120 },
  taskDescription: { max: 2000 },
} as const;
