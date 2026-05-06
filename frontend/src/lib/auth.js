/**
 * Centralized Authentication Utility
 * Single source of truth for all auth operations
 */

const AUTH_KEY = 'auth_session';

/**
 * Save complete auth session to localStorage
 * @param {Object} userData - User data from API
 * @param {string} token - JWT token
 */
export const saveSession = (userData, token) => {
    const session = {
        user: {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'user',
            phone: userData.phone,
            isGoogleUser: userData.isGoogleUser,
            profilePicture: userData.profilePicture
        },
        token: token,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

/**
 * Get complete auth session
 * @returns {Object|null} Session object or null if not authenticated
 */
export const getSession = () => {
    try {
        const sessionStr = localStorage.getItem(AUTH_KEY);
        if (!sessionStr) return null;

        const session = JSON.parse(sessionStr);

        // Check if session expired
        if (session.expiresAt && Date.now() > session.expiresAt) {
            clearSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Error reading session:', error);
        return null;
    }
};

/**
 * Get JWT token
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
    const session = getSession();
    return session?.token || null;
};

/**
 * Get user data
 * @returns {Object|null} User object or null
 */
export const getUser = () => {
    const session = getSession();
    return session?.user || null;
};

/**
 * Clear all auth data
 */
export const clearSession = () => {
    localStorage.removeItem(AUTH_KEY);
    // Also clear old keys for migration
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return getSession() !== null;
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
export const isAdmin = () => {
    const user = getUser();
    return user?.role === 'admin';
};

/**
 * Update user data in session (e.g., after profile update)
 * @param {Object} userData - Updated user data
 */
export const updateUser = (userData) => {
    const session = getSession();
    if (!session) return;

    session.user = {
        ...session.user,
        ...userData
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};
