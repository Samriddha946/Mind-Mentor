import type { UserStats } from "../contexts/AppContext";

const STATS_KEY = 'mind-mentor-stats';
const LEVEL_BASE_XP = 250;

export const POINTS = {
    TASK_COMPLETE: 50,
    CHAT_MESSAGE: 5,
    IMAGE_GENERATE: 20,
    SPEECH_GENERATE: 15,
    CONTENT_ANALYZE: 25,
    STREAK_BONUS: 25,
    QUIZ_CORRECT: 10,
};

const defaultStats: UserStats = {
    points: 0,
    level: 1,
    tasksCompleted: 0,
    chatMessages: 0,
    contentGenerated: 0,
    currentStreak: 0,
    lastActivityDate: null,
    badges: [],
    mindCoins: 100,
    gamesPlayed: 0,
};

export interface Badge {
    id: string;
    name: string;
    description: string;
    iconName: 'check' | 'sparkles' | 'image' | 'bolt' | 'trophy';
    criteria: (stats: UserStats) => boolean;
}

export const BADGES: Record<string, Badge> = {
    first_step: {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your first task.',
        iconName: 'check',
        criteria: (stats) => stats.tasksCompleted >= 1,
    },
    conversationalist: {
        id: 'conversationalist',
        name: 'Conversationalist',
        description: 'Send 50 chat messages.',
        iconName: 'sparkles',
        criteria: (stats) => stats.chatMessages >= 50,
    },
    creator: {
        id: 'creator',
        name: 'Creator',
        description: 'Generate 10 pieces of content (images/speech).',
        iconName: 'image',
        criteria: (stats) => stats.contentGenerated >= 10,
    },
    week_streak: {
        id: 'week_streak',
        name: 'On Fire!',
        description: 'Maintain a 7-day study streak.',
        iconName: 'bolt',
        criteria: (stats) => stats.currentStreak >= 7,
    },
    high_achiever: {
        id: 'high_achiever',
        name: 'High Achiever',
        description: 'Reach Level 5.',
        iconName: 'trophy',
        criteria: (stats) => stats.level >= 5,
    },
};


// Initialize stats for a new user if they don't exist
export const initializeStats = (): void => {
    if (!localStorage.getItem(STATS_KEY)) {
        localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
    }
};

// Get stats from localStorage
export const getStats = (): UserStats => {
    const statsJson = localStorage.getItem(STATS_KEY);
    if (!statsJson) {
        return defaultStats;
    }
    try {
        const parsedStats = JSON.parse(statsJson);
        if (typeof parsedStats === 'object' && parsedStats !== null) {
            const mergedStats = { ...defaultStats, ...parsedStats };

            // Ensure properties that should be arrays are arrays.
            // This prevents crashes if stored data is corrupted (e.g., badges: null).
            if (!Array.isArray(mergedStats.badges)) {
                mergedStats.badges = defaultStats.badges;
            }

            return mergedStats;
        }
        return defaultStats;
    } catch (error) {
        console.error("Failed to parse stats from localStorage, returning default stats.", error);
        localStorage.removeItem(STATS_KEY);
        return defaultStats;
    }
};

// Save stats to localStorage
const saveStats = (stats: UserStats): void => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const recordActivity = (action: 'task' | 'chat' | 'image' | 'speech' | 'game' | 'analyze', details?: { mindCoins?: number, points?: number }): UserStats => {
    const stats = getStats();
    const today = new Date().toISOString().split('T')[0];

    // 1. Update Streak
    if (stats.lastActivityDate !== today) {
        if (stats.lastActivityDate) {
            const lastDate = new Date(stats.lastActivityDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                stats.currentStreak += 1;
                stats.points += POINTS.STREAK_BONUS * stats.currentStreak; // Bonus points for streak
            } else {
                stats.currentStreak = 1; // Reset streak
            }
        } else {
            stats.currentStreak = 1; // First activity
        }
        stats.lastActivityDate = today;
    }
    
    // 2. Increment Stat and Add Points based on action
    switch (action) {
        case 'task':
            stats.tasksCompleted += 1;
            stats.points += POINTS.TASK_COMPLETE;
            break;
        case 'chat':
            stats.chatMessages += 1;
            stats.points += POINTS.CHAT_MESSAGE;
            break;
        case 'image':
            stats.contentGenerated += 1;
            stats.points += POINTS.IMAGE_GENERATE;
            break;
        case 'speech':
            stats.contentGenerated += 1;
            stats.points += POINTS.SPEECH_GENERATE;
            break;
        case 'analyze':
            stats.contentGenerated += 1;
            stats.points += POINTS.CONTENT_ANALYZE;
            break;
        case 'game':
             stats.gamesPlayed += 1;
             if (details?.mindCoins) stats.mindCoins += details.mindCoins;
             if (details?.points) stats.points += details.points;
             break;
    }

    // 3. Check for Level Up
    const { pointsForNextLevel } = calculateLevelInfo(stats.level);
    if (stats.points >= pointsForNextLevel) {
        stats.level += 1;
    }
    
    // 4. Check for Badges
    Object.values(BADGES).forEach(badge => {
        if (!stats.badges.includes(badge.id) && badge.criteria(stats)) {
            stats.badges.push(badge.id);
            stats.points += 100; // Badge bonus
        }
    });

    saveStats(stats);
    return stats;
};

// Calculate level information
export const calculateLevelInfo = (level: number) => {
    const pointsForCurrentLevel = Math.round(LEVEL_BASE_XP * Math.pow(level - 1, 1.5));
    const pointsForNextLevel = Math.round(LEVEL_BASE_XP * Math.pow(level, 1.5));
    return {
        pointsForCurrentLevel,
        pointsForNextLevel,
        totalPointsForLevel: pointsForNextLevel - pointsForCurrentLevel
    };
};