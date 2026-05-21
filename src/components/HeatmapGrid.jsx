import { subDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * HeatmapGrid
 * Displays 9-week activity heatmap for a habit (like GitHub contribution graph)
 * Grid: 7 rows (Mon-Sun) × 9 columns (weeks)
 *
 * @param {string} habitId - Habit ID to filter logs
 * @param {Array} logs - Array of log objects with {habitId, date (YYYY-MM-DD), done}
 * @param {string} habitColor - Hex color for completed days (default: indigo)
 * @param {string} className - Optional CSS classes
 */
export default function HeatmapGrid({ habitId, logs = [], habitColor = '#6366f1', className = '' }) {
  const today = new Date();
  const WEEKS = 9;
  const DAYS_IN_WEEK = 7;
  const TOTAL_DAYS = WEEKS * DAYS_IN_WEEK; // 63 days

  /**
   * Generate grid of dates (9 weeks × 7 days)
   * Returns: Array[weeks][dayOfWeek] = Date object
   */
  const generateDayGrid = () => {
    const startDate = subDays(today, TOTAL_DAYS - 1);
    const grid = [];

    for (let week = 0; week < WEEKS; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < DAYS_IN_WEEK; dayOfWeek++) {
        const daysBack = TOTAL_DAYS - 1 - (week * DAYS_IN_WEEK + dayOfWeek);
        weekDays.push(subDays(today, daysBack));
      }
      grid.push(weekDays);
    }

    return grid;
  };

  /**
   * Check if habit was completed on a specific date
   */
  const isHabitDone = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.some(
      (log) =>
        log.habitId === habitId &&
        log.date === dateStr &&
        log.done === true
    );
  };

  const dayGrid = generateDayGrid();
  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weekLabels = [
    'Неделя 9',
    'Неделя 8',
    'Неделя 7',
    'Неделя 6',
    'Неделя 5',
    'Неделя 4',
    'Неделя 3',
    'Неделя 2',
    'Неделя 1',
  ].reverse();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Header with week labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-8" /> {/* Space for day labels */}
            {weekLabels.map((label, idx) => (
              <div
                key={idx}
                className="w-5 text-xs font-semibold text-gray-600 text-center"
              >
                {idx % 2 === 0 ? label.split(' ')[1] : ''}
              </div>
            ))}
          </div>

          {/* Rows of days */}
          <div className="flex gap-1">
            {/* Day labels column */}
            <div className="flex flex-col gap-1 justify-start pt-0">
              {dayLabels.map((label, idx) => (
                <div
                  key={idx}
                  className="w-8 h-5 text-xs font-medium text-gray-600 flex items-center justify-center"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks grid */}
            <div className="flex gap-1">
              {dayGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date, dayOfWeekIndex) => {
                    const isDone = isHabitDone(date);
                    const dateStr = format(date, 'EEE, d MMM yyyy', { locale: ru });
                    const countLogs = logs.filter(
                      (log) =>
                        log.habitId === habitId &&
                        log.date === format(date, 'yyyy-MM-dd')
                    );
                    const durationStr =
                      countLogs.length > 0 && countLogs[0].duration > 0
                        ? ` • ${countLogs[0].duration} мин`
                        : '';

                    return (
                      <div
                        key={`${weekIndex}-${dayOfWeekIndex}`}
                        className="w-5 h-5 rounded-sm cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-offset-1 hover:ring-gray-400"
                        style={{
                          backgroundColor: isDone ? habitColor : '#e5e7eb',
                          opacity: isDone ? 1 : 0.3,
                        }}
                        title={`${dateStr}${durationStr}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
        <span>Меньше</span>
        <div className="flex gap-1">
          {[0.3, 0.5, 0.7, 1].map((opacity, idx) => (
            <div
              key={idx}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: habitColor,
                opacity,
              }}
            />
          ))}
        </div>
        <span>Больше</span>
      </div>
    </div>
  );
}
