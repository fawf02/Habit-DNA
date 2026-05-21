// Mock data for Habit DNA
// Imitates MongoDB structure with realistic patterns and correlations

import { subDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';

const userId = 'user_123';
const today = new Date();

// ========================================
// HABITS
// ========================================
export const mockHabits = [
  {
    _id: 'habit_001',
    userId,
    name: 'Медитация',
    icon: '🧘',
    color: '#a78bfa', // purple
    frequency: 'daily',
    targetDays: 30,
    reminderTime: '07:00',
    createdAt: new Date(subDays(today, 60)).toISOString(),
  },
  {
    _id: 'habit_002',
    userId,
    name: 'Тренировка',
    icon: '💪',
    color: '#fb923c', // orange
    frequency: 'weekly',
    targetDays: 4,
    reminderTime: '18:00',
    createdAt: new Date(subDays(today, 45)).toISOString(),
  },
  {
    _id: 'habit_003',
    userId,
    name: 'Чтение',
    icon: '📚',
    color: '#3b82f6', // blue
    frequency: 'daily',
    targetDays: 30,
    reminderTime: '21:00',
    createdAt: new Date(subDays(today, 50)).toISOString(),
  },
];

// ========================================
// LOGS (last 30 days with patterns)
// ========================================
export const mockLogs = (() => {
  const logs = [];
  const habits = mockHabits;

  for (let i = 29; i >= 0; i--) {
    const currentDate = subDays(today, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();

    // Meditation (daily habit, 85% completion rate)
    const meditationDone = Math.random() < 0.85;
    if (meditationDone) {
      logs.push({
        _id: `log_${dateStr}_meditation`,
        userId,
        habitId: 'habit_001',
        date: dateStr,
        done: true,
        note: ['Спокойная сессия', 'Хорошо сосредоточился', 'Трудный день'][Math.floor(Math.random() * 3)],
        mood: Math.floor(Math.random() * 2) + 4, // 4-5
        duration: Math.floor(Math.random() * 5) + 10, // 10-15 min
      });
    } else {
      logs.push({
        _id: `log_${dateStr}_meditation`,
        userId,
        habitId: 'habit_001',
        date: dateStr,
        done: false,
        note: 'Забыл утром',
        mood: null,
        duration: 0,
      });
    }

    // Workout (4 times per week, correlates with meditation)
    // Higher probability if meditation was done
    const workoutProbability = meditationDone ? 0.75 : 0.35;
    const workoutDone = Math.random() < workoutProbability && dayOfWeek !== 0; // skip Sunday
    
    if (workoutDone) {
      logs.push({
        _id: `log_${dateStr}_workout`,
        userId,
        habitId: 'habit_002',
        date: dateStr,
        done: true,
        note: ['Тяжёлая тренировка', 'Лёгкая пробежка', 'Йога', 'HIIT'][Math.floor(Math.random() * 4)],
        mood: Math.floor(Math.random() * 2) + 4,
        duration: Math.floor(Math.random() * 30) + 30, // 30-60 min
      });
    } else {
      logs.push({
        _id: `log_${dateStr}_workout`,
        userId,
        habitId: 'habit_002',
        date: dateStr,
        done: false,
        note: 'Нет времени',
        mood: null,
        duration: 0,
      });
    }

    // Reading (daily habit, 75% completion, correlates with workout)
    // Higher probability if workout was done
    const readingProbability = workoutDone ? 0.85 : 0.72;
    const readingDone = Math.random() < readingProbability;
    
    if (readingDone) {
      logs.push({
        _id: `log_${dateStr}_reading`,
        userId,
        habitId: 'habit_003',
        date: dateStr,
        done: true,
        note: ['Интересная глава', 'Сложный текст', 'Перечитывал'][Math.floor(Math.random() * 3)],
        mood: Math.floor(Math.random() * 2) + 3, // 3-5
        duration: Math.floor(Math.random() * 60) + 20, // 20-80 min
      });
    } else {
      logs.push({
        _id: `log_${dateStr}_reading`,
        userId,
        habitId: 'habit_003',
        date: dateStr,
        done: false,
        note: 'Слишком уставший',
        mood: null,
        duration: 0,
      });
    }
  }

  return logs;
})();

// ========================================
// INSIGHTS (habit correlations)
// ========================================
export const mockInsights = [
  {
    _id: 'insight_001',
    userId,
    habitA: 'habit_001', // Meditation
    habitB: 'habit_002', // Workout
    correlation: 0.72,
    sampleSize: 23, // days where both were tracked
    insight:
      'Когда вы медитируете по утрам, вероятность тренировки повышается на 72%. Медитация помогает сосредоточиться и поднять мотивацию!',
    computedAt: new Date(subDays(today, 2)).toISOString(),
  },
  {
    _id: 'insight_002',
    userId,
    habitA: 'habit_002', // Workout
    habitB: 'habit_003', // Reading
    correlation: 0.58,
    sampleSize: 19,
    insight:
      'После тренировки вы чаще садитесь за книгу. Физическая активность поднимает настроение и улучшает концентрацию для чтения.',
    computedAt: new Date(subDays(today, 2)).toISOString(),
  },
  {
    _id: 'insight_003',
    userId,
    habitA: 'habit_001', // Meditation
    habitB: 'habit_003', // Reading
    correlation: 0.45,
    sampleSize: 25,
    insight: 'Спокойный ум способствует спокойному чтению. Установите медитацию перед вечерним чтением.',
    computedAt: new Date(subDays(today, 1)).toISOString(),
  },
];

// ========================================
// HELPER: Get habit by ID
// ========================================
export const getHabitById = (habitId) => mockHabits.find((h) => h._id === habitId);

// ========================================
// HELPER: Get logs for date range
// ========================================
export const getLogsByDateRange = (startDate, endDate) => {
  return mockLogs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });
};

// ========================================
// HELPER: Get completion stats
// ========================================
export const getCompletionStats = (habitId, days = 30) => {
  const startDate = subDays(today, days);
  const habitLogs = mockLogs.filter(
    (log) =>
      log.habitId === habitId &&
      new Date(log.date) >= startDate &&
      new Date(log.date) <= today
  );

  const completed = habitLogs.filter((log) => log.done).length;
  const total = habitLogs.length;

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    streak: calculateStreak(habitId),
  };
};

// ========================================
// HELPER: Calculate current streak
// ========================================
const calculateStreak = (habitId) => {
  let streak = 0;
  let currentDate = new Date(today);

  while (streak < 30) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const log = mockLogs.find((l) => l.habitId === habitId && l.date === dateStr);

    if (log && log.done) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
};
