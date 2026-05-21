import { useState } from 'react';
import { X } from 'lucide-react';

const HABIT_ICONS = ['🧘', '💪', '📚', '💧', '😴', '🎯', '🏃', '📝', '🥗', '🧠'];
const HABIT_COLORS = [
  '#a78bfa', // purple
  '#fb923c', // orange
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
];

/**
 * HabitForm Modal
 * Create or edit a habit
 *
 * @param {Object} habit - Habit to edit (null for create)
 * @param {Function} onSave - Callback when saved
 * @param {Function} onClose - Callback when closed
 * @param {boolean} isLoading - Loading state
 */
export default function HabitForm({ habit = null, onSave, onClose, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    icon: habit?.icon || '🧘',
    color: habit?.color || '#a78bfa',
    frequency: habit?.frequency || 'daily',
    targetDays: habit?.targetDays || 30,
    reminderTime: habit?.reminderTime || '07:00',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'targetDays' ? parseInt(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectIcon = (icon) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleSelectColor = (color) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (formData.targetDays < 1 || formData.targetDays > 365) {
      newErrors.targetDays = 'Дни должны быть от 1 до 365';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSave?.(formData);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{habit ? 'Редактировать привычку' : 'Новая привычка'}</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name Field */}
          <div style={styles.field}>
            <label style={styles.label}>Название</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Медитация"
              style={{
                ...styles.input,
                borderColor: errors.name ? '#fca5a5' : 'var(--color-border-secondary)',
              }}
            />
            {errors.name && <div style={styles.error}>{errors.name}</div>}
          </div>

          {/* Icon Selector */}
          <div style={styles.field}>
            <label style={styles.label}>Иконка</label>
            <div style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleSelectIcon(icon)}
                  style={{
                    ...styles.iconBtn,
                    background:
                      icon === formData.icon
                        ? 'var(--color-background-secondary)'
                        : 'transparent',
                    border:
                      icon === formData.icon
                        ? '2px solid #534ab7'
                        : '1px solid var(--color-border-secondary)',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div style={styles.field}>
            <label style={styles.label}>Цвет</label>
            <div style={styles.colorGrid}>
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelectColor(color)}
                  style={{
                    ...styles.colorBtn,
                    background: color,
                    border:
                      color === formData.color
                        ? '3px solid var(--color-text-primary)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Частота</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="daily">Ежедневно</option>
                <option value="weekly">Каждую неделю</option>
                <option value="monthly">Каждый месяц</option>
              </select>
            </div>

            {/* Target Days */}
            <div style={styles.field}>
              <label style={styles.label}>Цель, дней</label>
              <input
                type="number"
                name="targetDays"
                value={formData.targetDays}
                onChange={handleChange}
                min="1"
                max="365"
                style={{
                  ...styles.input,
                  borderColor: errors.targetDays ? '#fca5a5' : 'var(--color-border-secondary)',
                }}
              />
              {errors.targetDays && <div style={styles.error}>{errors.targetDays}</div>}
            </div>
          </div>

          {/* Reminder Time */}
          <div style={styles.field}>
            <label style={styles.label}>Напоминание</label>
            <input
              type="time"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Buttons */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.submitBtn,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Сохранение...' : habit ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '10px 12px',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '13px',
    fontFamily: 'var(--font-sans)',
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
  },
  error: {
    fontSize: '12px',
    color: '#991b1b',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  iconBtn: {
    padding: '12px',
    fontSize: '24px',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: 'transparent',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '8px',
  },
  colorBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  buttons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '16px',
  },
  cancelBtn: {
    padding: '12px',
    background: 'var(--color-background-secondary)',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-primary)',
  },
  submitBtn: {
    padding: '12px',
    background: 'linear-gradient(135deg, #534ab7 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-sans)',
  },
};
