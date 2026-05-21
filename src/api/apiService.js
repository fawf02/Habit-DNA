/**
 * Mock API Service with JWT authentication
 * Uses localStorage to persist data between sessions
 */

const JWT_SECRET = 'habit_dna_secret_key_2024';
const TOKEN_KEY = 'habitdna_token';
const USERS_KEY = 'habitdna_users';
const HABITS_KEY = 'habitdna_habits';
const LOGS_KEY = 'habitdna_logs';

/**
 * Simple JWT token generator (for demo purposes)
 */
function generateJWT(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify({ ...payload, iat: Date.now() }));
  const signature = btoa(JWT_SECRET);
  return `${header}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT token
 */
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get current user ID from token
 */
function getCurrentUserId() {
  const token = getAuthToken();
  if (!token) return null;

  const payload = verifyJWT(token);
  return payload?.userId || null;
}

/**
 * Initialize mock data
 */
function initializeMockData() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify({
        user_123: {
          _id: 'user_123',
          email: 'demo@habitdna.io',
          password: 'demo123', // in real app: hashed
          name: 'Demo User',
          createdAt: new Date().toISOString(),
        },
      })
    );
  }

  if (!localStorage.getItem(HABITS_KEY)) {
    localStorage.setItem(HABITS_KEY, JSON.stringify({}));
  }

  if (!localStorage.getItem(LOGS_KEY)) {
    localStorage.setItem(LOGS_KEY, JSON.stringify({}));
  }
}

/**
 * AUTH SERVICE
 */
export const authService = {
  /**
   * Register new user
   */
  register: async (email, password, name) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          initializeMockData();

          const users = JSON.parse(localStorage.getItem(USERS_KEY));

          // Check if user exists
          if (Object.values(users).some((u) => u.email === email)) {
            reject(new Error('User already exists'));
            return;
          }

          const userId = `user_${Date.now()}`;
          const newUser = {
            _id: userId,
            email,
            password, // in real app: hashed
            name,
            createdAt: new Date().toISOString(),
          };

          users[userId] = newUser;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));

          const token = generateJWT({ userId, email });
          localStorage.setItem(TOKEN_KEY, token);

          resolve({
            token,
            user: { _id: userId, email, name },
          });
        } catch (error) {
          reject(error);
        }
      }, 500); // Simulate network delay
    });
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          initializeMockData();

          const users = JSON.parse(localStorage.getItem(USERS_KEY));
          const user = Object.values(users).find((u) => u.email === email);

          if (!user || user.password !== password) {
            reject(new Error('Invalid credentials'));
            return;
          }

          const token = generateJWT({ userId: user._id, email });
          localStorage.setItem(TOKEN_KEY, token);

          resolve({
            token,
            user: { _id: user._id, email, name: user.name },
          });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    const token = getAuthToken();
    if (!token) return null;

    const payload = verifyJWT(token);
    if (!payload?.userId) return null;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const user = users[payload.userId];

    return user
      ? { _id: user._id, email: user.email, name: user.name }
      : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = getAuthToken();
    return !!token && !!verifyJWT(token);
  },
};

/**
 * HABITS SERVICE
 */
export const habitsService = {
  /**
   * Get all habits for current user
   */
  getAll: async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allHabits = JSON.parse(localStorage.getItem(HABITS_KEY) || '{}');
          const userHabits = allHabits[userId] || {};

          resolve(Object.values(userHabits));
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Create new habit
   */
  create: async (habitData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allHabits = JSON.parse(localStorage.getItem(HABITS_KEY) || '{}');
          if (!allHabits[userId]) allHabits[userId] = {};

          const habitId = `habit_${Date.now()}`;
          const newHabit = {
            _id: habitId,
            userId,
            ...habitData,
            createdAt: new Date().toISOString(),
          };

          allHabits[userId][habitId] = newHabit;
          localStorage.setItem(HABITS_KEY, JSON.stringify(allHabits));

          resolve(newHabit);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Update habit
   */
  update: async (habitId, habitData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allHabits = JSON.parse(localStorage.getItem(HABITS_KEY) || '{}');
          const userHabits = allHabits[userId] || {};

          if (!userHabits[habitId]) {
            reject(new Error('Habit not found'));
            return;
          }

          const updatedHabit = {
            ...userHabits[habitId],
            ...habitData,
            _id: habitId,
            userId,
          };

          userHabits[habitId] = updatedHabit;
          allHabits[userId] = userHabits;
          localStorage.setItem(HABITS_KEY, JSON.stringify(allHabits));

          resolve(updatedHabit);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Delete habit
   */
  delete: async (habitId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allHabits = JSON.parse(localStorage.getItem(HABITS_KEY) || '{}');
          const userHabits = allHabits[userId] || {};

          if (!userHabits[habitId]) {
            reject(new Error('Habit not found'));
            return;
          }

          delete userHabits[habitId];
          allHabits[userId] = userHabits;
          localStorage.setItem(HABITS_KEY, JSON.stringify(allHabits));

          resolve({ message: 'Habit deleted' });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },
};

/**
 * LOGS SERVICE
 */
export const logsService = {
  /**
   * Get all logs for current user
   */
  getAll: async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
          const userLogs = allLogs[userId] || {};

          resolve(Object.values(userLogs));
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Create log entry
   */
  create: async (logData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
          if (!allLogs[userId]) allLogs[userId] = {};

          const logId = `log_${Date.now()}`;
          const newLog = {
            _id: logId,
            userId,
            ...logData,
            createdAt: new Date().toISOString(),
          };

          allLogs[userId][logId] = newLog;
          localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));

          resolve(newLog);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Update log entry
   */
  update: async (logId, logData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
          const userLogs = allLogs[userId] || {};

          if (!userLogs[logId]) {
            reject(new Error('Log not found'));
            return;
          }

          const updatedLog = {
            ...userLogs[logId],
            ...logData,
            _id: logId,
            userId,
          };

          userLogs[logId] = updatedLog;
          allLogs[userId] = userLogs;
          localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));

          resolve(updatedLog);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Delete log entry
   */
  delete: async (logId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            reject(new Error('Not authenticated'));
            return;
          }

          const allLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
          const userLogs = allLogs[userId] || {};

          if (!userLogs[logId]) {
            reject(new Error('Log not found'));
            return;
          }

          delete userLogs[logId];
          allLogs[userId] = userLogs;
          localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));

          resolve({ message: 'Log deleted' });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },
};

// Initialize mock data on module load
initializeMockData();
