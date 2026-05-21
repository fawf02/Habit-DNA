import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check } from 'lucide-react';
import HabitRow from '../components/HabitRow';
import HeatmapGrid from '../components/HeatmapGrid';
import CorrelationCard from '../components/CorrelationCard';
import { mockHabits, mockLogs, mockInsights } from '../api/mockData';

/**
 * Calculate streak for a habit (consecutive days completed)
 */
const calculateStreak = (habitId, logs, todayDate) => {
  let streak = 0;
  let currentDate = new Date(todayDate);

  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const log = logs.find((l) => l.habitId === habitId && l.date === dateStr && l.done);

    if (log) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get best streak habit
 */
const getBestStreakHabit = (habits, logs, today) => {
  let bestHabit = null;
  let bestStreak = 0;

  habits.forEach((habit) => {
    const streak = calculateStreak(habit._id, logs, today);
    if (streak > bestStreak) {
      bestStreak = streak;
      bestHabit = habit;
    }
  });

  return { habit: bestHabit, streak: bestStreak };
};

/**
 * Get active habits this week
 */
const getActiveHabitsThisWeek = (logs) => {
  const today = new Date();
  const weekStart = subDays(today, 7);
  const activeHabitIds = new Set();

  logs.forEach((log) => {
    const logDate = new Date(log.date);
    if (logDate >= weekStart && log.done) {
      activeHabitIds.add(log.habitId);
    }
  });

  return activeHabitIds.size;
};

export default function Dashboard() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const displayDate = format(today, 'd MMMM', { locale: ru }).toUpperCase();

  const [habits] = useState(mockHabits);
  const [logs, setLogs] = useState(mockLogs);
  const [insights] = useState(mockInsights);

  /**
   * Toggle habit completion for today
   */
  const toggleHabit = (habitId) => {
    setLogs((prevLogs) => {
      const existingLogIndex = prevLogs.findIndex(
        (log) => log.habitId === habitId && log.date === todayStr
      );

      if (existingLogIndex >= 0) {
        const newLogs = [...prevLogs];
        newLogs[existingLogIndex] = {
          ...newLogs[existingLogIndex],
          done: !newLogs[existingLogIndex].done,
        };
        return newLogs;
      } else {
        return [
          ...prevLogs,
          {
            _id: `log_${todayStr}_${habitId}_${Date.now()}`,
            userId: 'user_123',
            habitId,
            date: todayStr,
            done: true,
            note: '',
            mood: null,
            duration: 0,
          },
        ];
      }
    });
  };

  // Calculate statistics
  const completedToday = logs.filter((log) => log.date === todayStr && log.done).length;
  const totalHabits = habits.length;
  const { habit: bestHabit, streak: bestStreak } = getBestStreakHabit(habits, logs, today);
  const activeThisWeek = getActiveHabitsThisWeek(logs);
  const insightCount = insights.length;

  return (
    <div className="app">
      {/* Top Bar */}
      <div className="topbar">
        <div className="logo">
          <span className="logo-dot" />
          Habit DNA
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {displayDate}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats">
        <div className="stat">
          <div className="stat-label">Активных привычек</div>
          <div className="stat-val">{totalHabits}</div>
          <div className="stat-sub">{activeThisWeek} на этой неделе</div>
        </div>

        <div className="stat">
          <div className="stat-label">Лучший стрик</div>
          <div className="stat-val">{bestStreak} дня</div>
          <div className="stat-sub">
            {bestHabit ? `${bestHabit.icon} ${bestHabit.name}` : 'нет данных'}
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Выполнено сегодня</div>
          <div className="stat-val">{completedToday}/{totalHabits}</div>
          <div className="stat-sub">{totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%</div>
        </div>

        <div className="stat">
          <div className="stat-label">Инсайтов найдено</div>
          <div className="stat-val">{insightCount}</div>
          <div className="stat-sub">паттерна</div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="cols">
        {/* Left Column - Today's Habits */}
        <div className="panel">
          <div className="panel-title">СЕГОДНЯ — {displayDate}</div>

          <div>
            {habits.map((habit) => {
              const currentLog = logs.find(
                (log) => log.habitId === habit._id && log.date === todayStr
              );
              const isDone = currentLog?.done ?? false;
              const streak = calculateStreak(habit._id, logs, today);

              return (
                <div key={habit._id} className="habit-row">
                  <div
                    className="h-icon"
                    style={{
                      backgroundColor: habit.color + '20',
                      color: habit.color,
                    }}
                  >
                    {habit.icon}
                  </div>

                  <div className="h-name">{habit.name}</div>

                  {streak > 0 && (
                    <div className="h-streak" style={{ color: 'var(--color-text-secondary)' }}>
                      {streak} 🔥
                    </div>
                  )}

                  <button
                    onClick={() => toggleHabit(habit._id)}
                    className={`chk ${isDone ? 'done' : ''}`}
                    style={{
                      backgroundColor: isDone ? habit.color : 'transparent',
                      borderColor: isDone ? habit.color : 'var(--color-border-secondary)',
                    }}
                  >
                    {isDone && <Check size={10} color="white" strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>

          <button className="add-btn">+ Добавить привычку</button>
        </div>

        {/* Right Column - Heatmap */}
        <div className="panel">
          <div className="panel-title">HEATMAP — ПОСЛЕДНИЕ 10 НЕДЕЛЬ</div>

          <div>
            {habits.map((habit) => (
              <div key={habit._id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{habit.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    {habit.name}
                  </span>
                </div>

                {/* Mini Heatmap Grid */}
                <div className="heatmap" style={{ fontSize: '11px' }}>
                  {Array(9)
                    .fill(null)
                    .map((_, weekIdx) => (
                      <div key={weekIdx} className="hcol">
                        {Array(7)
                          .fill(null)
                          .map((_, dayIdx) => {
                            const daysBack = 9 * 7 - 1 - (weekIdx * 7 + dayIdx);
                            const cellDate = subDays(today, daysBack);
                            const dateStr = format(cellDate, 'yyyy-MM-dd');
                            const log = logs.find(
                              (l) => l.habitId === habit._id && l.date === dateStr && l.done
                            );

                            return (
                              <div
                                key={`${weekIdx}-${dayIdx}`}
                                className="hcell"
                                style={{
                                  backgroundColor: log ? habit.color : 'var(--color-border-tertiary)',
                                  opacity: log ? 1 : 0.3,
                                }}
                                title={format(cellDate, 'EEE, d MMM', { locale: ru })}
                              />
                            );
                          })}
                      </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', marginTop: '6px', color: 'var(--color-text-secondary)' }}>
                  <span>Меньше</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[0.3, 0.5, 0.7, 1].map((opacity, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '2px',
                          backgroundColor: habit.color,
                          opacity,
                        }}
                      />
                    ))}
                  </div>
                  <span>Больше</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="panel">
          <div className="panel-title">🎯 НАЙДЕННЫЕ ПАТТЕРНЫ!</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '12px',
            }}
          >
            {insights.map((insight) => {
              const habitA = habits.find((h) => h._id === insight.habitA);
              const habitB = habits.find((h) => h._id === insight.habitB);

              if (!habitA || !habitB) return null;

              const correlationPercent = Math.round(Math.abs(insight.correlation) * 100);
              const isPositive = insight.correlation > 0;

              return (
                <div key={insight._id} className="insight-card">
                  <div className="insight-row">
                    <div
                      className="insight-icon"
                      style={{
                        background: correlationPercent >= 70 ? '#d1f4e0' : '#eeedfe',
                        color: correlationPercent >= 70 ? '#059669' : '#7c3aed',
                      }}
                    >
                      {correlationPercent}%
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <div
                          className="insight-icon"
                          style={{
                            width: '20px',
                            height: '20px',
                            background: habitA.color + '20',
                            color: habitA.color,
                            fontSize: '10px',
                          }}
                        >
                          {habitA.icon}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>→</span>
                        <div
                          className="insight-icon"
                          style={{
                            width: '20px',
                            height: '20px',
                            background: habitB.color + '20',
                            color: habitB.color,
                            fontSize: '10px',
                          }}
                        >
                          {habitB.icon}
                        </div>
                      </div>
                      <div className="insight-text">{insight.insight}</div>
                      <div className="corr-label">на основе {insight.sampleSize} дней</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}