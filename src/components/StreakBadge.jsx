import { Flame } from 'lucide-react';

/**
 * StreakBadge
 * Displays current streak with a flame icon and count
 * @param {number} streak - Number of consecutive days
 * @param {string} className - Optional CSS classes for container
 */
export default function StreakBadge({ streak = 0, className = '' }) {
  if (streak === 0) return null;

  const getColor = () => {
    if (streak >= 30) return 'from-red-400 to-orange-500';
    if (streak >= 14) return 'from-orange-400 to-yellow-500';
    if (streak >= 7) return 'from-yellow-400 to-amber-500';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${getColor()} text-white text-sm font-bold shadow-md ${className}`}
    >
      <Flame size={16} className="animate-pulse" />
      <span>{streak}</span>
    </div>
  );
}
