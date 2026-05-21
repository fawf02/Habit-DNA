import { ArrowRight } from 'lucide-react';

/**
 * CorrelationCard
 * Displays insight about correlation between two habits
 *
 * @param {Object} insight - Insight object with {habitA, habitB, correlation, insight, sampleSize}
 * @param {Array} habits - Array of all habits to find names and icons
 * @param {string} className - Optional CSS classes
 */
export default function CorrelationCard({ insight, habits = [], className = '' }) {
  if (!insight) return null;

  // Find habit objects
  const habitA = habits.find((h) => h._id === insight.habitA);
  const habitB = habits.find((h) => h._id === insight.habitB);

  if (!habitA || !habitB) return null;

  // Convert correlation (-1..1) to percentage (0..100)
  const correlationPercent = Math.round(Math.abs(insight.correlation) * 100);
  const isPositive = insight.correlation > 0;

  // Determine color based on correlation strength
  const getCorrelationColor = () => {
    if (correlationPercent >= 70) return 'from-emerald-400 to-teal-500';
    if (correlationPercent >= 50) return 'from-blue-400 to-cyan-500';
    if (correlationPercent >= 30) return 'from-amber-400 to-orange-500';
    return 'from-slate-400 to-slate-500';
  };

  const getAccentColor = () => {
    if (correlationPercent >= 70) return 'text-emerald-600 bg-emerald-50';
    if (correlationPercent >= 50) return 'text-blue-600 bg-blue-50';
    if (correlationPercent >= 30) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200 ${className}`}
    >
      {/* Background gradient decoration */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl bg-gradient-to-r ${getCorrelationColor()}`}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Left: Correlation Percentage */}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg font-bold text-xl ${getAccentColor()}`}
        >
          {correlationPercent}%
        </div>

        {/* Center: Main Content */}
        <div className="flex-1 min-w-0">
          {/* Habit Connection */}
          <div className="flex items-center justify-start gap-2 mb-3">
            {/* Habit A */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm"
                style={{
                  backgroundColor: habitA.color + '20',
                  color: habitA.color,
                }}
                title={habitA.name}
              >
                {habitA.icon}
              </div>
              <span className="text-xs text-gray-600 mt-1 text-center max-w-[60px] truncate">
                {habitA.name}
              </span>
            </div>

            {/* Connection Arrow */}
            <div className="flex flex-col items-center px-2">
              <ArrowRight
                size={18}
                className={`${isPositive ? 'text-emerald-500' : 'text-slate-400'}`}
                strokeWidth={2.5}
              />
              <span className="text-xs text-gray-500 font-medium mt-1">
                {isPositive ? '+' : '−'}
              </span>
            </div>

            {/* Habit B */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm"
                style={{
                  backgroundColor: habitB.color + '20',
                  color: habitB.color,
                }}
                title={habitB.name}
              >
                {habitB.icon}
              </div>
              <span className="text-xs text-gray-600 mt-1 text-center max-w-[60px] truncate">
                {habitB.name}
              </span>
            </div>
          </div>

          {/* Insight Text */}
          <p className="text-sm text-gray-700 leading-relaxed mb-2">{insight.insight}</p>

          {/* Sample Size */}
          <p className="text-xs text-gray-500">
            на основе {insight.sampleSize} дн{
              insight.sampleSize % 10 === 1 && insight.sampleSize % 100 !== 11
                ? 'я'
                : 'ей'
            }
          </p>
        </div>
      </div>

      {/* Subtle border accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getCorrelationColor()}`}
        style={{ opacity: 0.3 }}
      />
    </div>
  );
}
