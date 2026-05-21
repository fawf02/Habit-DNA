import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, LogOut } from 'lucide-react';
import HabitForm from '../components/HabitForm';
import { habitsService, logsService, authService } from '../api/apiService';

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

export default function Dashboard({ onLogout }) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const displayDate = format(today, 'd MMMM', { locale: ru }).toUpperCase();

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load habits and logs on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, logsData] = await Promise.all([
        habitsService.getAll(),
        logsService.getAll(),
      ]);
      setHabits(habitsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setShowHabitForm(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowHabitForm(true);
  };

  const handleSaveHabit = async (habitData) => {
    try {
      setFormLoading(true);

      if (editingHabit) {
        // Update existing habit
        const updated = await habitsService.update(editingHabit._id, habitData);
        setHabits((prev) =>
          prev.map((h) => (h._id === updated._id ? updated : h))
        );
      } else {
        // Create new habit
        const created = await habitsService.create(habitData);
        setHabits((prev) => [...prev, created]);
      }

      setShowHabitForm(false);
      setEditingHabit(null);
    } catch (error) {
      console.error('Failed to save habit:', error);
      alert('Ошибка при сохранении привычки');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm('Вы уверены? Это удалит все логи этой привычки.')) return;

    try {
      await habitsService.delete(habitId);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
      setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
    } catch (error) {
      console.error('Failed to delete habit:', error);
      alert('Ошибка при удалении привычки');
    }
  };

  const handleToggleHabit = async (habitId) => {
    const existingLog = logs.find(
      (log) => log.habitId === habitId && log.date === todayStr
    );

    try {
      if (existingLog) {
        // Toggle existing log
        const updated = await logsService.update(existingLog._id, {
          done: !existingLog.done,
        });
        setLogs((prev) =>
          prev.map((l) => (l._id === updated._id ? updated : l))
        );
      } else {
        // Create new log
        const created = await logsService.create({
          habitId,
          date: todayStr,
          done: true,
        });
        setLogs((prev) => [...prev, created]);
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onLogout?.();
  };

  // Calculate statistics
  const completedToday = logs.filter((log) => log.date === todayStr && log.done).length;
  const totalHabits = habits.length;
  const { habit: bestHabit, streak: bestStreak } = getBestStreakHabit(habits, logs, today);
  const activeThisWeek = getActiveHabitsThisWeek(logs);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-background-tertiary)',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Top Bar */}
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <span style={styles.logoDot} />
          Habit DNA
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {displayDate}
          </div>
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            title="Выйти"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Активных привычек</div>
          <div style={styles.statVal}>{totalHabits}</div>
          <div style={styles.statSub}>{activeThisWeek} на этой неделе</div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statLabel}>Лучший стрик</div>
          <div style={styles.statVal}>{bestStreak} дня</div>
          <div style={styles.statSub}>
            {bestHabit ? `${bestHabit.icon} ${bestHabit.name}` : 'нет данных'}
          </div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statLabel}>Выполнено сегодня</div>
          <div style={styles.statVal}>{completedToday}/{totalHabits}</div>
          <div style={styles.statSub}>{totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%</div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statLabel}>Паттерны анализа</div>
          <div style={styles.statVal}>--</div>
          <div style={styles.statSub}>в разработке</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.cols}>
        {/* Left Column - Today's Habits */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>СЕГОДНЯ — {displayDate}</div>

          <div>
            {habits.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Нет привычек
              </div>
            ) : (
              habits.map((habit) => {
                const currentLog = logs.find(
                  (log) => log.habitId === habit._id && log.date === todayStr
                );
                const isDone = currentLog?.done ?? false;
                const streak = calculateStreak(habit._id, logs, today);

                return (
                  <div key={habit._id} style={styles.habitRow}>
                    <div
                      style={{
                        ...styles.hIcon,
                        backgroundColor: habit.color + '20',
                        color: habit.color,
                      }}
                    >
                      {habit.icon}
                    </div>

                    <div style={styles.hName}>{habit.name}</div>

                    {streak > 0 && (
                      <div style={styles.hStreak}>
                        {streak} 🔥
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleHabit(habit._id)}
                        style={{
                          ...styles.chk,
                          backgroundColor: isDone ? habit.color : 'transparent',
                          borderColor: isDone ? habit.color : 'var(--color-border-secondary)',
                        }}
                      >
                        {isDone && <Check size={10} color="white" strokeWidth={3} />}
                      </button>

                      <button
                        onClick={() => handleEditHabit(habit)}
                        style={styles.editBtn}
                      >
                        ✎
                      </button>

                      <button
                        onClick={() => handleDeleteHabit(habit._id)}
                        style={styles.deleteBtn}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button onClick={handleAddHabit} style={styles.addBtn}>
            + Добавить привычку
          </button>
        </div>

        {/* Right Column - Heatmap */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>HEATMAP — ПОСЛЕДНИЕ 10 НЕДЕЛЬ</div>

          <div>
            {habits.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Добавьте привычку для отслеживания
              </div>
            ) : (
              habits.map((habit) => (
                <div key={habit._id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{habit.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                      {habit.name}
                    </span>
                  </div>

                  {/* Mini Heatmap Grid */}
                  <div style={styles.heatmap}>
                    {Array(9)
                      .fill(null)
                      .map((_, weekIdx) => (
                        <div key={weekIdx} style={styles.hcol}>
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
                                  style={{
                                    ...styles.hcell,
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          habit={editingHabit}
          onSave={handleSaveHabit}
          onClose={() => {
            setShowHabitForm(false);
            setEditingHabit(null);
          }}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}

const styles = {
  app: {
    background: 'var(--color-background-tertiary)',
    padding: '16px',
    borderRadius: 'var(--border-radius-lg)',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  logo: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#534ab7',
  },
  logoutBtn: {
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '6px',
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '14px',
  },
  stat: {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '10px 14px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    marginBottom: '4px',
    fontWeight: '500',
  },
  statVal: {
    fontSize: '20px',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
  },
  statSub: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  cols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  },
  panel: {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '14px',
  },
  panelTitle: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 0',
    borderBottom: '0.5px solid var(--color-border-tertiary)',
  },
  hIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  hName: {
    fontSize: '13px',
    color: 'var(--color-text-primary)',
    flex: 1,
  },
  hStreak: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    fontWeight: '500',
  },
  chk: {
    width: '14px',
    height: '14px',
    borderRadius: '3px',
    border: '0.5px solid var(--color-border-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
  },
  editBtn: {
    width: '14px',
    height: '14px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: '14px',
    height: '14px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#ef4444',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmap: {
    display: 'flex',
    gap: '3px',
  },
  hcol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  hcell: {
    width: '11px',
    height: '11px',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    border: '0.5px dashed var(--color-border-secondary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    background: 'transparent',
    width: '100%',
    marginTop: '8px',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  },
};