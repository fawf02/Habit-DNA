import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import StreakBadge from './StreakBadge';

/**
 * HabitRow
 * Single habit row for dashboard with toggle, status, and streak display
 *
 * @param {Object} habit - Habit object with _id, name, icon, color
 * @param {boolean} isDone - Whether habit is completed today
 * @param {number} streak - Current streak count
 * @param {Function} onToggle - Callback function when checkbox is clicked
 * @param {string} className - Optional CSS classes for container
 */
export default function HabitRow({ habit, isDone = false, streak = 0, onToggle, className = '' }) {
  const [isHovering, setIsHovering] = useState(false);

  if (!habit) return null;

  const hexToRgba = (hex, alpha = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleToggle = () => {
    onToggle?.(habit._id);
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-md hover:border-gray-300 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Left: Habit Icon */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-semibold transition-transform duration-200 hover:scale-110"
        style={{
          backgroundColor: hexToRgba(habit.color, 0.15),
          color: habit.color,
        }}
      >
        {habit.icon}
      </div>

      {/* Center: Habit Name and Streak */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{habit.name}</p>
        {streak > 0 && (
          <div className="mt-1">
            <StreakBadge streak={streak} className="text-xs" />
          </div>
        )}
      </div>

      {/* Right: Toggle Checkbox */}
      <button
        onClick={handleToggle}
        className="flex-shrink-0 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: isHovering ? hexToRgba(habit.color, 0.1) : 'transparent',
          focusRingColor: habit.color,
        }}
        aria-label={isDone ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
      >
        {isDone ? (
          <CheckCircle2
            size={24}
            className="transition-all duration-200"
            style={{ color: habit.color }}
            strokeWidth={1.5}
          />
        ) : (
          <Circle
            size={24}
            className="text-gray-400 transition-all duration-200"
            strokeWidth={1.5}
          />
        )}
      </button>
    </div>
  );
}